import React from "react";
import { useModulateActiveNotes } from "./HarmonicModulation";
import { NoteSet, normalizeToSingleOctave, useNoteSet, useUpdateNoteSet } from "./NoteProvider";
import { useGetActiveShapeScaleDegreeFromNote, useGetNoteFromActiveShapeScaleDegree} from "../toys/HarmonyAnalyzer";
import { useExecuteOnPlayingNoteStateChange } from "./SoundEngine";

const keyToNoteNumber = new Map<string, number>(
    [
        // ['w', 1],
        // ['s', 2],
        // ['e', 3],
        // ['d', 4],
        // ['f', 5],
        // ['t', 6],
        // ['g', 7],
        // ['y', 8],
        // ['h', 9],
        // ['u', 10],
        // ['j', 11],
        // ['k', 12],
        // ['o', 13],
        // ['l', 14],
        // ['p', 15],
        // [';', 16],
        // ['\'', 17],
    ]
);

const keyToScaleDegreeLow = new Map<string, number>([
        [' ', 0],
        ['z', 0],
        ['x', 1],
        ['c', 2],
        ['v', 3],
        ['b', 4],
        ['n', 5],
        ['m', 6],
        [',', 7],
        ['.', 8],
        ['/', 9],
]);
const keyToScaleDegreeMid = new Map<string, number>([
        ['a', 0],
        ['s', 1],
        ['d', 2],
        ['f', 3],
        ['g', 4],
        ['h', 5],
        ['j', 6],
        ['k', 7],
        ['l', 8],
        [';', 9],
        ['\'', 10],
]);
const keyToScaleDegreeHigh = new Map<string, number>([
        ['q', 0],
        ['w', 1],
        ['e', 2],
        ['r', 3],
        ['t', 4],
        ['y', 5],
        ['u', 6],
        ['i', 7],
        ['o', 8],
        ['p', 9],
        ['[', 10],
        [']', 11],
        ['\\', 12],
]);
const keyToScaleDegree = new Map<string, number>(
    [
        ...keyToScaleDegreeLow,
        ...keyToScaleDegreeMid,
        ...keyToScaleDegreeHigh,
        // ['1', 26],
        // ['2', 27],
        // ['3', 28],
        // ['4', 29],
        // ['5', 30],
        // ['6', 31],
        // ['7', 32],
        // ['8', 33],
        // ['9', 34],
        // ['0', 35],
    ]
);

type SingleNoteShift =
    {
        scaleDegree: number,
        shiftAmount: number,
        isDiatonic: boolean,
    };

