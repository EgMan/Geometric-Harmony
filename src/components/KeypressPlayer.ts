import React from "react";
import { useSetAreNotesEmphasized } from "./NoteProvider";

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


    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            keysPressed.add(event.key);
            setKeysPressed(new Set(keysPressed));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => {
        const notesPressed = Array.from(keysPressed).filter(key => keyToNoteNumber.get(key) !== undefined).map(key => {
            return keyToNoteNumber.get(key) ?? -1;
        })
        setAreNotesEmphasized(notesPressed, true, true);
        // setAreNotesActive(notesPressed, true, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keysPressed])
}

export default useKeypressPlayer;