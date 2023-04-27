import useKeypressPlayer from './KeypressPlayer';
import React from 'react';
import { getNote, getNoteMIDI, usePrevious } from '../utils/Utils';
import { NoteSet, normalizeToSingleOctave, useNoteSet } from './NoteProvider';
import { useConnectToMidi } from './MIDIInterface';
import { WebMidi } from "webmidi";
import * as Tone from 'tone';

function useSoundEngine() {
    useKeypressPlayer();
    useConnectToMidi();
    const synth = React.useMemo(() => {
        return new Tone.PolySynth(Tone.AMSynth).toDestination();
    }, []);
    useExecuteOnPlayingNoteStateChange((notesTurnedOn, notesTurnedOff) => {
        synth.triggerAttack(notesTurnedOn.map(note => getNote(note)))
        synth.triggerRelease(notesTurnedOff.map(note => getNote(note)))

        WebMidi.outputs.forEach(output => {
            output.sendNoteOff(notesTurnedOff.map(note => getNoteMIDI(note)));
            output.sendNoteOn(notesTurnedOn.map(note => getNoteMIDI(note)));
        });
    });
    return null;
}
export default useSoundEngine;

export function useExecuteOnPlayingNoteStateChange(callback: (notesTurnedOn: number[], notesTurnedOff: number[]) => void) {
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
        callback(notesturnedon, notesturnedoff);
    }, [callback, playingNotes, previousPlayingNotes]);
}
