import React from "react";
import { useKeysPressed } from "./KeypressProvider";
import { useSetAreNotesActive, useSetAreNotesEmphasized } from "./NoteProvider";

const keyToNoteNumber = new Map<string, number>(
    [
        ['a', 0],
        ['w', 1],
        ['s', 2],
        ['e', 3],
        ['d', 4],
        ['f', 5],
        ['t', 6],
        ['g', 7],
        ['y', 8],
        ['h', 9],
        ['u', 10],
        ['j', 11],
        ['k', 0],
        ['o', 1],
        ['l', 2],
        ['p', 3],
        [';', 4],
        ['\'', 5],
    ]
);

function useKeypressPlayer()
{
    const keysPressed = useKeysPressed();
    const setAreNotesEmphasized = useSetAreNotesEmphasized();
    const setAreNotesActive = useSetAreNotesActive();

    React.useEffect(()=>{
        const notesPressed = Array.from(keysPressed).filter(key => keyToNoteNumber.get(key) !== undefined).map(key => {
            return keyToNoteNumber.get(key) ?? -1;
        })
        setAreNotesEmphasized(notesPressed, true, true);
        setAreNotesActive(notesPressed, true, true);
    }, [keysPressed])
}

export default useKeypressPlayer;