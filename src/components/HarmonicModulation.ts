import React from "react";
import { useActiveNotes, useSetAreNotesActive } from "./NoteProvider";
import { HarmonicShape } from "./KnownHarmonicShapes";

function getModulatedNotes(activeNotes: Set<number>, semitones: number) {
    return Array.from(activeNotes).map(note => (note + semitones) % 12);//Do I want to do the modulus here?
}

export function useModulateActiveNotes() {
    const activeNotes = useActiveNotes();
    const setAreNotesActive = useSetAreNotesActive();
    return React.useCallback((semitones: number) => {
        setAreNotesActive(getModulatedNotes(activeNotes, semitones), true, true);
    }, [activeNotes, setAreNotesActive])
}

export function useGetActiveNotesInCommonWithModulation() {
    const activeNotes = useActiveNotes();
    return React.useCallback((semitones: number) => {
        const newActiveNotes = getModulatedNotes(activeNotes, semitones);
        // let notesInCommon: number[] = [];
        let notesInCommon = new Set<number>();
        newActiveNotes.forEach((note, i) => {
            if (activeNotes.has(note)) notesInCommon.add(note);
        });
        console.log(semitones, activeNotes, newActiveNotes, notesInCommon);
        return notesInCommon;
    }, [activeNotes]);
}

export function useSetActiveShape() {
    const setAreNotesActive = useSetAreNotesActive();
    return React.useCallback((shape: HarmonicShape, startingWhere: number) => {
        let newActiveNotes: number[] = [];
        shape.notes.forEach((note, i) => {
            if (note[0]) newActiveNotes.push(i + startingWhere)//Do I want to do the modulus here?
        });
        setAreNotesActive(newActiveNotes, true, true);
        return newActiveNotes;
    }, [setAreNotesActive]);
}
