import React from 'react';
import { NoteSet, useHomeNote, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import { useShapeToNoteArray } from '../sound/HarmonicModulation';
import { CHORD_AUGMENTED7, CHORD_DIMINISHED7, CHORD_DOMINANT7, CHORD_HALFDIMINISHED7, CHORD_MAJOR7, CHORD_MINOR7, SCALE_BLUES, SCALE_CHROMATIC, SCALE_NATURAL, SCALE_WHOLETONE } from './KnownHarmonicShapes';
import { emitSnackbar } from './Utils';

type ActiveNoteBankEntry = {
    activeNotes: number[],
    homeNote: number | null,
}

export function useActiveNoteBank() {
    const [activeBankIndex, setActiveBankIndex] = React.useState(0);
    const shapeToNoteArr = useShapeToNoteArray();
    const [noteBank, setNoteBank] = React.useState<ActiveNoteBankEntry[]>([
        // Entry #0 is the empty bank entry.
        /*0*/ { activeNotes: [], homeNote: 0 },
        // Entry #1 is the default bank entry loaded on startup. 
        // It's empty until the first swap is made.  
        /*1*/ { activeNotes: shapeToNoteArr(CHORD_MAJOR7, 10), homeNote: 10 },
        /*2*/ { activeNotes: shapeToNoteArr(CHORD_MINOR7, 0), homeNote: 0 },
        /*3*/ { activeNotes: shapeToNoteArr(CHORD_MINOR7, 2), homeNote: 2 },
        /*4*/ { activeNotes: shapeToNoteArr(CHORD_MAJOR7, 3), homeNote: 3 },
        /*5*/ { activeNotes: shapeToNoteArr(CHORD_DOMINANT7, 5), homeNote: 5 },
        /*6*/ { activeNotes: shapeToNoteArr(CHORD_MINOR7, 7), homeNote: 7 },
        /*7*/ { activeNotes: shapeToNoteArr(CHORD_HALFDIMINISHED7, 9), homeNote: 9 },
        /*8*/ { activeNotes: shapeToNoteArr(SCALE_NATURAL, 10), homeNote: 10 },
        /*9*/ { activeNotes: shapeToNoteArr(SCALE_CHROMATIC, 0), homeNote: 0 },
    ]);

    const updateNotes = useUpdateNoteSet();
    // const setActiveShape = useSetActiveShape();
    const setHomeNote = useSetHomeNote();
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const homeNote = useHomeNote();

    const swapBank = React.useCallback((index: number) => {
        if (index === activeBankIndex) {
            return true;
        }
        if (index < 0 || index >= noteBank.length) {
            return false;
        }

        setNoteBank((prev) => {
            const newBank = [...prev];
            const activeNotesArr = Array.from(activeNotes);
            newBank[activeBankIndex] = { activeNotes: activeNotesArr, homeNote };
            return newBank;
        });

        setActiveBankIndex(index);
        updateNotes(NoteSet.Active, Array.from(noteBank[index].activeNotes), true, true);
        setHomeNote(noteBank[index].homeNote);

        emitSnackbar(`Swapped to note bank ${index}`, 1000, "info");
        return true;
    }, [activeBankIndex, activeNotes, homeNote, noteBank, setHomeNote, updateNotes]);

    return swapBank;
}