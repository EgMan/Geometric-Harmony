import React from "react";
import { Group, Text } from 'react-konva';
import { HarmonicShape, SCALE_CHROMATIC, ShapeType, knownShapes } from "../utils/KnownHarmonicShapes";
import { blendColors, changeLightness, getNoteName } from "../utils/Utils";
import { NoteSet, normalizeToSingleOctave, useChannelDisplays, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useNotesOfType, useSetHomeNote } from "../sound/NoteProvider";
import { WidgetComponentProps } from "../view/Widget";
import SettingsMenuOverlay from "../view/SettingsMenuOverlay";
import { Switch } from "@mui/material";
import { useAppTheme } from "../view/ThemeManager";

const inputBoxNoteNameRegex = /^([aAbBcCdDeEfFgG][b#♭♯]?)\s/

type Props =
    {
        width: number
        subdivisionCount: number
    } & WidgetComponentProps

function HarmonyAnalyzer(props: Props) {
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const emphasizedNotes = useGetCombinedModdedEmphasis();
    const homeNote = useHomeNote();
    const channelDisplays = useChannelDisplays();

    const activeExactFits = useGetAllExactFits(activeNotes);
    const activeExactFit = activeExactFits[0];
    const activeExactFitName = activeExactFit ? activeExactFit.shape.name : "";

    const emphasizedExactFits = useGetAllExactFits(emphasizedNotes);
    const emphasizedExactFit = emphasizedExactFits[0];

    const inputNotes = useNoteSet(NoteSet.PlayingInput, true).notes;
    const inputExactFits = useGetAllExactFits(inputNotes);
    const inputExactFit = inputExactFits[0];

    // const midifileNotes = useNoteSet(NoteSet.MIDIFileInput, true).notes;
    const midifileNoteInfo = useNotesOfType(NoteSet.MIDIFileInput);
    const midifileNotes = midifileNoteInfo.map(note => normalizeToSingleOctave(note[1]));
    const midiFileExactFits = useGetAllExactFits(new Set(midifileNotes));
    const midiFileExactFit = midiFileExactFits[0];

    const channelDisplaysExactFits = useChannelDisplaysExactFits();

    const { colorPalette } = useAppTheme()!;

    // TODO
    // const channelDisplays = useChannelDisplays();

    const [showWhite, setShowWhite] = React.useState(false);
    const [showYellow, setShowYellow] = React.useState(false);
    // const [showRed, setShowRed] = React.useState(true);
    // const [showBlue, setShowBlue] = React.useState(true);
    const [showMidiFileCombined, setShowMidiFileCombined] = React.useState(true);

    const settingsMenuItems = [
        (<tr key={"tr1"}>
            <td>Show active note scale/chord family</td>
            <td style={{ color: "white", textAlign: "center" }}>■</td>
            <td><Switch color={"primary"} checked={showWhite} onChange={e => setShowWhite(e.target.checked)} /></td>
        </tr>),
        (<tr key={"tr2"}>
            <td>Show active note scale/chord</td>
            <td style={{ color: "yellow", textAlign: "center" }}>■</td>
            <td><Switch color={"primary"} checked={showYellow} onChange={e => setShowYellow(e.target.checked)} /></td>
        </tr>),
        // (<tr key={"tr3"}>
        //     <td>Show emphasized notes</td>
        //     <td style={{ color: "red", textAlign: "center" }}>■</td>
        //     <td><Switch color={"primary"} checked={showRed} onChange={e => setShowRed(e.target.checked)} /></td>
        // </tr>),
        // (<tr key={"tr4"}>
        //     <td>Show midi input notes</td>
        //     <td style={{ color: "blue", textAlign: "center" }}>■</td>
        //     <td><Switch color={"primary"} checked={showBlue} onChange={e => setShowBlue(e.target.checked)} /></td>
        // </tr>),
        (<tr key={"tr5"}>
            <td>Show midi file notes (combined)</td>
            <td style={{ color: "white", textAlign: "center" }}>■</td>
            <td><Switch color={"primary"} checked={showMidiFileCombined} onChange={e => setShowMidiFileCombined(e.target.checked)} /></td>
        </tr>),
    ];

    const getNoteNameInExactFitShape = React.useCallback((note: number, exactFit: ExactFit) => {
        if (exactFit === null || exactFit === undefined) return getNoteName(note, activeNotes);
        let shapeIdx = (note + exactFit.noteToFirstNoteInShapeIdxOffset) % props.subdivisionCount;
        if (shapeIdx < 0) shapeIdx += props.subdivisionCount;
        if (shapeIdx >= exactFit.shape.notes.length || shapeIdx < 0 || !exactFit.shape.notes[shapeIdx][0]) return getNoteName(note, activeNotes);
        return `${getNoteName(maybeModulateNoteFromShapeType(note, shapeIdx, exactFit.shape), activeNotes)} ${getModeNameInShape(shapeIdx, exactFit.shape)}`;
    }, [activeNotes, props.subdivisionCount]);


    const getInfoText = React.useCallback((note: number) => {
        // No exact fit, so display the note name
        if (activeExactFit === null || activeExactFit === undefined) return getNoteName(note, activeNotes);

        if (homeNote == null) {
            if (emphasizedNotes.size === 1) {
                return getNoteNameInExactFitShape(note, activeExactFit) ?? '?';
            }
            return getNoteName(note, activeNotes);
        }
        const scaleDegree = getScaleDegree(homeNote + activeExactFit.noteToFirstNoteInShapeIdxOffset, note + activeExactFit.noteToFirstNoteInShapeIdxOffset, activeExactFit.shape);
        return `${getNoteName(note, activeNotes)}${scaleDegree > 0 ? `°${scaleDegree}` : ""}`;

        // return `${exactFit.shape.name}`;
    }, [activeExactFit, activeNotes, emphasizedNotes.size, getNoteNameInExactFitShape, homeNote]);


    const infoTextElems = React.useMemo(() => {
        //TODO Add exact fit names
        const emphasizedNoteInfo = Array.from(emphasizedNotes).map(getInfoText).filter(info => info !== '');
        const inputNoteInfo = Array.from(inputNotes).map(getInfoText).filter(info => info !== '');

        // channelDisplays.map(channel => getInfoText(Array.from(channel.notes)))

        type Info = {
            text: string;
            color: string;
        }
        var infos: Info[] = [];
        if (showWhite) {
            infos.push({
                text: activeExactFitName,
                color: "white",
            });
        }
        if (showYellow && homeNote !== null) {
            infos.push({
                text: getNoteNameInExactFitShape(homeNote, activeExactFit),
                color: "yellow",
            });
        }

        if (showMidiFileCombined && midiFileExactFit && (midiFileExactFit.shape.type === ShapeType.CHORD)) {
            const midiFileCombinedDisplayColor =
                blendColors(
                    channelDisplays.filter(channel => channel.channelTypes.has(NoteSet.MIDIFileInput))
                        .map(channel => channel.color ?? "")
                );
            var combinedMidiFileText = getNoteNameInExactFitShape(-midiFileExactFit.noteToFirstNoteInShapeIdxOffset, midiFileExactFit);
            infos.push({
                text: combinedMidiFileText,
                color: midiFileCombinedDisplayColor ?? colorPalette.Widget_Primary,
            });
        }

        // This could be optimized by exposing a function that only searches for chord exact fits
        channelDisplaysExactFits.forEach(exactFits => {
            const exactFitChords = exactFits.exactFits.filter(fit =>
                fit.shape.type === ShapeType.CHORD &&

                // Don't display individual midi file analysis if there is a match on the combined analysis
                !(combinedMidiFileText && combinedMidiFileText !== "" && exactFits.channel.channelTypes.has(NoteSet.MIDIFileInput))
            );
            // const exactFitChords = exactFits.exactFits;
            if (exactFitChords.length > 0) {
                const exactFit = exactFitChords[0];
                let color = exactFits.channel.color ?? "white";
                if (color === "blue") color = changeLightness(color, 1.6);
                infos.push({
                    text: getNoteNameInExactFitShape(-exactFit.noteToFirstNoteInShapeIdxOffset, exactFit),
                    color: color ?? "white",
                });
            }
        });

        // Convert infos to text elements
        var idx = 0;
        const textelemoffset = 28;
        const infosYOffset = 50;
        const infosFontSize = 20;
        return infos.filter(info => info.text !== "").map((info) => {
            return (<Text key={`info${info.text}${idx++}`} text={info.text} x={0} y={textelemoffset * (idx) + infosYOffset} fontSize={infosFontSize} fontFamily='monospace' fill={info.color} align="center" width={props.width} />);
        });
    }, [activeExactFit, activeExactFitName, channelDisplays, channelDisplaysExactFits, colorPalette.Widget_Primary, emphasizedNotes, getInfoText, getNoteNameInExactFitShape, homeNote, inputNotes, midiFileExactFit, props.width, showMidiFileCombined, showWhite, showYellow]);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group>
                {infoTextElems}
            </Group >
        );
    }, [infoTextElems]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay fromWidget={props.fromWidget} settingsRows={settingsMenuItems}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export function getScaleDegree(noteInShapeFrom: number, noteInShapeTo: number, shape: HarmonicShape): number {
    var nextNote = normalizeToSingleOctave(noteInShapeFrom);
    var noteTo = normalizeToSingleOctave(noteInShapeTo);
    var count = 1;
    if (!shape.notes[noteTo] || shape.notes[noteTo][0] !== true) return -1;
    while (nextNote !== noteTo) {
        if (shape.notes[nextNote] && shape.notes[nextNote][0] === true) {
            count++;
        }
        nextNote = normalizeToSingleOctave(nextNote + 1);
    }
    return count;
}

export function useGetActiveShapeScaleDegreeFromNote() {
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const exactFit = useGetAllExactFits(activeNotes)[0];
    const homeNote = useHomeNote() ?? 0;

    const shape = exactFit?.shape ?? SCALE_CHROMATIC;
    const shapeOffset = exactFit?.noteToFirstNoteInShapeIdxOffset ?? 0;

    return React.useCallback((note: number) => getScaleDegree(homeNote + shapeOffset, note + shapeOffset, shape), [homeNote, shape, shapeOffset]);
}
export function useGetNoteFromActiveShapeScaleDegree() {
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const homeNote = useHomeNote() ?? 0;
    const getActiveShapeScaleDegree = useGetActiveShapeScaleDegreeFromNote();

    // There's a more efficient way to do this, but I'm lazy.
    // At least it's memoized ¯\_(ツ)_/¯
    const scaleDegToNote = React.useMemo(() => {
        const arr = Array(activeNotes.size);
        Array.from(Array(12).keys()).forEach(note => {
            const scaleDegree = getActiveShapeScaleDegree(note);
            if (scaleDegree > 0) arr[scaleDegree - 1] = note;
        });
        return arr;
    }, [activeNotes.size, getActiveShapeScaleDegree]);

    return React.useCallback((scaleDeg: number): number => {
        if (scaleDeg <= 0) scaleDeg += scaleDegToNote.length;
        const noteSingleOctave = scaleDegToNote[(scaleDeg - 1) % scaleDegToNote.length];
        var octaveShift = Math.floor((scaleDeg - 1) / scaleDegToNote.length);
        if (noteSingleOctave < homeNote) octaveShift++;
        return noteSingleOctave + (octaveShift * 12);
    }, [homeNote, scaleDegToNote]);
}

export function maybeModulateNoteFromShapeType(note: number, shapeIdx: number, shape: HarmonicShape): number {
    switch (shape.type) {
        case ShapeType.CHORD:
            return normalizeToSingleOctave(note - shapeIdx);
        default:
            return note;
    }
}

export function getModeNameInShape(shapeIdx: number, shape: HarmonicShape): string {
    const scaleDegree = getScaleDegree(0, shapeIdx, shape);
    switch (shape.type) {
        case ShapeType.INTERVAL:
        case ShapeType.DYNAMIC:
            return "";
        case ShapeType.CHORD:
            if (scaleDegree < 0) return "Not a chord";
            if (scaleDegree === 1) return shape.name;
            return `${shape.name} inversion ${scaleDegree - 1}`;
        case ShapeType.SCALE:
            // First, attempt to find the true name of the mode
            const trueName = shape.notes[shapeIdx]?.[1];
            if (trueName) return trueName;

            // If that fails, check to see note actually forms a node
            if (scaleDegree < 0) return "Not a mode";

            // If does, name this mode with respect to the first mode of the shape
            return `${shape.notes[0][1] ?? ""} mode ${scaleDegree}`;
    }
}

export type ExactFit = {
    shape: HarmonicShape
    doesFit: boolean
    noteToFirstNoteInShapeIdxOffset: number
    rootNote: number
}

function useTryToFitShape() {
    return React.useCallback((shape: HarmonicShape, notes: Set<number>): ExactFit => {
        const noteArr = Array.from(notes);

        const findNextNoteInShape = (startingIdx: number) => {
            for (var i = startingIdx + 1; i < shape.notes.length; i++) {
                if (shape.notes[i][0]) return i;
            }
            return -1;
        }

        const doesShapeFitStartingHere = (noteStart: number) => {
            var idx = findNextNoteInShape(-1);
            while (idx !== -1) {
                if (!notes.has(normalizeToSingleOctave(noteStart + idx))) {
                    return false;
                }
                idx = findNextNoteInShape(idx);
            }
            return true;
        }

        for (const note of noteArr) {
            if (doesShapeFitStartingHere(note)) {
                return {
                    shape,
                    doesFit: true,
                    noteToFirstNoteInShapeIdxOffset: findNextNoteInShape(-1) - note,
                    rootNote: note,
                };
            }
        }

        return {
            shape,
            doesFit: false,
            noteToFirstNoteInShapeIdxOffset: 0,
            rootNote: -1,
        };
    }, []);
}

export function getDynamicShape(notes: Set<number>): HarmonicShape {
    return {
        name: "",
        notes: Array.from(Array(12).keys()).map(i => [notes.has(i)]),
        type: ShapeType.DYNAMIC,
    }
}

export function useGetAllExactFits(notes: Set<number>): ExactFit[] {
    const tryToFitShape = useTryToFitShape();

    return React.useMemo(() => {
        const defaultExactFit: ExactFit = {
            shape: getDynamicShape(notes),
            doesFit: true,
            noteToFirstNoteInShapeIdxOffset: 0,
            rootNote: -1,
        }
        const shapesOfCorrectSize = knownShapes[notes.size] ?? [];
        return shapesOfCorrectSize.map(shape => tryToFitShape(shape, notes)).filter(shapeFit => shapeFit.doesFit).concat(defaultExactFit);
    }, [notes, tryToFitShape]);
}

export function useChannelDisplaysExactFits() {
    const channels = useChannelDisplays();
    const tryToFitShape = useTryToFitShape();
    return React.useMemo(() => {
        return channels.map(channel => {
            const normalizedNotes = new Set(Array.from(channel.notes).map(note => normalizeToSingleOctave(note)));
            const shapesOfCorrectSize = knownShapes[normalizedNotes.size] ?? [];
            return { exactFits: shapesOfCorrectSize.map(shape => tryToFitShape(shape, normalizedNotes)).filter(shapeFit => shapeFit.doesFit), channel: channel };
        });
    }, [channels, tryToFitShape]);
}

export default HarmonyAnalyzer;