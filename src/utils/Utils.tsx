import React from "react";
import { normalizeToSingleOctave } from "../sound/NoteProvider";
import { Vector2d } from "konva/lib/types";
import { KonvaEventObject } from "konva/lib/Node";
import ColorConverter from "string-color-converter";
import { enqueueSnackbar } from "notistack";
import { ColorPalette } from "../view/ThemeManager";

// const numberToNote = ["C-1", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3"];
const numberToPlayableNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const numberToNoteNameSharp = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const numberToNoteNameFlat = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"];

export const bigGold = 1.6180339887;
export const smallGold = 1 / bigGold;

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

export const getIntervalColor = (distance: number, colorPalette: ColorPalette) => {
    switch (distance) {
        case 0:
            return "black"
        case 1:
            return colorPalette.Interval_Semitone
        case 2:
            return colorPalette.Interval_Wholetone
        case 3:
            return colorPalette.Interval_MinorThird
        case 4:
            return colorPalette.Interval_MajorThird
        case 5:
            return colorPalette.Interval_PerfectFourth
        case 6:
            return colorPalette.Interval_Tritone
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
    React.useLayoutEffect(() => {
        ref.current = value;
    });
    return ref.current;
}

export enum BrowserType {
    Opera,
    Edge,
    Chrome,
    Safari,
    Firefox,
    IE,
    Unknown,
}
export function useBrowserVersion() {
    return React.useMemo(() => {
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) !== -1) {
            return BrowserType.Opera;
        }
        else if (navigator.userAgent.indexOf("Edg") !== -1) {
            return BrowserType.Edge;
        }
        else if (navigator.userAgent.indexOf("Chrome") !== -1) {
            return BrowserType.Chrome;
        }
        else if (navigator.userAgent.indexOf("Safari") !== -1) {
            return BrowserType.Safari;
        }
        else if (navigator.userAgent.indexOf("Firefox") !== -1) {
            return BrowserType.Firefox;
        }
        else if ((navigator.userAgent.indexOf("MSIE") !== -1)) {
            return BrowserType.IE;
        }
        else {
            return BrowserType.Unknown;
        }
    }, []);
}

export function useShadowVector(position: Vector2d, source: Vector2d, magnitude: number): [Vector2d, number] {
    return React.useMemo(() => {
        const deltaX = position.x - source.x;
        const deltaY = position.y - source.y;
        const distance = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY));
        return [{ x: deltaX * magnitude / distance, y: deltaY * magnitude / distance }, distance];
    }, [magnitude, position.x, position.y, source.x, source.y]);
}

export function addVectors(v1: Vector2d, v2: Vector2d) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

export function setPointer(event: KonvaEventObject<MouseEvent>, cursorType: string) {
    const container = event.target.getStage()?.container();
    if (container != null) container.style.cursor = cursorType;
}

export function blendColors(colors: string[]) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;
    let count = 0;

    colors.forEach(color => {
        const parsedColor = ColorConverter(color);
        if (parsedColor.isValid) {
            r += parsedColor.r;
            g += parsedColor.g;
            b += parsedColor.b;
            a += parsedColor.a;
            count++
        }
        else {
            console.error("Invalid color", color);
        }
    });
    if (count === 0) return null;

    return `rgba(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}, ${Math.round(a / count)})`;
}

export function fadeColors(colorA: string, colorB: string, ratio: number) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 0;

    const parsedColorA = ColorConverter(colorA);
    const parsedColorB = ColorConverter(colorB);
    if (parsedColorA.isValid && parsedColorB.isValid) {
        r += parsedColorA.r + (parsedColorB.r - parsedColorA.r) * ratio;
        g += parsedColorA.g + (parsedColorB.g - parsedColorA.g) * ratio;
        b += parsedColorA.b + (parsedColorB.b - parsedColorA.b) * ratio;
        a += parsedColorA.a + (parsedColorB.a - parsedColorA.a) * ratio;
    } else {
        console.error("Invalid colors", colorA, colorB);
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function changeLightness(color: string, multiplier: number) {
    const parsedColor = ColorConverter(color);
    if (!parsedColor.isValid) {
        console.error("Invalid color", color);
        console.error("Parsed color", parsedColor);
    }
    let lightness = Math.floor(Math.min(Math.max(parsedColor.l * multiplier, 0), 100));
    return `hsla(${parsedColor.h}, ${parsedColor.s}%, ${lightness}%, ${parsedColor.a})`
}

export function getRandomColor() {
    var max = 255;
    var r = Math.floor(Math.random() * max);
    var g = Math.floor(Math.random() * max);
    var b = Math.floor(Math.random() * max);
    return "rgb(" + r + "," + g + "," + b + ")";
}

export function getRandomColorWithAlpha() {
    var max = 255;
    var r = Math.floor(Math.random() * max);
    var g = Math.floor(Math.random() * max);
    var b = Math.floor(Math.random() * max);
    var a = Math.random();
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

type SnackVariant = "default" | "success" | "error" | "warning" | "info";

export function emitSnackbar(message: string, duration: number = 3000, variant: SnackVariant = "default") {
    enqueueSnackbar(message,
        {
            variant,
            preventDuplicate: true,
            autoHideDuration: duration,
            style: {
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(16px)",
            },
            anchorOrigin: {
                vertical: "top",
                horizontal: "right"
            },
        });
}

export function debugSnackbar(message: string, duration: number = 3000) {
    if (isDevMode()) {
        emitSnackbar(message, duration, "warning");
    }
}

export function isDevMode() {
    return process.env.NODE_ENV === "development";
}