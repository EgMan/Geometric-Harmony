import React from "react";
import { Text } from 'react-konva';
import { HarmonicShape, knownShapes } from "./KnownHarmonicShapes";
import Widget from "./Widget";
import { getNoteName } from "./Utils";
import { NoteSet, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote } from "./NoteProvider";
import { Html } from "react-konva-utils";
import { MenuItem, FormGroup, Select, Button, Autocomplete, TextField, } from "@mui/material";
import { useSetActiveShape } from "./HarmonicModulation";

// TODO make these dependent on props.width
const keySelectorExplorerWidth = 70;
const autocompleteExplorerWidth = 400;
const submitButtonExplorerWidth = 70;
const explorerWidth = keySelectorExplorerWidth + autocompleteExplorerWidth + submitButtonExplorerWidth;

type Props =
    {
        x: number
        y: number
        width: number
        subdivisionCount: number
    }

function HarmonyAnalyzer(props: Props) {
    const activeNotes = useNoteSet()(NoteSet.Active);
    const emphasizedNotes = useGetCombinedModdedEmphasis()();
    const setActiveShape = useSetActiveShape();
    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();

    const [selectedShape, setSelectedShape] = React.useState<AutocompleteOptionType | null>(null);
    const [selectedHomeNote, setSelectedHomeNote] = React.useState<number>(-1);

    const resetSelectedShapeExplorerItems = () => {
        setSelectedShape(null);
        setSelectedHomeNote(-1);
    }

    const tryToFitShape = React.useCallback((shape: HarmonicShape, notes: Set<number>) => {
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
                if (!notes.has((noteStart + idx) % props.subdivisionCount)) {
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
    }, [props.subdivisionCount])

    const getAllExactFits = React.useCallback((notes: Set<number>) => {
        const shapesOfCorrectSize = knownShapes[notes.size] ?? [];

        return shapesOfCorrectSize.map(shape => tryToFitShape(shape, notes)).filter(shapeFit => shapeFit.doesFit);
    }, [tryToFitShape])

    const exactFits = getAllExactFits(activeNotes);
    const exactFit = exactFits[0];
    const exactFitName = exactFit ? exactFit.shape.name : "";

    const getNoteNameInExactFitShape = React.useCallback((note: number) => {
        if (exactFit === null || exactFit === undefined) return getNoteName(note, activeNotes);
        let shapeIdx = (note + exactFit.noteToFirstNoteInShapeIdxOffset) % props.subdivisionCount;
        if (shapeIdx < 0) shapeIdx += props.subdivisionCount;
        if (shapeIdx >= exactFit.shape.notes.length || shapeIdx < 0) return getNoteName(note, activeNotes);
        return `${getNoteName(note, activeNotes)} ${exactFit.shape.notes[shapeIdx][1] ? exactFit.shape.notes[shapeIdx][1] : (exactFit.shape.notes[0][1] ? `${exactFit.shape.notes[0][1]} mode` : "")}`;
    }, [activeNotes, exactFit, props.subdivisionCount]);


    const infoTextElems = React.useMemo(() => {
        const emphasizedNoteInfo = Array.from(emphasizedNotes).map(note => {
            return getNoteNameInExactFitShape(note) ?? '?';
        }).filter(info => info !== '');
        console.log("empha note info", emphasizedNoteInfo);

        // Populate infos that display under the shape explorer
        type Info = {
            text: string;
            color: string;
        }
        var infos: Info[] = [];
        infos.push({
            text: exactFitName,
            color: "white",
        });
        if (homeNote !== null) {
            infos.push({
                text: getNoteNameInExactFitShape(homeNote),
                color: "yellow",
            });
        }
        emphasizedNoteInfo.forEach((infoText) => {
            console.log("infoText: " + infoText + "");
            infos.push({
                text: infoText,
                color: "red",
            });
        });

        // Convert infos to text elements
        var idx = 0;
        const textelemoffset = 35;
        const infosYOffset = 50;
        const infosFontSize = 30;
        return infos.filter(info => info.text !== "").map((info) => {
            console.log(idx);
            console.log("info: " + info);
            return (<Text key={`info${info.text}${idx++}`} text={info.text} x={0} y={textelemoffset * (idx) + infosYOffset} fontSize={infosFontSize} fontFamily='monospace' fill={info.color} align="center" width={explorerWidth} />);
        });
    }, [emphasizedNotes, exactFitName, getNoteNameInExactFitShape, homeNote]);

    type AutocompleteOptionType = {
        label: string;
        noteCount: number;
        shapeName: string;
        shapeNum: number;
        startingNoteNum: number;
        shape: HarmonicShape;
    }
    const explorerElements: AutocompleteOptionType[] = React.useMemo(() => {
        return knownShapes.map((shapes, noteCount) => {
            return shapes.map((shape, shapeNum) => {
                var elems: AutocompleteOptionType[] = [];
                shape.notes.forEach((startingNote, startingNoteNum) => {
                    // Don't list notes not in the shape
                    if (startingNote[0] === false) return;

                    if (startingNote.length < 2) return;

                    // Label defaults to shape name + mode number if no name is specified
                    const label = startingNote.length < 2 ? `${shape.name} mode ${startingNoteNum}` : startingNote[1] ?? "unknown";

                    elems.push({
                        label,
                        noteCount,
                        shapeName: shape.name,
                        shapeNum,
                        startingNoteNum,
                        shape,
                    });
                });
                return elems;
            });
        }).flat(2);
    }, []);

    const keySelectors = React.useMemo(() => {
        return [<MenuItem value={-1}>{""}</MenuItem>].concat(Array.from(Array(12).keys()).map(num => {
            return <MenuItem value={num}>{getNoteName(num, new Set())}</MenuItem>;
        }));
    }, []);

    return (
        <Widget
            x={props.x - (explorerWidth / 2)}
            y={props.y}
            // contextMenuX={window.innerWidth / 2}
            // contextMenuY={60}>
            contextMenuX={-20}
            contextMenuY={20}>
            {infoTextElems}
            <Html transform={true} divProps={{ id: "shape-tool-div" }}>
                <form onSubmit={evt => { evt.preventDefault(); console.log("submit", evt) }}>
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
                            size="small"
                            inputMode="text"
                            groupBy={(option) => option.shapeName}
                            value={selectedShape}
                            onChange={(event, value, reason) => { if (selectedHomeNote === -1) { setSelectedHomeNote(0) } setSelectedShape(value); }}
                            options={explorerElements}
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
                            }}>➔</Button>
                    </FormGroup>
                </form>
            </Html>
        </Widget >
    );
}

export default HarmonyAnalyzer;