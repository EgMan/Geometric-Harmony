import useKeypressPlayer from './KeypressPlayer';
import React from 'react';
import { getNote, getNoteMIDI, usePrevious } from './Utils';
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

    const activeNotes = useNoteSet()(NoteSet.Active);
    const emphasizedNotes = useNoteSet()(NoteSet.Emphasized);
    const emphasizedNotesOctaveGnostic = useNoteSet()(NoteSet.Emphasized_OctaveGnostic);
    const playingNotes = Array.from(emphasizedNotes).concat(Array.from(emphasizedNotesOctaveGnostic)).filter(note => activeNotes.has(normalizeToSingleOctave(note)));
    const previousPlayingNotes = usePrevious<number[]>(playingNotes, []);

    React.useEffect(() => {
        const notesturnedoff = previousPlayingNotes.filter(note => !playingNotes.includes(note));
        const notesturnedon = playingNotes.filter(note => !previousPlayingNotes.includes(note));

        synth.triggerAttack(notesturnedon.map(note => getNote(note)))
        synth.triggerRelease(notesturnedoff.map(note => getNote(note)))

        WebMidi.outputs.forEach(output => {
            output.sendNoteOff(notesturnedoff.map(note => getNoteMIDI(note)));
            output.sendNoteOn(notesturnedon.map(note => getNoteMIDI(note)));
        });
    }, [playingNotes, previousPlayingNotes]);
    return null;
}
export default useSoundEngine;