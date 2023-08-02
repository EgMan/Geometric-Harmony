import React from "react";
import { Group, Text } from 'react-konva';
import { HarmonicShape, SCALE_CHROMATIC, ShapeType, knownShapes } from "../utils/KnownHarmonicShapes";
import { getNoteName, getNoteNum } from "../utils/Utils";
import { NoteSet, normalizeToSingleOctave, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote } from "../sound/NoteProvider";
import { Html } from "react-konva-utils";
import { MenuItem, FormGroup, Select, Button, Autocomplete, TextField, } from "@mui/material";
import { useSetActiveShape } from "../sound/HarmonicModulation";
import { WidgetComponentProps } from "./Widget";
import { getModeNameInShape } from "../toys/HarmonyAnalyzer";
import ShapeNavigationTool from "./ShapeNavigationTool";

type Props =
    {
        // width: number
        // subdivisionCount: number
    }

function ToolBar(props: Props) {
    const [muted, setIsMuted] = React.useState(true);
    return (
        <div style={{ position: "fixed", backgroundColor: "rgb(255,255,255,0.04)", borderRadius: "9px", transform: "translate(0, -5px)", width: "100vw", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
            <div>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
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
                // disabled={selectedShape == null || selectedHomeNote === -1}
                // onClick={() => {
                //     if (selectedShape != null && selectedHomeNote !== -1) {
                //         setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                //         resetSelectedShapeExplorerItems();
                //         setHomeNote(selectedHomeNote);
                //     }
                //     (document.activeElement as HTMLElement).blur();
                // }}
                >+</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
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
                // disabled={selectedShape == null || selectedHomeNote === -1}
                // onClick={() => {
                //     if (selectedShape != null && selectedHomeNote !== -1) {
                //         setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                //         resetSelectedShapeExplorerItems();
                //         setHomeNote(selectedHomeNote);
                //     }
                //     (document.activeElement as HTMLElement).blur();
                // }}
                >⚙</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.6em",
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
                // disabled={selectedShape == null || selectedHomeNote === -1}
                // onClick={() => {
                //     if (selectedShape != null && selectedHomeNote !== -1) {
                //         setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                //         resetSelectedShapeExplorerItems();
                //         setHomeNote(selectedHomeNote);
                //     }
                //     (document.activeElement as HTMLElement).blur();
                // }}
                >?</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.6em",
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
                // disabled={selectedShape == null || selectedHomeNote === -1}
                // onClick={() => {
                //     if (selectedShape != null && selectedHomeNote !== -1) {
                //         setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                //         resetSelectedShapeExplorerItems();
                //         setHomeNote(selectedHomeNote);
                //     }
                //     (document.activeElement as HTMLElement).blur();
                // }}
                >🎹</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
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
                    onClick={() => {
                        setIsMuted(muted => !muted);
                    }}
                >{muted ? "🔇" : "🔊"}</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
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
                    onClick={() => {
                    }}
                >⏯</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
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
                    onClick={() => {
                    }}
                >⧖</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
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
                    onClick={() => {
                    }}
                >♬</Button>
            </div>
            <ShapeNavigationTool width={600} subdivisionCount={12} />
            <div>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.5em",
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
                // disabled={selectedShape == null || selectedHomeNote === -1}
                // onClick={() => {
                //     if (selectedShape != null && selectedHomeNote !== -1) {
                //         setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                //         resetSelectedShapeExplorerItems();
                //         setHomeNote(selectedHomeNote);
                //     }
                //     (document.activeElement as HTMLElement).blur();
                // }}
                >♡</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
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
                // disabled={selectedShape == null || selectedHomeNote === -1}
                // onClick={() => {
                //     if (selectedShape != null && selectedHomeNote !== -1) {
                //         setActiveShape(selectedShape.shape, selectedHomeNote - selectedShape.startingNoteNum);
                //         resetSelectedShapeExplorerItems();
                //         setHomeNote(selectedHomeNote);
                //     }
                //     (document.activeElement as HTMLElement).blur();
                // }}
                >☮</Button>
            </div>
        </div>
    );
}
export default ToolBar;