import React from "react";
import { Group, Text } from 'react-konva';
import { HarmonicShape, SCALE_CHROMATIC, ShapeType, knownShapes } from "../utils/KnownHarmonicShapes";
import { getNoteName, getNoteNum } from "../utils/Utils";
import { NoteSet, normalizeToSingleOctave, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote } from "../sound/NoteProvider";
import { Html } from "react-konva-utils";
import { MenuItem, FormGroup, Select, Button, Autocomplete, TextField, } from "@mui/material";
import { useSetActiveShape } from "../sound/HarmonicModulation";
import { WidgetComponentProps } from "../view/Widget";

const inputBoxNoteNameRegex = /^([aAbBcCdDeEfFgG][b#♭♯]?)\s/

type Props =
    {
        width: number
        subdivisionCount: number
    } & WidgetComponentProps

function HarmonyAnalyzer(props: Props) {
    const activeNotes = useNoteSet()(NoteSet.Active);
    const emphasizedNotes = useGetCombinedModdedEmphasis()();
    const setActiveShape = useSetActiveShape();
    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();

    const [selectedShape, setSelectedShape] = React.useState<AutocompleteOptionType | null>(null);
    const [selectedHomeNote, setSelectedHomeNote] = React.useState<number>(-1);

    const keySelectorExplorerWidth = 70;
    const submitButtonExplorerWidth = 70;
    const autocompleteExplorerWidth = props.width - keySelectorExplorerWidth - submitButtonExplorerWidth;
    const explorerWidth = keySelectorExplorerWidth + autocompleteExplorerWidth + submitButtonExplorerWidth;

    const resetSelectedShapeExplorerItems = () => {
        setSelectedShape(null);
        setSelectedHomeNote(-1);
    }

    const activeExactFits = useGetAllExactFits(activeNotes);
    const activeExactFit = activeExactFits[0];
    const activeExactFitName = activeExactFit ? activeExactFit.shape.name : "";

    const emphasizedExactFits = useGetAllExactFits(emphasizedNotes);
    const emphasizedExactFit = emphasizedExactFits[0];

    const getNoteNameInExactFitShape = React.useCallback((note: number, exactFit: ExactFit) => {
        if (exactFit === null || exactFit === undefined) return getNoteName(note, activeNotes);
        let shapeIdx = (note + exactFit.noteToFirstNoteInShapeIdxOffset) % props.subdivisionCount;
        if (shapeIdx < 0) shapeIdx += props.subdivisionCount;
        if (shapeIdx >= exactFit.shape.notes.length || shapeIdx < 0 || !exactFit.shape.notes[shapeIdx][0]) return getNoteName(note, activeNotes);
        return `${getNoteName(maybeModulateNoteFromShapeType(note, shapeIdx, exactFit.shape), activeNotes)} ${getModeNameInShape(shapeIdx, exactFit.shape)}`;
    }, [activeNotes, props.subdivisionCount]);


    const infoTextElems = React.useMemo(() => {
        //TODO Add exact fit names
        const emphasizedNoteInfo = Array.from(emphasizedNotes).map(note => {
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
        }).filter(info => info !== '');

        // Populate infos that display under the shape explorer
        type Info = {
            text: string;
            color: string;
        }
        var infos: Info[] = [];
        infos.push({
            text: activeExactFitName,
            color: "white",
        });
        if (homeNote !== null) {
            infos.push({
                text: getNoteNameInExactFitShape(homeNote, activeExactFit),
                color: "yellow",
            });
        }

        if (emphasizedExactFit && emphasizedExactFit.shape.type === ShapeType.CHORD) {
            infos.push({
                text: getNoteNameInExactFitShape(-emphasizedExactFit.noteToFirstNoteInShapeIdxOffset, emphasizedExactFit),
                color: "red",
            });
        }
        else {
            infos.push({
                text: emphasizedNoteInfo.join(", "),
                color: "red",
            });
        }

        // Convert infos to text elements
        var idx = 0;
        const textelemoffset = 28;
        const infosYOffset = 50;
        const infosFontSize = 20;
        return infos.filter(info => info.text !== "").map((info) => {
            return (<Text key={`info${info.text}${idx++}`} text={info.text} x={0} y={textelemoffset * (idx) + infosYOffset} fontSize={infosFontSize} fontFamily='monospace' fill={info.color} align="center" width={explorerWidth} />);
        });
    }, [activeExactFit, activeExactFitName, activeNotes, emphasizedExactFit, emphasizedNotes, explorerWidth, getNoteNameInExactFitShape, homeNote]);

    type AutocompleteOptionType = {
        label: string;
        noteCount: number;
        shapeName: string;
        shapeNum: number;
        startingNoteNum: number;
        shape: HarmonicShape;
        hasExplicitName: boolean;
    }
    const explorerElements: AutocompleteOptionType[] = React.useMemo(() => {
        return knownShapes.map((shapes, noteCount) => {
            return shapes.map((shape, shapeNum) => {
                var elems: AutocompleteOptionType[] = [];
                shape.notes.forEach((startingNote, startingNoteNum) => {
                    // Don't list notes not in the shape
                    if (startingNote[0] === false) return;

                    const label = getModeNameInShape(startingNoteNum, shape);

                    var hasExplicitName = false;
                    switch (shape.type) {
                        case ShapeType.CHORD:
                            hasExplicitName = startingNoteNum === 0;
                            break;
                        default:
                            hasExplicitName = startingNote.length >= 2;
                    }
                    if (label !== "") {
                        elems.push({
                            label,
                            noteCount,
                            shapeName: shape.name,
                            shapeNum,
                            startingNoteNum,
                            shape,
                            hasExplicitName,
                        });
                    }
                });
                return elems;
            });
        }).flat(2);
    }, []);

    const keySelectors = React.useMemo(() => {
        return [<MenuItem key={'nullSelectorOption'} value={-1}>{""}</MenuItem>].concat(Array.from(Array(12).keys()).map((num, idx) => {
            return <MenuItem key={`selectorOption${idx}`} value={num}>{getNoteName(num, new Set())}</MenuItem>;
        }));
    }, []);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group x={- (explorerWidth / 2)}>
                {infoTextElems}
                <Html transform={true} divProps={{ id: "shape-tool-div" }}>
                    <form onSubmit={evt => { evt.preventDefault() }}>
                        <FormGroup row sx={{ backgroundColor: 'rgb(255,255,255,0.1)', borderRadius: '9px' }}>
                            <Select
                                id="explorer-dropdown"
                                value={selectedHomeNote}
                                label="Note layout"
                                labelId="demo-simple-select-filled-label"
                                onChange={e => { setSelectedHomeNote(e.target.value as number) }}
                                // sx={{ border: 0 }}
                                sx={{
                                    width: keySelectorExplorerWidth,
                                    color: "white",
                                    // backgroundColor: "rbga(0,0,0,0.5)",
                                    '.MuiInputBase-input': {
                                        fontFamily: "monospace",
                                    },
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'transparent',
                                        borderRadius: '9px',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid transparent',
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: '9px',
                                        backgroundColor: 'rgb(255,255,255,0.1)',
                                        border: '1px solid transparent',
                                    },
                                    '.MuiSvgIcon-root ': {
                                        fill: "white !important",
                                    }
                                }}
                            >
                                {keySelectors}
                            </Select>
                            <Autocomplete
                                disablePortal
                                id="explorerinput"
                                size="small"
                                inputMode="text"
                                groupBy={(option) => option.shape.groupByOverride ?? `${option.shapeName} (${option.noteCount} notes)`}
                                value={selectedShape}
                                autoHighlight={true}
                                onChange={(event, value, reason) => { if (selectedHomeNote === -1) { setSelectedHomeNote(homeNote ?? 0) } setSelectedShape(value); }}
                                options={explorerElements}
                                noOptionsText="¯\_(ツ)_/¯"
                                onInputChange={(event, value, reason) => {
                                    var leadingNoteName = value.match(inputBoxNoteNameRegex);
                                    if (leadingNoteName !== null) {
                                        var noteNum = getNoteNum(leadingNoteName[1]);
                                        if (noteNum !== -1) {
                                            setSelectedHomeNote(noteNum);
                                        }
                                    }
                                }}
                                filterOptions={(options, state) => {
                                    var filteredOptions: AutocompleteOptionType[] = [];
                                    const inputVal = state.inputValue.replace(inputBoxNoteNameRegex, "").toUpperCase().replace(/^(.)#/g, "$1").replace(/^(.)b/g, "$1");
                                    options.forEach((option) => {
                                        if ((!option.hasExplicitName) && (!inputVal.match(/(M$)|(MO$)|(MOD$)|(MODE[^A-Z]?)/g))) return;
                                        if (option.label.toUpperCase().includes(inputVal)) filteredOptions.push(option);
                                        else if (option.shapeName.toUpperCase().includes(inputVal)) filteredOptions.push(option);
                                    });
                                    return filteredOptions;
                                }}
                                sx={{
                                    width: autocompleteExplorerWidth, display: 'inline-block', bgcolor: 'transparent', color: 'red',
                                    '.MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'transparent',
                                        borderRadius: '9px',
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        border: '1px solid transparent',
                                    },
                                    '&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                                        borderRadius: '9px',
                                        backgroundColor: 'rgb(255,255,255,0.1)',
                                        border: '1px solid transparent',
                                    },
                                    '.MuiSvgIcon-root ': {
                                        fill: "white !important",
                                    },
                                    '.MuiAutocomplete-inputRoot': {
                                        color: "white",
                                        fontFamily: "monospace",
                                        border: '1px solid transparent',
                                    },
                                }}
                                renderInput={(params) => <TextField {...params} label="" />}
                            />
                            <Button type="submit" variant="contained"
                                sx={{
                                    color: 'white',
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        borderRadius: '9px',
                                        backgroundColor: 'rgb(255,255,255,0.1)',
                                    },
                                    "&.Mui-disabled": {
                                        background: 'transparent',
                                        color: "grey"
                                    }
                                }}
                                disabled={selectedShape == null || selectedHomeNote === -1}
                                onClick={() => {
                                    if (selectedShape != null && selectedHomeNote !== -1) {
                                        setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                                        resetSelectedShapeExplorerItems();
                                        setHomeNote(selectedHomeNote);
                                    }
                                    (document.activeElement as HTMLElement).blur();
                                }}>➔</Button>
                        </FormGroup>
                    </form>
                </Html>
            </Group >
        );
    }, [autocompleteExplorerWidth, explorerElements, explorerWidth, homeNote, infoTextElems, keySelectors, selectedHomeNote, selectedShape, setActiveShape, setHomeNote]);

    return (
        <Group>
            {fullRender}
            {/* <SettingsMenuOverlay fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay> */}
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
    const activeNotes = useNoteSet()(NoteSet.Active);
    const exactFit = useGetAllExactFits(activeNotes)[0];
    const homeNote = useHomeNote() ?? 0;

    const shape = exactFit?.shape ?? SCALE_CHROMATIC;
    const shapeOffset = exactFit?.noteToFirstNoteInShapeIdxOffset ?? 0;

    return React.useCallback((note: number) => getScaleDegree(homeNote + shapeOffset, note + shapeOffset, shape), [homeNote, shape, shapeOffset]);
}
export function useGetNoteFromActiveShapeScaleDegree() {
    const activeNotes = useNoteSet()(NoteSet.Active);
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
        // if (scaleDeg <= 0) scaleDeg += scaleDegToNote.length;
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
            const trueName = shape.notes[shapeIdx][1];
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
                };
            }
        }

        return {
            shape,
            doesFit: false,
            noteToFirstNoteInShapeIdxOffset: 0,
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
        }
        const shapesOfCorrectSize = knownShapes[notes.size] ?? [];
        return shapesOfCorrectSize.map(shape => tryToFitShape(shape, notes)).filter(shapeFit => shapeFit.doesFit).concat(defaultExactFit);
    }, [notes, tryToFitShape]);
}

export default HarmonyAnalyzer;