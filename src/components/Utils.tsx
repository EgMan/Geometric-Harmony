// const numberToNote = ["C-1", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3"];
const numberToNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const numberToNoteNameSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const numberToNoteNameFlat = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

export function getNote(i: number) {
    const octaveNum = Math.floor(i / 12) + 3;
    return `${numberToNote[i % 12]}${octaveNum}`;
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

export const getIntervalColor = (distance: number) => {
    switch (distance) {
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