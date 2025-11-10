import React from "react";
import { HarmonicShape } from "../utils/KnownHarmonicShapes";
import { NoteSet, normalizeToSingleOctave, useHomeNote, useNoteBank, useNoteSet, useSetHomeNote, useUpdateNoteSet } from "./NoteProvider";
import { useActiveNoteBank } from "../utils/NotesetBank";

function getModulatedNotes(notes: Set<number>, semitones: number) {
    return Array.from(notes).map(note => (note + semitones + 12) % 12);//Do I want to do the modulus here?
}

export function useModulateActiveNotes() {
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const updateNotes = useUpdateNoteSet();
    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();
    const noteBank = useNoteBank();
    
    return React.useCallback((semitones: number, notes?: Set <number>) => {
        const affectedNotes = notes ?? new Set<number>(activeNotes);
        const unaffectedNotes = new Set<number>(Array.from(activeNotes).filter(note => !affectedNotes.has(note)));
        if (homeNote != null && affectedNotes.has(homeNote)){
                setHomeNote(normalizeToSingleOctave(homeNote + semitones));
        }
        updateNotes(NoteSet.Active, [...unaffectedNotes, ...getModulatedNotes(affectedNotes, semitones)], true, true);

        // If selecting specific notes, only modulate active notes.  
        // Notebanks are unaffected by this operation.
        if (notes) return;

        noteBank.set!(prevNoteBank => {
        const newNoteBank = {...prevNoteBank};
        for (let noteBankEntry of newNoteBank.entries) {
            noteBankEntry.homeNote = normalizeToSingleOctave(noteBankEntry.homeNote ?? 0 + semitones);
            noteBankEntry.activeNotes = getModulatedNotes(new Set(noteBankEntry.activeNotes), semitones);
        }
        return newNoteBank;
        });
    }, [activeNotes, homeNote, noteBank.set, setHomeNote, updateNotes])
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

export function shapeToNoteArray(shape: HarmonicShape, startingWhere: number) {
        let noteArr: number[] = [];
        shape.notes.forEach((note, i) => {
            if (note[0]) noteArr.push(i + startingWhere);
        });
        return noteArr;
}

export function useSetActiveShape() {
    const updateNotes = useUpdateNoteSet();
    return React.useCallback((shape: HarmonicShape, startingWhere: number) => {
        const shapeArr = shapeToNoteArray(shape, startingWhere);
        updateNotes(NoteSet.Active, shapeArr, true, true);
        return shapeArr;
    }, [updateNotes]);
}
