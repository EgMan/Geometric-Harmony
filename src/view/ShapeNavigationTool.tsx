import React from "react";
import { HarmonicShape, ShapeType, knownShapes } from "../utils/KnownHarmonicShapes";
import { getNoteName, getNoteNum } from "../utils/Utils";
import { NoteSet, normalizeToSingleOctave, useHomeNote, useNoteSet, useSetHomeNote } from "../sound/NoteProvider";
import { MenuItem, FormGroup, Select, Autocomplete, TextField, ThemeProvider, styled, } from "@mui/material";
import { useSetActiveShape } from "../sound/HarmonicModulation";
import { getModeNameInShape, useGetAllExactFits } from "../toys/HarmonyAnalyzer";
import { toolbarTheme } from "./ToolBar";

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

const AutocompleteGroupHeader = styled('div')(({ theme }) => ({
    position: 'sticky',
    top: '-8px',
    padding: '4px 10px',
    color: 'white',
    backgroundColor: 'rgb(48,48,48,0.85)',
    fontStyle: 'bold',
}));

const AutocompleteGroupItems = styled('ul')({
    fontFamily: 'monospace',
    padding: 0,
});

function ShapeNavigationTool(props: Props) {

    const setActiveShape = useSetActiveShape();
    const setHomeNote = useSetHomeNote();

    const activeNotes = useNoteSet()(NoteSet.Active);
    const homeNote = useHomeNote();

    const activeExactFits = useGetAllExactFits(activeNotes);
    const activeExactFit = activeExactFits[0];

    const keySelectorExplorerWidth = 70;
    const submitButtonExplorerWidth = 70;
    const autocompleteExplorerWidth = props.width - keySelectorExplorerWidth - submitButtonExplorerWidth;

    const getElemKey = React.useCallback((shape: HarmonicShape, note: number) => {
        return `${shape.name}-${normalizeToSingleOctave(note)}`;
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
                    elems.set(getElemKey(shape, startingNoteNum), {
                        label,
                        noteCount,
                        shapeName: shape.name,
                        shapeNum,
                        startingNoteNum,
                        shape,
                        hasExplicitName,
                    });
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

    const dropdownValue: AutocompleteOptionType | null = React.useMemo(() => {
        if (homeNote === null || activeExactFit === null) return null;
        return explorerElementMap.get(getElemKey(activeExactFit?.shape, homeNote + activeExactFit.noteToFirstNoteInShapeIdxOffset)) ?? null;
    }, [activeExactFit, explorerElementMap, getElemKey, homeNote]);

    return (
        <div id="shape-tool-div">
            <form onSubmit={evt => { evt.preventDefault() }}>
                <ThemeProvider theme={toolbarTheme}>
                    <FormGroup row sx={{ backgroundColor: 'rgb(255,255,255,0)', borderRadius: '0px' }}>
                        <Select
                            id="explorer-dropdown"
                            value={homeNote}
                            label="Note layout"
                            labelId="demo-simple-select-filled-label"
                            onChange={e => {
                                if (e.target.value != null) {
                                    setHomeNote(e.target.value as number);
                                    setActiveShape(activeExactFit.shape, e.target.value as number - (dropdownValue?.startingNoteNum ?? 0));
                                }
                            }}
                            sx={{
                                width: keySelectorExplorerWidth,
                                color: "white",
                                // backgroundColor: "rbga(0,0,0,0.5)",
                                // '.explorer-dropdown': {
                                //     color: "yellow",
                                // },
                                // "& .MuiSvgIcon-root": {
                                //     right: "unset",
                                //     left: "0px",
                                // },
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
                            value={dropdownValue}
                            autoHighlight={true}
                            blurOnSelect={true}
                            onChange={(event, value, reason) => {
                                if (value != null) {
                                    setActiveShape(value.shape, (homeNote ?? 0) - value.startingNoteNum);
                                }
                            }}
                            options={explorerElements}
                            noOptionsText="¯\_(ツ)_/¯"
                            onInputChange={(event, value, reason) => {
                                var leadingNoteName = value.match(inputBoxNoteNameRegex);
                                if (leadingNoteName !== null) {
                                    var noteNum = getNoteNum(leadingNoteName[1]);
                                    if (noteNum !== -1) {
                                        setHomeNote(noteNum);
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
                            renderGroup={(params) => (
                                <li key={params.key}>
                                    <AutocompleteGroupHeader>{params.group}</AutocompleteGroupHeader>
                                    <AutocompleteGroupItems>{params.children}</AutocompleteGroupItems>
                                </li>
                            )}
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
                                    color: "yellow",
                                    fontFamily: "monospace",
                                    border: '1px solid transparent',
                                },
                                '.MuiAutocomplete-groupLabel': {
                                    color: "yellow",
                                    backgroundColor: "rgb(255,255,255,0.1)",
                                    fontFamily: "monospace",
                                    border: '1px solid transparent',
                                },
                            }}
                            renderInput={(params) => <TextField {...params} label="" />}
                        />
                    </FormGroup>
                </ThemeProvider>
            </form>
        </div >
    );
}
export default ShapeNavigationTool;