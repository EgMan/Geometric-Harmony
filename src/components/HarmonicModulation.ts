import React from "react";
import { useActiveNotes, useSetAreNotesActive } from "./NoteProvider";
import { HarmonicShape } from "./KnownHarmonicShapes";


export function useModulateActiveNotes()
{
    const activeNotes = useActiveNotes();
    const setAreNotesActive = useSetAreNotesActive();
    return React.useCallback((semitones: number) => {
        let newActiveNotes: number[] = [];
        activeNotes.forEach(note => newActiveNotes.push(note+semitones));//Do I want to do the modulus here?
        setAreNotesActive(newActiveNotes, true, true);
   }, [activeNotes, setAreNotesActive])
}

export function useSetActiveShape()
{
    const setAreNotesActive = useSetAreNotesActive();
    return React.useCallback((shape: HarmonicShape, startingWhere: number) => {
        let newActiveNotes: number[] = [];
        shape.notes.forEach((note, i) =>{
            if (note[0]) newActiveNotes.push(i+startingWhere)//Do I want to do the modulus here?
        });
        setAreNotesActive(newActiveNotes, true, true);
        return newActiveNotes;
    }, [setAreNotesActive]);
}