function useKeypressPlayer() {
    const [keysPressed, setKeysPressed] = React.useState(new Set<string>());
    const activeNotes = useNoteSet()(NoteSet.Active);
    const updateNotes = useUpdateNoteSet();
    const modulateActiveNotes = useModulateActiveNotes();
    const getNoteFromScaleDegree = useGetNoteFromActiveShapeScaleDegree();
    const getActiveShapeScaleDegree = useGetActiveShapeScaleDegreeFromNote();
    const [octaveShift, setOctaveShift] = React.useState(-1);
    const [mostRecentlyPressedNumberKey, setMostRecentlyPressedNumberKey] = React.useState("");
    const [mostRecentlyPlayedScaleDegree, setMostRecentlyPlayedScaleDegree] = React.useState<number | null>(null);
    const [singleNoteShift, setSingleNoteShift] = React.useState<SingleNoteShift | null>(null);
    const mostRecentlyPlayedNote = mostRecentlyPlayedScaleDegree && normalizeToSingleOctave(getNoteFromScaleDegree(mostRecentlyPlayedScaleDegree-1));//todo figure out why -1

    useExecuteOnPlayingNoteStateChange((notesTurnedOn, _notesTurnedOff) => {
        if (notesTurnedOn.length === 1)
        {
            setMostRecentlyPlayedScaleDegree(getActiveShapeScaleDegree(normalizeToSingleOctave(notesTurnedOn[0])));
        }
    });
    const handleKeyDownsWithoutRepeats = React.useCallback((key: string) => {
        switch (key) {
            case "Control":
            case "Shift":
                if (singleNoteShift == null && mostRecentlyPlayedNote != null) {
                    const shiftAmount = key === "Shift" ? 1 : -1;
                    if (activeNotes.has(normalizeToSingleOctave(mostRecentlyPlayedNote + shiftAmount))) {
                        setSingleNoteShift({
                            scaleDegree: mostRecentlyPlayedScaleDegree ?? 0,
                            shiftAmount: shiftAmount,
                            isDiatonic: true,
                        });
                    }
                    else {
                        modulateActiveNotes(shiftAmount, new Set([mostRecentlyPlayedNote]));
                        setSingleNoteShift({
                            scaleDegree: mostRecentlyPlayedScaleDegree ?? 0,
                            shiftAmount: shiftAmount,
                            isDiatonic: false,
                        });
                    }
                }
                break;
        }
    }, [activeNotes, modulateActiveNotes, mostRecentlyPlayedNote, mostRecentlyPlayedScaleDegree, singleNoteShift]);

    const handleKeyDownsWithRepeats = React.useCallback((key: string) => {
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
            case "-":
                setOctaveShift(prev => prev-1);
                break;
            case "=":
                setOctaveShift(prev => prev+1);
                break;
        }
        if (!isNaN(parseInt(key))) {
            setMostRecentlyPressedNumberKey(key);
        }
    }, [modulateActiveNotes]);
    React.useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            // var mainStage = document.getElementById('root');
            // console.log(event.key);
            if (event.key === "Escape"){
                (document.activeElement as HTMLElement).blur();
            }
            if (document.activeElement?.id === 'body')
            {
                if (!keysPressed.has(event.key.toLocaleLowerCase())) {
                    keysPressed.add(event.key.toLocaleLowerCase());
                    setKeysPressed(new Set(keysPressed));
                    handleKeyDownsWithoutRepeats(event.key);
                }
                handleKeyDownsWithRepeats(event.key);
            }
        }

        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === "Meta") {
            }
        switch (event.key) {
            case "Meta":
                setKeysPressed(new Set());
                return;
            case "Control":
            case "Shift":
                if (singleNoteShift != null) {
                    const shiftNoteBack = normalizeToSingleOctave(getNoteFromScaleDegree(singleNoteShift.scaleDegree-1));
                    if (!singleNoteShift.isDiatonic && !activeNotes.has(shiftNoteBack - singleNoteShift.shiftAmount)) {
                        modulateActiveNotes(-singleNoteShift.shiftAmount, new Set([shiftNoteBack]));
                    }
                    setSingleNoteShift(null);
                    // const shiftAmount = event.key === "Shift" ? -1 : 1;
                    // if (!activeNotes.has(normalizeToSingleOctave(mostRecentlyPlayedNote + shiftAmount))) {
                    //     modulateActiveNotes(shiftAmount, new Set([mostRecentlyPlayedNote]));
                    // }
                }
                break;
        }
            keysPressed.delete(event.key.toLocaleLowerCase());
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
    }, [activeNotes, getNoteFromScaleDegree, handleKeyDownsWithRepeats, handleKeyDownsWithoutRepeats, keysPressed, modulateActiveNotes, mostRecentlyPlayedNote, singleNoteShift, updateNotes]);

    React.useEffect(() => {
        if (keysPressed.has("Meta")) {
            return;
        }

        // Use the most recently played number key.  If the most recent one has been released, use the highest number key that is still pressed.
        const transformNum = (num: number): number => {if (num === 0) return 9; return num-1;}
        const numberKeyResult = keysPressed.has(mostRecentlyPressedNumberKey) ? transformNum(parseInt(mostRecentlyPressedNumberKey)) : Array.from(keysPressed).map(key => parseInt(key)).filter(key => key).reduce((prev, key) => {
            return prev > transformNum(key) ? prev : transformNum(key);
        }, 0);

        const scaleDegreesPressed = Array.from(keysPressed).filter(key => keyToScaleDegree.get(key.toLocaleLowerCase()) !== undefined).map(key => {
            var scaleDegree = (keyToScaleDegree.get(key.toLocaleLowerCase()) ?? 0) + numberKeyResult;
            if (singleNoteShift != null && singleNoteShift.isDiatonic && normalizeToSingleOctave(scaleDegree) === normalizeToSingleOctave(singleNoteShift.scaleDegree-1)) {
                scaleDegree += singleNoteShift.shiftAmount;
            }

            var specificKeyOffset = 0;
            if (key === ' ') specificKeyOffset -= 12;
            if (keyToScaleDegreeMid.has(key)) specificKeyOffset += 12;
            if (keyToScaleDegreeHigh.has(key)) specificKeyOffset += 12*2;

            return getNoteFromScaleDegree(scaleDegree)+specificKeyOffset+(octaveShift*12);
        })
        const notesPressed = Array.from(keysPressed).filter(key => keyToNoteNumber.get(key.toLocaleLowerCase()) !== undefined).map(key => {
            return keyToNoteNumber.get(key.toLocaleLowerCase()) ?? -1;
        })
        updateNotes(NoteSet.Emphasized_OctaveGnostic, [...notesPressed, ...scaleDegreesPressed], true, true);

        // updateNotes can not trigger this effect otherwise "no keys pressed" will constantly
        // Be overwriting emphasized notes when the keyboard is not being touched.  
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [getNoteFromScaleDegree, keysPressed, mostRecentlyPressedNumberKey, octaveShift])
}

export default useKeypressPlayer;