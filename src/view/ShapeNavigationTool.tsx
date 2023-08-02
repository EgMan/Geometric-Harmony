import React from "react";
import { Group, Text } from 'react-konva';
import { HarmonicShape, SCALE_CHROMATIC, ShapeType, knownShapes } from "../utils/KnownHarmonicShapes";
import { getNoteName, getNoteNum } from "../utils/Utils";
import { NoteSet, normalizeToSingleOctave, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote } from "../sound/NoteProvider";
import { Html } from "react-konva-utils";
import { MenuItem, FormGroup, Select, Button, Autocomplete, TextField, } from "@mui/material";
import { useSetActiveShape } from "../sound/HarmonicModulation";
import { WidgetComponentProps } from "./Widget";
import { getModeNameInShape, useGetAllExactFits } from "../toys/HarmonyAnalyzer";

const inputBoxNoteNameRegex = /^([aAbBcCdDeEfFgG][b#♭♯]?)\s/

type AutocompleteOptionType = {
    label: string;
    noteCount: number;
    shapeName: string;
    shapeNum: number;
    startingNoteNum: number;
    shape: HarmonicShape;
    hasExplicitName: boolean;
};

type Props =
    {
        width: number
        subdivisionCount: number
    }

function ShapeNavigationTool(props: Props) {

    const [selectedShape, setSelectedShape] = React.useState<AutocompleteOptionType | null>(null);
    const [selectedHomeNote, setSelectedHomeNote] = React.useState<number>(-1);

    const setActiveShape = useSetActiveShape();
    const setHomeNote = useSetHomeNote();

    const activeNotes = useNoteSet()(NoteSet.Active);
    const homeNote = useHomeNote();

    const activeExactFits = useGetAllExactFits(activeNotes);
    const activeExactFit = activeExactFits[0];

    const resetSelectedShapeExplorerItems = () => {
        setSelectedShape(null);
        setSelectedHomeNote(-1);
    }

    const keySelectorExplorerWidth = 70;
    const submitButtonExplorerWidth = 70;
    const autocompleteExplorerWidth = props.width - keySelectorExplorerWidth - submitButtonExplorerWidth;
    const explorerWidth = keySelectorExplorerWidth + autocompleteExplorerWidth + submitButtonExplorerWidth;

    const getElemKey = React.useCallback((shape: HarmonicShape, note: number) => {
        return `${shape.name}-${note}`;
    }, []);

    const explorerElementMap: Map<String, AutocompleteOptionType> = React.useMemo(() => {
        var elems: Map<String, AutocompleteOptionType> = new Map<String, AutocompleteOptionType>();
        knownShapes.forEach((shapes, noteCount) => {
            shapes.forEach((shape, shapeNum) => {
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
                    // if (label !== "") {
                    elems.set(getElemKey(shape, startingNoteNum), {
                        label,
                        noteCount,
                        shapeName: shape.name,
                        shapeNum,
                        startingNoteNum,
                        shape,
                        hasExplicitName,
                    });
                    // }
                });
                return elems;
            });
        });
        return elems;
    }, [getElemKey]);

    const explorerElements: AutocompleteOptionType[] = React.useMemo(() => {
        return Array.from(explorerElementMap.values());
    }, [explorerElementMap]);


    const keySelectors = React.useMemo(() => {
        return [<MenuItem key={'nullSelectorOption'} value={-1}>{""}</MenuItem>].concat(Array.from(Array(12).keys()).map((num, idx) => {
            return <MenuItem key={`selectorOption${idx}`} value={num}>{getNoteName(num, new Set())}</MenuItem>;
        }));
    }, []);

    const dropdownValue = React.useMemo(() => {
        if (homeNote === null || activeExactFit === null) return null;
        return explorerElementMap.get(getElemKey(activeExactFit?.shape, homeNote + activeExactFit.noteToFirstNoteInShapeIdxOffset)) ?? null;
    }, [activeExactFit, explorerElementMap, getElemKey, homeNote]);

    if (homeNote != null) {
        console.log("exploerElementMap", explorerElementMap);
        console.log("key", getElemKey(activeExactFit?.shape, homeNote + activeExactFit.noteToFirstNoteInShapeIdxOffset));
    }

    return (
        // <Html transform={true} divProps={{ id: "shape-tool-div" }}>
        <div id="shape-tool-div">
            <form onSubmit={evt => { evt.preventDefault() }}>
                <FormGroup row sx={{ backgroundColor: 'rgb(255,255,255,0)', borderRadius: '0px' }}>
                    <Select
                        id="explorer-dropdown"
                        // value={selectedHomeNote}
                        value={homeNote}
                        label="Note layout"
                        labelId="demo-simple-select-filled-label"
                        // onChange={e => { setSelectedHomeNote(e.target.value as number) }}
                        onChange={e => {
                            if (e.target.value != null) {
                                setHomeNote(e.target.value as number);
                                setActiveShape(activeExactFit.shape, e.target.value as number + (dropdownValue?.startingNoteNum ?? 0));
                            }
                        }}
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
                        // value={selectedShape}
                        value={dropdownValue ?? explorerElements[0]}
                        //getModeNameInShape(startingNoteNum, shape)
                        autoHighlight={true}
                        blurOnSelect={true}
                        onChange={(event, value, reason) => {
                            if (value != null) {
                                setActiveShape(value.shape, selectedHomeNote - value.startingNoteNum);
                            }
                            if (selectedHomeNote === -1) {
                                setSelectedHomeNote(homeNote ?? 0);
                            }
                            // setSelectedShape(value);
                        }}
                        // onBlur={
                        //     (event) => {
                        //         if (selectedShape != null && selectedHomeNote !== -1) {
                        //             setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                        //         }
                        //     }
                        // }
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
                        // onChange={(event, value, reason) => {
                        //     if (value != null && selectedShape != null) {
                        //         setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                        //     }
                        // }}
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
                            minWidth: autocompleteExplorerWidth, display: 'inline-block', bgcolor: 'transparent', color: 'red',
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
                    {/* <Button type="submit" variant="contained"
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
                        }}>➔</Button> */}
                </FormGroup>
            </form>
        </div >
        // </Html>
    );
}
export default ShapeNavigationTool;