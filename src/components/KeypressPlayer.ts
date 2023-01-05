import React from "react";
import { useSetAreNotesEmphasized } from "./NoteProvider";
import { useModulateActiveNotes } from "./HarmonicModulation";

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

function useKeypressPlayer() {
    const [keysPressed, setKeysPressed] = React.useState(new Set<string>());
    const setAreNotesEmphasized = useSetAreNotesEmphasized();
    const modulateActiveNotes = useModulateActiveNotes();

    const handleKeyDowns = React.useCallback((key: string) => {
        switch (key)
        {
            case "ArrowUp":
                modulateActiveNotes(7);
                break;
            case "ArrowDown":
                modulateActiveNotes(-7);
                break;
            case "ArrowRight":
                modulateActiveNotes(1);
                break;
            case "ArrowLeft":
                modulateActiveNotes(-1);
                break;
        }
    }, [modulateActiveNotes]);

    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            keysPressed.add(event.key);
            setKeysPressed(new Set(keysPressed));
            handleKeyDowns(event.key);
        }

        const onKeyUp = (event: KeyboardEvent) => {
            keysPressed.delete(event.key);
            setKeysPressed(new Set(keysPressed));
        }
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        }
    }, [handleKeyDowns, keysPressed, modulateActiveNotes]);

    React.useEffect(() => {
        const notesPressed = Array.from(keysPressed).filter(key => keyToNoteNumber.get(key.toLocaleLowerCase()) !== undefined).map(key => {
            return keyToNoteNumber.get(key.toLocaleLowerCase()) ?? -1;
        })
        setAreNotesEmphasized(notesPressed, true, true);
    
    // setAreNotesEmphasized can not trigger this effect otherwise "no keys pressed" will constantly
    // Be overwriting emphasized notes when the keyboard is not being touched.  
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keysPressed])
}

export default useKeypressPlayer;