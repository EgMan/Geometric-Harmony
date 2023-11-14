import useKeypressPlayer from './KeypressPlayer';
import React from 'react';
import { getNote, getNoteMIDI, usePrevious } from '../utils/Utils';
import { NoteChannel, NoteSet, normalizeToSingleOctave, useNoteSet, useNotesOfType, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote, useConnectToMidi } from './MIDIInterface';
import { Input, NoteMessageEvent, WebMidi } from "webmidi";
import * as Tone from 'tone';
import { useSettings } from '../view/SettingsProvider';

export type SpeakerSoundType = "AMSynth";

const synthContext = React.createContext<Tone.PolySynth | null>(null);
const synthOutContext = React.createContext<Tone.ToneAudioNode | null>(null);

type Props = {
    children: JSX.Element
}

function SoundEngine(props: Props) {
    useKeypressPlayer();

    const updateNotes = useUpdateNoteSet();

    const [notesPressedFromMidi, setNotesPressedFromMidi] = React.useState(new Map<string, Set<number>>());

    const onMidiInputNoteOn = React.useCallback((input: Input, e: NoteMessageEvent) => {
        const deviceID = input.name;
        const noteon = midiNoteToProgramNote(e.note.number, e.note.octave);
        const notesPressedFromMidiByDevice = notesPressedFromMidi.get(deviceID) ?? new Set();

        if (!notesPressedFromMidiByDevice.has(noteon)) {
            notesPressedFromMidiByDevice.add(noteon);
            setNotesPressedFromMidi(prev => new Map(prev.set(deviceID, notesPressedFromMidiByDevice)));
            updateNotes(playingInputChannelName(deviceID), Array.from(notesPressedFromMidiByDevice), true, true, new Set([NoteSet.PlayingInput]), "blue");
            return;
        }
    }, [notesPressedFromMidi, updateNotes]);

    const onMidiInputNoteOff = React.useCallback((input: Input, e: NoteMessageEvent) => {
        const deviceID = input.name;
        const noteoff = midiNoteToProgramNote(e.note.number, e.note.octave);
        const notesPressedFromMidiByDevice = notesPressedFromMidi.get(deviceID) ?? new Set();
        if (notesPressedFromMidiByDevice.has(noteoff)) {
            notesPressedFromMidiByDevice.delete(noteoff);
            setNotesPressedFromMidi(prev => new Map(prev.set(deviceID, notesPressedFromMidiByDevice)));
            updateNotes(playingInputChannelName(deviceID), Array.from(notesPressedFromMidiByDevice), true, true, new Set([NoteSet.PlayingInput]));
            return;
        }
    }, [notesPressedFromMidi, updateNotes]);

    const onMidiConnect = React.useCallback(() => {
        WebMidi.inputs.forEach(input => {
            input.addListener("noteon", e => onMidiInputNoteOn(input, e));
            input.addListener("noteoff", e => onMidiInputNoteOff(input, e));
        });
    }, [onMidiInputNoteOff, onMidiInputNoteOn]);
    useConnectToMidi(onMidiConnect);

    const { synth, output } = React.useMemo(() => {
        // Tone.setContext(new AudioContext({ sampleRate: 96000 }))
        const reverb = new Tone.Reverb({
            decay: 1.25,
            wet: 0.75,
        });
        const filter = new Tone.Filter({
            frequency: 75000,
            type: "lowpass",
            gain: 0,
            Q: 10,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: 55,
            mid: 20,
            high: 0,
            lowFrequency: 2500,
            highFrequency: 20000,
        });
        const gain = new Tone.Gain(
            {
                gain: 1.1,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: 3.5,
            threshold: -90,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 } });
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, output: compressor };
    }, []);

    const settings = useSettings();
    const isMuted = settings?.isMuted ?? false;
    const prioritizeMIDIAudio = settings?.prioritizeMIDIAudio ?? false;
    React.useEffect(() => {
        synth.volume.value = isMuted ? -Infinity : 1;
    }, [isMuted, synth.volume]);

    const updateSynth = React.useCallback((notesTurnedOn: [NoteChannel, number][], notesTurnedOff: [NoteChannel, number][]) => {
        synth.triggerAttack(notesTurnedOn.map(note => getNote(note[1])))
        synth.triggerRelease(notesTurnedOff.map(note => getNote(note[1])))
    }, [synth]);

    const updateMIDIOutWithFiltering = React.useCallback((notesTurnedOn: [NoteChannel, number][], notesTurnedOff: [NoteChannel, number][]) => {
        WebMidi.outputs.forEach(output => {
            let notesTurnedOnFiltered = notesTurnedOn.filter(elem => elem[0].name !== playingInputChannelName(output.name));
            let notesTurnedOffFiltered = notesTurnedOff.filter(elem => elem[0].name !== playingInputChannelName(output.name));

            // When priotizing MIDI audio over synchronization with visuals,
            // MIDI events are sent directly to devices, and do not go through the channel system first.
            // In this case, we shouldn't be sending MIDI events from the channel system.
            if (prioritizeMIDIAudio) {
                notesTurnedOnFiltered = notesTurnedOnFiltered.filter(elem => !elem[0].channelTypes.has(NoteSet.MIDIFileInput));
                notesTurnedOffFiltered = notesTurnedOffFiltered.filter(elem => !elem[0].channelTypes.has(NoteSet.MIDIFileInput));
            }

            output.sendNoteOff(notesTurnedOffFiltered.map(note => getNoteMIDI(note[1])), { channels: 1 });
            output.sendNoteOn(notesTurnedOnFiltered.map(note => getNoteMIDI(note[1])), { channels: 1 });
        });
    }, [prioritizeMIDIAudio]);

    useExecuteOnPlayingNoteStateChange((notesTurnedOn, notesTurnedOff) => {
        updateSynth(notesTurnedOn, notesTurnedOff);
        updateMIDIOutWithFiltering(notesTurnedOn, notesTurnedOff);
    });
    return <synthContext.Provider value={synth}>
        <synthOutContext.Provider value={output}>
            {props.children}
        </synthOutContext.Provider>
    </synthContext.Provider>
}
export default SoundEngine;

