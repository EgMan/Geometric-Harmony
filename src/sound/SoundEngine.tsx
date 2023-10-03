import useKeypressPlayer from './KeypressPlayer';
import React from 'react';
import { getNote, getNoteMIDI, usePrevious } from '../utils/Utils';
import { NoteChannel, NoteSet, normalizeToSingleOctave, useNoteSet, useNotesOfType, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote, useConnectToMidi } from './MIDIInterface';
import { Input, NoteMessageEvent, WebMidi } from "webmidi";
import * as Tone from 'tone';
import { useSettings } from '../view/SettingsProvider';

export type SpeakerSoundType = "AMSynth";

function useSoundEngine() {
    useKeypressPlayer();

    const updateNotes = useUpdateNoteSet();

    const [notesPressedFromMidi, setNotesPressedFromMidi] = React.useState(new Map<string, Set<number>>());
    // const setNotesPressedFromSpecificDevice = React.useCallback((device: string, notes: number[]) => {

    const onMidiNoteOn = React.useCallback((input: Input, e: NoteMessageEvent) => {
        const device = input.name;
        const noteon = midiNoteToProgramNote(e.note.number, e.note.octave);
        const notesPressedFromMidiByDevice = notesPressedFromMidi.get(device) ?? new Set();

        if (!notesPressedFromMidiByDevice.has(noteon)) {
            notesPressedFromMidiByDevice.add(noteon);
            setNotesPressedFromMidi(prev => new Map(prev.set(device, notesPressedFromMidiByDevice)));
            updateNotes(playingInputChannelName(device), Array.from(notesPressedFromMidiByDevice), true, true, new Set([NoteSet.PlayingInput]), "blue");
            return;
        }
    }, [notesPressedFromMidi, updateNotes]);

    const onMidiNoteOff = React.useCallback((input: Input, e: NoteMessageEvent) => {
        const device = input.name;
        const noteoff = midiNoteToProgramNote(e.note.number, e.note.octave);
        const notesPressedFromMidiByDevice = notesPressedFromMidi.get(device) ?? new Set();
        if (notesPressedFromMidiByDevice.has(noteoff)) {
            notesPressedFromMidiByDevice.delete(noteoff);
            setNotesPressedFromMidi(prev => new Map(prev.set(device, notesPressedFromMidiByDevice)));
            updateNotes(playingInputChannelName(device), Array.from(notesPressedFromMidiByDevice), true, true, new Set([NoteSet.PlayingInput]));
            return;
        }
    }, [notesPressedFromMidi, updateNotes]);

    const onMidiConnect = React.useCallback(() => {
        WebMidi.inputs.forEach(input => {
            input.addListener("noteon", e => onMidiNoteOn(input, e));
            input.addListener("noteoff", e => onMidiNoteOff(input, e));
            // input.addListener("noteon", e => {
            //     const device = input.name;
            //     const noteon = midiNoteToProgramNote(e.note.number, e.note.octave);
            //     const notesPressedFromMidiByDevice = notesPressedFromMidi.get(device) ?? new Set();

            //     if (!notesPressedFromMidiByDevice.has(noteon)) {
            //         notesPressedFromMidiByDevice.add(noteon);
            //         // setNotesPressedFromMidi(prev => new Map(prev).set(device, notesPressedFromMidiByDevice));
            //         return;
            //     }
            // });
            // input.addListener("noteoff", e => {
            //     const device = input.name;
            //     const noteoff = midiNoteToProgramNote(e.note.number, e.note.octave);
            //     const notesPressedFromMidiByDevice = notesPressedFromMidi.get(device) ?? new Set();
            //     console.log("noteoff ahhh", noteoff, notesPressedFromMidi, device);
            //     if (notesPressedFromMidiByDevice.has(noteoff)) {
            //         notesPressedFromMidiByDevice.delete(noteoff);
            //         setNotesPressedFromMidi(prev => new Map(prev).set(device, notesPressedFromMidiByDevice));
            //         return;
            //     }
            // });
        });
    }, [onMidiNoteOff, onMidiNoteOn]);
    useConnectToMidi(onMidiConnect);
    const synth = React.useMemo(() => {
        return new Tone.PolySynth(Tone.AMSynth).toDestination();
    }, []);

    const settings = useSettings();
    const isMuted = settings?.isMuted ?? false;
    React.useEffect(() => {
        synth.volume.value = isMuted ? -Infinity : 0;
    }, [isMuted, synth.volume]);

    React.useEffect(() => {
        // updateNotes(NoteSet.PlayingInput, Array.from(notesPressedFromMidi), true, true);
        // notesPressedFromMidi.forEach((notes, device) => {
        //     updateNotes(playingInputChannelName(device), Array.from(notes), true, true, new Set([NoteSet.PlayingInput]));
        // });
    }, [notesPressedFromMidi, updateNotes]);

    const updateSynth = React.useCallback((notesTurnedOn: [NoteChannel, number][], notesTurnedOff: [NoteChannel, number][]) => {
        synth.triggerAttack(notesTurnedOn.map(note => getNote(note[1])))
        synth.triggerRelease(notesTurnedOff.map(note => getNote(note[1])))
    }, [synth]);

    // const updateMIDIOut = React.useCallback((notesTurnedOn: number[], notesTurnedOff: number[]) => {
    //     WebMidi.outputs.forEach(output => {
    //         // output.channels[-1].sendNoteOff(notesTurnedOff.map(note => getNoteMIDI(note)),);
    //         // output.channels[-1].sendNoteOn(notesTurnedOn.map(note => getNoteMIDI(note)));
    //     });
    // }, []);

    const updateMIDIOutFilteringSelfInput = React.useCallback((notesTurnedOn: [NoteChannel, number][], notesTurnedOff: [NoteChannel, number][]) => {
        WebMidi.outputs.forEach(output => {
            const notesTurnedOnFilteringSelfInput = notesTurnedOn.filter(elem => elem[0].name !== playingInputChannelName(output.name));
            const notesTurnedOffFilteringSelfInput = notesTurnedOff.filter(elem => elem[0].name !== playingInputChannelName(output.name));
            output.sendNoteOff(notesTurnedOffFilteringSelfInput.map(note => getNoteMIDI(note[1])), { channels: 2 });
            output.sendNoteOn(notesTurnedOnFilteringSelfInput.map(note => getNoteMIDI(note[1])), { channels: 2 });
        });
    }, []);

    useExecuteOnPlayingNoteStateChange((notesTurnedOn, notesTurnedOff) => {
        updateSynth(notesTurnedOn, notesTurnedOff);
        updateMIDIOutFilteringSelfInput(notesTurnedOn, notesTurnedOff);
    });
    return null;
}
export default useSoundEngine;

