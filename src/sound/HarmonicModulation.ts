import React from "react";
import { HarmonicShape } from "../utils/KnownHarmonicShapes";
import { NoteSet, normalizeToSingleOctave, useHomeNote, useNoteSet, useSetHomeNote, useUpdateNoteSet } from "./NoteProvider";

function getModulatedNotes(notes: Set<number>, semitones: number) {
    return Array.from(notes).map(note => (note + semitones + 12) % 12);//Do I want to do the modulus here?
}

export function useModulateActiveNotes() {
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const updateNotes = useUpdateNoteSet();
    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();
    
    return React.useCallback((semitones: number, notes?: Set <number>) => {
        const affectedNotes = notes ?? new Set<number>(activeNotes);
        const unaffectedNotes = new Set<number>(Array.from(activeNotes).filter(note => !affectedNotes.has(note)));
        if (homeNote != null && affectedNotes.has(homeNote)){
                setHomeNote(normalizeToSingleOctave(homeNote + semitones));
        }
        updateNotes(NoteSet.Active, [...unaffectedNotes, ...getModulatedNotes(affectedNotes, semitones)], true, true);
    }, [activeNotes, homeNote, setHomeNote, updateNotes])
}

export function useGetActiveNotesInCommonWithModulation() {
    const activeNotes = useNoteSet(NoteSet.Active).notes;
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

export function useShapeToNoteArray() {
    return React.useCallback((shape: HarmonicShape, startingWhere: number) => {
        let noteArr: number[] = [];
        shape.notes.forEach((note, i) => {
            if (note[0]) noteArr.push(i + startingWhere);
        });
        return noteArr;
    }, []);
}

export function useSetActiveShape() {
    const updateNotes = useUpdateNoteSet();
    const shapeToNoteArray = useShapeToNoteArray();
    return React.useCallback((shape: HarmonicShape, startingWhere: number) => {
        const shapeArr = shapeToNoteArray(shape, startingWhere);
        updateNotes(NoteSet.Active, shapeArr, true, true);
        return shapeArr;
    }, [shapeToNoteArray, updateNotes]);
}