export function useSynth() {
    const synth = React.useContext(synthContext);
    return synth;
}

export function useSynthOut() {
    const synthOut = React.useContext(synthOutContext);
    return synthOut;
}

export function useExecuteOnPlayingNoteStateChange(callback: (notesTurnedOn: [NoteChannel, number][], notesTurnedOff: [NoteChannel, number][], playingNotes: [NoteChannel, number][]) => void) {
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const notesToPlayWhenActive = useNotesOfType(NoteSet.Emphasized, NoteSet.Emphasized_OctaveGnostic);
    const notesToPlayRegardless = useNotesOfType(NoteSet.KeypressInput, NoteSet.MIDIFileInput, NoteSet.PlayingInput);
    const channelsToPlay = React.useMemo(() => {
        return Array.from(notesToPlayWhenActive).filter(note => activeNotes.has(normalizeToSingleOctave(note[1]))).concat(Array.from(notesToPlayRegardless));
    }, [activeNotes, notesToPlayRegardless, notesToPlayWhenActive]);
    useExecuteOnArrStateChange<[NoteChannel, number]>(channelsToPlay, callback, (a: [NoteChannel, number], b: [NoteChannel, number]) => a[0].name === b[0].name && a[1] === b[1]);
}

function useExecuteOnArrStateChange<T>(arr: T[], callback: (turnedOn: T[], turnedOff: T[], current: T[]) => void, equality: (a: T, b: T) => boolean = (a, b) => a === b) {
    const previousArr = usePrevious<T[]>(arr, []);
    React.useEffect(() => {
        const notesturnedoff = previousArr.filter(prevArrElem => !arr.some(arrElem => equality(prevArrElem, arrElem)));
        const notesturnedon = arr.filter(arrElem => !previousArr.some(prevArrElem => equality(prevArrElem, arrElem)));
        callback(notesturnedon, notesturnedoff, arr);
    }, [arr, callback, equality, previousArr]);
}

export function playingInputChannelName(id: string) {
    return NoteSet.PlayingInput + "_" + id;
}
