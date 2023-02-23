import React from "react";
import { useModulateActiveNotes } from "./HarmonicModulation";
import { NoteSet, useUpdateNoteSet } from "./NoteProvider";

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
        ['k', 12],
        ['o', 13],
        ['l', 14],
        ['p', 15],
        [';', 16],
        ['\'', 17],
    ]
);

function useKeypressPlayer() {
    const [keysPressed, setKeysPressed] = React.useState(new Set<string>());
    const updateNotes = useUpdateNoteSet();
    const modulateActiveNotes = useModulateActiveNotes();

    const handleKeyDowns = React.useCallback((key: string) => {
        switch (key) {
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
            if (event.key === "Meta") {
                setKeysPressed(new Set());
                return;
            }
            keysPressed.delete(event.key);
            setKeysPressed(new Set(keysPressed));
        }

        // Losing focus should clear the keys pressed
        const onVisChange = (event: Event) => {
            if (!document.hasFocus()) {
                keysPressed.clear();
                updateNotes([NoteSet.Emphasized, NoteSet.Emphasized_OctaveGnostic], [], false, true);
            }
        }

        const onMouseLeave = (event: Event) => {
                updateNotes([NoteSet.Emphasized, NoteSet.Emphasized_OctaveGnostic], [], false, true);
        }

        document.addEventListener("visibilitychange", onVisChange);
        document.addEventListener("mouseleave", onMouseLeave);
        window.addEventListener("blur", onVisChange);
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            document.removeEventListener("visibilitychange", onVisChange);
            document.removeEventListener("mouseleave", onMouseLeave);
            window.removeEventListener("blur", onVisChange);
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        }
    }, [handleKeyDowns, keysPressed, modulateActiveNotes, updateNotes]);

    React.useEffect(() => {
        if (keysPressed.has("Meta")) {
            return;
        }
        const notesPressed = Array.from(keysPressed).filter(key => keyToNoteNumber.get(key.toLocaleLowerCase()) !== undefined).map(key => {
            return keyToNoteNumber.get(key.toLocaleLowerCase()) ?? -1;
        })
        updateNotes(NoteSet.Emphasized_OctaveGnostic, notesPressed, true, true);

        // setAreNotesEmphasized can not trigger this effect otherwise "no keys pressed" will constantly
        // Be overwriting emphasized notes when the keyboard is not being touched.  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [keysPressed])
}

export default useKeypressPlayer;