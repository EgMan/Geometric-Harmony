import React from 'react';
import { NoteSet, useHomeNote, useNoteBank, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import { CHORD_DOMINANT7, CHORD_HALFDIMINISHED7, CHORD_MAJOR7, CHORD_MINOR7, SCALE_BLUES, SCALE_CHROMATIC, SCALE_NATURAL, SCALE_WHOLETONE } from './KnownHarmonicShapes';
import { emitSnackbar } from './Utils';
import { shapeToNoteArray } from '../sound/HarmonicModulation';

type NoteBankEntry = {
    activeNotes: number[],
    homeNote: number | null,
}

export type NoteBank = {
    name: string,
    activeIndex: number,
    entries: NoteBankEntry[],
}

export const INITIAL_ACTIVE_NOTES: number[] = [0, 2, 3, 5, 7, 9, 10]
export const INITIAL_HOME_NOTE: number = 10;

export const DefaultNoteBank: NoteBank = {
    name: "Default",
    activeIndex: 0,
    entries: [
        // Entry #0 is the default bank entry loaded on startup. 
        /*0*/ { activeNotes: INITIAL_ACTIVE_NOTES, homeNote: INITIAL_HOME_NOTE },
        /*1*/ { activeNotes: shapeToNoteArray(CHORD_MAJOR7, 10), homeNote: 10 },
        /*2*/ { activeNotes: shapeToNoteArray(CHORD_MINOR7, 0), homeNote: 0 },
        /*3*/ { activeNotes: shapeToNoteArray(CHORD_MINOR7, 2), homeNote: 2 },
        /*4*/ { activeNotes: shapeToNoteArray(CHORD_MAJOR7, 3), homeNote: 3 },
        /*5*/ { activeNotes: shapeToNoteArray(CHORD_DOMINANT7, 5), homeNote: 5 },
        /*6*/ { activeNotes: shapeToNoteArray(CHORD_MINOR7, 7), homeNote: 7 },
        /*7*/ { activeNotes: shapeToNoteArray(CHORD_HALFDIMINISHED7, 9), homeNote: 9 },
        /*8*/ { activeNotes: shapeToNoteArray(CHORD_DOMINANT7, 0), homeNote: 10 },
        /*9*/ { activeNotes: shapeToNoteArray(SCALE_CHROMATIC, 0), homeNote: 0 },
    ],
};

export function useActiveNoteBank() {
    const noteBank = useNoteBank();

    const updateNotes = useUpdateNoteSet();
    const setHomeNote = useSetHomeNote();
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const homeNote = useHomeNote();

    const swapBank = React.useCallback((index: number) => {
        if (index === noteBank.get.activeIndex) {
            return true;
        }
        if (index < 0) {
            index = noteBank.get.entries.length - 1;
        } else if (index >= noteBank.get.entries.length) {
            index = 0;
        }

        noteBank.set!((prev) => {

            // const newBank = [...prev];
            const newBank = prev;
            const activeNotesArr = Array.from(activeNotes);
            newBank.entries[prev.activeIndex] = { activeNotes: activeNotesArr, homeNote };
            newBank.activeIndex = index;
            return newBank;
        });

        updateNotes(NoteSet.Active, Array.from(noteBank.get.entries[index].activeNotes), true, true);
        setHomeNote(noteBank.get.entries[index].homeNote);

        emitSnackbar(`Swapped to note bank ${index}`, 1000, "info");
        return true;
    }, [activeNotes, homeNote, noteBank, setHomeNote, updateNotes]);

    return swapBank;
}