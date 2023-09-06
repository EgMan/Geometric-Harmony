import useKeypressPlayer from './KeypressPlayer';
import React from 'react';
import { getNote, getNoteMIDI, usePrevious } from '../utils/Utils';
import { NoteSet, normalizeToSingleOctave, useNoteSet, useUpdateNoteSet } from './NoteProvider';
import { useConnectToMidi } from './MIDIInterface';
import { WebMidi } from "webmidi";
import * as Tone from 'tone';
import { useSettings } from '../view/SettingsProvider';

function useSoundEngine() {
    useKeypressPlayer();
    const [notesPressedFromMidi, setNotesPressedFromMidi] = React.useState(new Set<number>());
    const onMidiConnect = React.useCallback(() => {
        WebMidi.inputs.forEach(input => {
            input.addListener("noteon", e => {
                const noteon = midiNoteToProgramNote(e.note.number, e.note.octave);
                if (!notesPressedFromMidi.has(noteon)) {
                    notesPressedFromMidi.add(noteon);
                    setNotesPressedFromMidi(new Set(notesPressedFromMidi));
                    return;
                }
            });
            input.addListener("noteoff", e => {
                const noteoff = midiNoteToProgramNote(e.note.number, e.note.octave);
                if (notesPressedFromMidi.has(noteoff)) {
                    notesPressedFromMidi.delete(noteoff);
                    setNotesPressedFromMidi(new Set(notesPressedFromMidi));
                    return;
                }
            });
        });
    }, [notesPressedFromMidi]);
    useConnectToMidi(onMidiConnect);
    const updateNotes = useUpdateNoteSet();
    const synth = React.useMemo(() => {
        return new Tone.PolySynth(Tone.AMSynth).toDestination();
    }, []);

    const settings = useSettings();
    const isMuted = settings?.isMuted ?? false;
    React.useEffect(() => {
        synth.volume.value = isMuted ? -Infinity : 0;
    }, [isMuted, synth.volume]);

    const midiNoteToProgramNote = (midiNote: number, octaveNumber: number) => {
        return normalizeToSingleOctave(midiNote) + (12 * (octaveNumber - 3))
    }

    React.useEffect(() => {
        updateNotes(NoteSet.PlayingInput, Array.from(notesPressedFromMidi), true, true);
    }, [notesPressedFromMidi, updateNotes]);

    const updateSynth = React.useCallback((notesTurnedOn: number[], notesTurnedOff: number[]) => {
        synth.triggerAttack(notesTurnedOn.map(note => getNote(note)))
        synth.triggerRelease(notesTurnedOff.map(note => getNote(note)))
    }, [synth]);

    const updateMIDIOut = React.useCallback((notesTurnedOn: number[], notesTurnedOff: number[]) => {
        WebMidi.outputs.forEach(output => {
            output.sendNoteOff(notesTurnedOff.map(note => getNoteMIDI(note)));
            output.sendNoteOn(notesTurnedOn.map(note => getNoteMIDI(note)));
        });
    }, []);

    const inputNotes = Array.from(useNoteSet()(NoteSet.PlayingInput));
    useExecuteOnArrStateChange(inputNotes, (notesTurnedOn, notesTurnedOff) => {
        updateSynth(notesTurnedOn, notesTurnedOff);
        updateMIDIOut(notesTurnedOn, notesTurnedOff);
    });

    useExecuteOnPlayingNoteStateChange((notesTurnedOn, notesTurnedOff) => {
        updateSynth(notesTurnedOn, notesTurnedOff);
        updateMIDIOut(notesTurnedOn, notesTurnedOff);
    });
    return null;
}
export default useSoundEngine;

export function useExecuteOnPlayingNoteStateChange(callback: (notesTurnedOn: number[], notesTurnedOff: number[], playingNotes: number[]) => void) {
    const activeNotes = useNoteSet()(NoteSet.Active);
    const emphasizedNotes = useNoteSet()(NoteSet.Emphasized);
    const emphasizedNotesOctaveGnostic = useNoteSet()(NoteSet.Emphasized_OctaveGnostic);
    const playingNotes = React.useMemo(() => {
        return Array.from(emphasizedNotes).concat(Array.from(emphasizedNotesOctaveGnostic)).filter(note => activeNotes.has(normalizeToSingleOctave(note)));
    }, [activeNotes, emphasizedNotes, emphasizedNotesOctaveGnostic]);
    const previousPlayingNotes = usePrevious<number[]>(playingNotes, []);
    React.useEffect(() => {
        const notesturnedoff = previousPlayingNotes.filter(note => !playingNotes.includes(note));
        const notesturnedon = playingNotes.filter(note => !previousPlayingNotes.includes(note));
        callback(notesturnedon, notesturnedoff, playingNotes);
    }, [callback, playingNotes, previousPlayingNotes]);
}

export function useExecuteOnArrStateChange(arr: number[], callback: (turnedOn: number[], turnedOff: number[], current: number[]) => void) {
    const previousArr = usePrevious<number[]>(arr, []);
    React.useEffect(() => {
        const notesturnedoff = previousArr.filter(elem => !arr.includes(elem));
        const notesturnedon = arr.filter(elem => !previousArr.includes(elem));
        callback(notesturnedon, notesturnedoff, arr);
    }, [arr, callback, previousArr]);
}
