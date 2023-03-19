import React from "react";
import { normalizeToSingleOctave } from "./NoteProvider";

// const numberToNote = ["C-1", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3"];
const numberToPlayableNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const numberToNoteNameSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const numberToNoteNameFlat = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

export function getNote(i: number) {
    const octaveNum = Math.floor(i / 12) + 3;
    return `${numberToPlayableNote[normalizeToSingleOctave(i)]}${octaveNum}`;
}

export function getNoteMIDI(note: number) {
    var octaveNum = Math.floor(note / 12) + 3;
    if (octaveNum < -1) octaveNum = -1;
    if (octaveNum > 9) octaveNum = 9;
    var singleOctaveNote = normalizeToSingleOctave(note);
    if (octaveNum === 9 && singleOctaveNote > 7) octaveNum = 8;// G9 is the highest note
    return `${numberToPlayableNote[singleOctaveNote]}${octaveNum}`;
}

export function getNoteName(i: number, activeNotes: Set<number>) {
    // TODO fix this properly
    return numberToNoteNameSharp[i % 12];

    if (!activeNotes.has(i)) {
        return numberToNoteNameSharp[i] ?? "?";
    }
    // There's probably a better way to do this
    // console.log(numberToNoteNameSharp[i], (i+10)%12>=0, activeNotes.has((i+10)%12), numberToNoteNameSharp[(i+11)%12].charAt(0) === numberToNoteNameSharp[i].charAt(0))
    if (activeNotes.has(i - 1) || ((i + 10) % 12 >= 0 && getNoteName((i + 10) % 12, activeNotes).charAt(0) === numberToNoteNameSharp[i].charAt(0))) {
        return numberToNoteNameFlat[i] ?? "?";
    }
    return numberToNoteNameSharp[i] ?? "?";
}

export function getNoteNum(noteName: string) {
    const sanitizedNoteName = noteName.replace(/(.)b/g, "$1♭").replace(/♯/g, "#").toUpperCase();
    console.log("sanitizedNoteName", sanitizedNoteName);
    var noteNum = numberToNoteNameSharp.indexOf(sanitizedNoteName);
    if (noteNum === -1) {
        noteNum = numberToNoteNameFlat.indexOf(sanitizedNoteName);
    }
    return noteNum;
}

export const getIntervalColor = (distance: number) => {
    switch (distance) {
        case 0:
            return "black"
        case 1:
            return "violet"
        case 2:
            return "rgb(112, 0, 195)"
        case 3:
            return "blue"
        case 4:
            return "green"
        case 5:
            return "orange"
        case 6:
            return "red"
        default:
            return "white"
    }
}

export const getIntervalDistance = (loc1: number, loc2: number, subdivisionCount: number) => {
    const dist1 = Math.abs(loc1 - loc2);
    // const dist2 = (props.subdivisionCount-loc1 +loc2) % (Math.ceil(props.subdivisionCount/2));
    const dist2 = (subdivisionCount - Math.max(loc1, loc2) + Math.min(loc1, loc2));
    return Math.min(dist1, dist2);
}

export function usePrevious<T>(value: T, initialValue: T) {
    const ref = React.useRef<T>(initialValue);
    React.useEffect(() => {
        ref.current = value;
    });
    return ref.current;
}