export function useExecuteOnPlayingNoteStateChange(callback: (notesTurnedOn: [NoteChannel, number][], notesTurnedOff: [NoteChannel, number][], playingNotes: [NoteChannel, number][]) => void) {
    const activeNotes = useNoteSet()(NoteSet.Active).notes;
    const notesToPlayWhenActive = useNotesOfType(NoteSet.Emphasized, NoteSet.Emphasized_OctaveGnostic);
    const notesToPlayRegardless = useNotesOfType(NoteSet.MIDIFileInput, NoteSet.PlayingInput);
    const channelsToPlay = React.useMemo(() => {
        return Array.from(notesToPlayWhenActive).filter(note => activeNotes.has(normalizeToSingleOctave(note[1]))).concat(Array.from(notesToPlayRegardless));
    }, [activeNotes, notesToPlayRegardless, notesToPlayWhenActive]);
    useExecuteOnArrStateChange<[NoteChannel, number]>(channelsToPlay, callback, (a: [NoteChannel, number], b: [NoteChannel, number]) => a[0].name === b[0].name && a[1] === b[1]);
}

function useExecuteOnArrStateChange<T>(arr: T[], callback: (turnedOn: T[], turnedOff: T[], current: T[]) => void, equality: (a: T, b: T) => boolean = (a, b) => a === b) {
    const previousArr = usePrevious<T[]>(arr, []);
    React.useEffect(() => {
        // const notesturnedoff = previousArr.filter(elem => !arr.includes(elem));
        // const notesturnedon = arr.filter(elem => !previousArr.includes(elem));
        const notesturnedoff = previousArr.filter(prevArrElem => !arr.some(arrElem => equality(prevArrElem, arrElem)));
        const notesturnedon = arr.filter(arrElem => !previousArr.some(prevArrElem => equality(prevArrElem, arrElem)));
        callback(notesturnedon, notesturnedoff, arr);
    }, [arr, callback, equality, previousArr]);
}

export function playingInputChannelName(device: string) {
    return NoteSet.PlayingInput + "_" + device;
}
