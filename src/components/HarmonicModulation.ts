import React from "react";
import { HarmonicShape } from "./KnownHarmonicShapes";
import { NoteSet, normalizeToSingleOctave, useHomeNote, useNoteSet, useSetHomeNote, useUpdateNoteSet } from "./NoteProvider";

function getModulatedNotes(activeNotes: Set<number>, semitones: number) {
    return Array.from(activeNotes).map(note => (note + semitones) % 12);//Do I want to do the modulus here?
}

export function useModulateActiveNotes() {
    const activeNotes = useNoteSet()(NoteSet.Active);
    const updateNotes = useUpdateNoteSet();
    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();
    
    return React.useCallback((semitones: number) => {
        if (homeNote !== undefined && homeNote !== null) {
            setHomeNote(normalizeToSingleOctave(homeNote + semitones));
        }
        updateNotes(NoteSet.Active, getModulatedNotes(activeNotes, semitones), true, true);
    }, [activeNotes, homeNote, setHomeNote, updateNotes])
}

export function useGetActiveNotesInCommonWithModulation() {
    const activeNotes = useNoteSet()(NoteSet.Active);
    return React.useCallback((semitones: number) => {
        const newActiveNotes = getModulatedNotes(activeNotes, semitones);
        // let notesInCommon: number[] = [];
        let notesInCommon = new Set<number>();
        newActiveNotes.forEach((note, i) => {
            if (activeNotes.has(note)) notesInCommon.add(note);
        });
        return notesInCommon;
    }, [activeNotes]);
}

export function useSetActiveShape() {
    const updateNotes = useUpdateNoteSet();
    return React.useCallback((shape: HarmonicShape, startingWhere: number) => {
        let newActiveNotes: number[] = [];
        console.log("shapename", shape.name);
        shape.notes.forEach((note, i) => {
            if (note[0]) newActiveNotes.push(i + startingWhere)//Do I want to do the modulus here?
        });
        updateNotes(NoteSet.Active, newActiveNotes, true, true);
        return newActiveNotes;
    }, [updateNotes]);
}
