import React from "react";
import { Button, ClickAwayListener, ListItemIcon, ListItemText, DialogTitle, MenuItem, MenuList, Paper, Popover, Switch, ThemeProvider, colors, createTheme, Select, } from "@mui/material";
import ShapeNavigationTool from "./ShapeNavigationTool";
import { WidgetTrackerActions, WidgetType } from "./ViewManager";
import { Stage } from "konva/lib/Stage";
import { getCurrentSpace } from "../utils/SpacesUtils";
import AddIcon from '@mui/icons-material/Add';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import CampaignIcon from '@mui/icons-material/Campaign';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ConstructionIcon from '@mui/icons-material/Construction';
import PianoIcon from '@mui/icons-material/Piano';
import SettingsIcon from '@mui/icons-material/Settings';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import TimelineIcon from '@mui/icons-material/Timeline';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useSettings } from "./SettingsProvider";
import { MidiFileDataProvider, MidiFileParser } from "../sound/MidiFileParser";
import { LocalSynthVoice } from "../sound/SynthVoicings";
// import useSettings from "./SettingsProvider"

type Props =
    {
        widgetTrackerActions: WidgetTrackerActions,
        stageRef: React.RefObject<Stage>,
        isPeaceModeEnabled: boolean,
        setIsPeaceModeEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    }
export const toolbarTheme = createTheme({
    palette: {
        primary: {
            main: colors.yellow[400],
        },
    },
    typography: {
        fontFamily: 'monospace',
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgb(255,255,255,0.04)',
                    backdropFilter: 'blur(13px)',
                    color: "white",
                    boxShadow: 'none',
                },
            },
        },
    },
});

function ToolBar(props: Props) {
    const addButtonRef = React.useRef(null);
    const [addDropdownOpen, setAddDropdownOpen] = React.useState(false);
    const [settingsDropdownOpen, setSettingsDropdownOpen] = React.useState(false);
    const [midiSettingsDropdownOpen, setMidiSettingsDropdownOpen] = React.useState(false);
    const addNewWidget = React.useCallback((widgetType: WidgetType) => {
        // const pos = props.stageRef.current?.getPointerPosition() ?? undefined;
        const space = getCurrentSpace();
        const pos = { x: (space.col + 0.5) * window.innerWidth, y: (space.row + 0.25) * window.innerHeight };
        props.widgetTrackerActions.spawnWidget(widgetType, pos);
        setAddDropdownOpen(false);
    }, [props.widgetTrackerActions]);
    const settings = useSettings();

    React.useEffect(() => {
        if (!addDropdownOpen) {
            (document.activeElement as HTMLElement).blur();
        }
    }, [props.stageRef, addDropdownOpen]);

    React.useEffect(() => {
        if (!settingsDropdownOpen) {
            (document.activeElement as HTMLElement).blur();
        }
    }, [props.stageRef, settingsDropdownOpen]);

    return (
        <div>
            <div ref={addButtonRef} style={{ position: "fixed", transform: "translate(0, 0px)", zIndex: 1, width: "100vw", backgroundColor: props.isPeaceModeEnabled ? "transparent" : "rgb(255,255,255,0.04)", borderBottomLeftRadius: "9px", borderBottomRightRadius: "9px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    {
                        props.isPeaceModeEnabled ? null :
                            <><Button type="submit" variant="contained"
                                sx={{
                                    fontSize: "0.7em",
                                    color: 'white',
                                    backgroundColor: 'transparent',
                                    boxShadow: 'none',
                                    padding: "1.8px",
                                    borderTopLeftRadius: '0px',
                                    borderTopRightRadius: '9px',
                                    borderBottomLeftRadius: '9px',
                                    borderBottomRightRadius: '9px',
                                    '&:hover': {
                                        backgroundColor: 'rgb(255,255,255,0.1)',
                                    },
                                    "&.Mui-disabled": {
                                        background: 'transparent',
                                        color: "grey"
                                    }
                                }}
                                onClick={() => {
                                    setAddDropdownOpen(true);
                                }}
                            >
                                <AddIcon fontSize="small" />
                            </Button>
                                <Button type="submit" variant="contained"
                                    sx={{
                                        fontSize: "0.7em",
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                        padding: "1.8px",
                                        borderTopLeftRadius: '0px',
                                        borderTopRightRadius: '9px',
                                        borderBottomLeftRadius: '9px',
                                        borderBottomRightRadius: '9px',
                                        '&:hover': {
                                            backgroundColor: 'rgb(255,255,255,0.1)',
                                        },
                                        "&.Mui-disabled": {
                                            background: 'transparent',
                                            color: "grey"
                                        }
                                    }}
                                    onClick={() => {
                                        setSettingsDropdownOpen(true);
                                    }}
                                >
                                    <SettingsIcon fontSize="small" style={{ height: '100%' }} />
                                </Button>
                                <Button type="submit" variant="contained"
                                    sx={{
                                        fontSize: "0.7em",
                                        color: 'white',
                                        backgroundColor: 'transparent',
                                        boxShadow: 'none',
                                        padding: "1.8px",
                                        borderTopLeftRadius: '0px',
                                        borderTopRightRadius: '9px',
                                        borderBottomLeftRadius: '9px',
                                        borderBottomRightRadius: '9px',
                                        '&:hover': {
                                            backgroundColor: 'rgb(255,255,255,0.1)',
                                        },
                                        "&.Mui-disabled": {
                                            background: 'transparent',
                                            color: "grey"
                                        }
                                    }}
                                    onClick={() => {
                                        setMidiSettingsDropdownOpen(true);
                                    }}
                                >
                                    <PianoIcon fontSize="small" />
                                </Button>
                            </>
                    }
                </div>
                <div>
                    {
                        props.isPeaceModeEnabled ? null :
                            <ShapeNavigationTool width={600} subdivisionCount={12} />
                    }
                </div>
                <div>
                    <Button type="submit" variant="contained"
                        onClick={() => props.setIsPeaceModeEnabled(enabled => !enabled)}
                        sx={{
                            fontSize: "0.7em",
                            color: 'white',
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            padding: "1.8px",
                            borderTopLeftRadius: '9px',
                            borderTopRightRadius: '0px',
                            borderBottomLeftRadius: '9px',
                            borderBottomRightRadius: '9px',
                            '&:hover': {
                                backgroundColor: 'rgb(255,255,255,0.1)',
                            },
                            "&.Mui-disabled": {
                                background: 'transparent',
                                color: "grey"
                            }
                        }}
                    >☮</Button>
                </div>
            </div>
            <div style={{ width: 320, maxWidth: '100%', zIndex: 1 }}>
                <ThemeProvider theme={toolbarTheme}>
                    <Popover
                        open={addDropdownOpen}
                        onClose={() => setAddDropdownOpen(false)}
                        anchorEl={addButtonRef.current}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: -10,
                        }}
                        style={{ transform: "translate(-15px, 0px)" }}
                        role={"menu"}
                        // placement="right-end"
                        // transition
                        disablePortal
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={() => setAddDropdownOpen(false)}>
                                <MenuList
                                // open={addDropdownOpen}
                                // onClose={() => setAddDropdownOpen(false)}
                                // anchorEl={addButtonRef.current}
                                >
                                    <DialogTitle sx={{ fontFamily: "monospace" }}>Toys</DialogTitle>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Piano)}>
                                        <ListItemIcon>
                                            <MusicNoteIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Piano</ListItemText>
                                        {/* <Typography variant="body2">
                                            ⌘X
                                        </Typography> */}
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Guitar)}>
                                        <ListItemIcon>
                                            <MusicNoteIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Guitar</ListItemText>
                                    </MenuItem>
                                    <MenuItem disabled={true} onClick={() => addNewWidget(WidgetType.Guitar)}>
                                        <ListItemIcon>
                                            <MusicNoteIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Harpejji</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Oscilloscope)}>
                                        <ListItemIcon>
                                            <TimelineIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Oscilloscope</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.FrequencyVis)}>
                                        <ListItemIcon>
                                            <TimelineIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Frequency Visualizer</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Tonnetz)}>
                                        <ListItemIcon>
                                            <ConstructionIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Tonnetz Diagram</ListItemText>
                                    </MenuItem>
                                    {/* <MenuItem onClick={() => addNewWidget(WidgetType.Wheel)}>
                                        <ListItemText>Wheel of Fifths</ListItemText>
                                    </MenuItem> */}
                                    <MenuItem disabled={true} onClick={() => addNewWidget(WidgetType.Wheel)}>
                                        <ListItemIcon>
                                            <ConstructionIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Circle of Fifths</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Wheel)}>
                                        <ListItemIcon>
                                            <ConstructionIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Circle of Semitones</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Analyzer)}>
                                        <ListItemIcon>
                                            <SquareFootIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Chord Identifier</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.PlayShapeGame)}>
                                        <ListItemIcon>
                                            <VideogameAssetIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Chord Game</ListItemText>
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Popover>
                    <Popover
                        open={settingsDropdownOpen}
                        onClose={() => setSettingsDropdownOpen(false)}
                        anchorEl={addButtonRef.current}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: -10,
                        }}
                        style={{ transform: "translate(-15px, 0px)" }}
                        role={"menu"}
                        disablePortal
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={() => setAddDropdownOpen(false)}>
                                <MenuList>
                                    <DialogTitle sx={{ fontFamily: "monospace" }}>General Settings</DialogTitle>
                                    <MenuItem onClick={() => settings?.setIsMuted(muted => !muted)}>
                                        <ListItemIcon>
                                            {settings?.isMuted ? <VolumeOffIcon style={{ color: "white" }} fontSize="small" /> : <VolumeUpIcon style={{ color: "white" }} fontSize="small" />}
                                        </ListItemIcon>
                                        <ListItemText> Mute sound output </ListItemText>
                                        <Switch checked={settings?.isMuted} onChange={e => settings?.setIsMuted(e.target.checked)}></Switch>
                                    </MenuItem>
                                    <MenuItem>
                                        <ListItemIcon>
                                            {settings?.isMuted ? <CampaignIcon style={{ color: "white" }} fontSize="small" /> : <VolumeUpIcon style={{ color: "white" }} fontSize="small" />}
                                        </ListItemIcon>
                                        <ListItemText> Synth voice </ListItemText>
                                        <Select
                                            sx={{ fontFamily: "monospace", marginLeft: "16px" }}
                                            id="menu-dropdown"
                                            value={settings?.localSynthVoice}
                                            label="Octave Count"
                                            labelId="demo-simple-select-filled-label"
                                            onChange={e => { settings?.setLocalSynthVoice(e.target.value as LocalSynthVoice) }}
                                        >
                                            <MenuItem value={LocalSynthVoice.Sine}>{LocalSynthVoice.Sine}</MenuItem>
                                            <MenuItem value={LocalSynthVoice.Triangle}>{LocalSynthVoice.Triangle}</MenuItem>
                                            <MenuItem value={LocalSynthVoice.Square}>{LocalSynthVoice.Square}</MenuItem>
                                            <MenuItem value={LocalSynthVoice.AMSynth}>{LocalSynthVoice.AMSynth}</MenuItem>
                                            <MenuItem value={LocalSynthVoice.FMSynth}>{LocalSynthVoice.FMSynth}</MenuItem>
                                        </Select>
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Popover>
                    <MidiFileDataProvider>
                        <Popover
                            open={midiSettingsDropdownOpen}
                            onClose={() => setMidiSettingsDropdownOpen(false)}
                            anchorEl={addButtonRef.current}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: -10,
                            }}
                            style={{ transform: "translate(-15px, 0px)" }}
                            role={"menu"}
                            disablePortal
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={() => setMidiSettingsDropdownOpen(false)}>
                                    <MenuList>
                                        <DialogTitle sx={{ fontFamily: "monospace" }}>MIDI Stuff</DialogTitle>
                                        <MenuItem onClick={() => { }}>
                                            <ListItemIcon>
                                                <AudioFileIcon style={{ color: "white" }} fontSize="small" />
                                            </ListItemIcon>
                                            <MidiFileParser key={"midifileparser"} closeContainer={() => setMidiSettingsDropdownOpen(false)} />
                                        </MenuItem>
                                        <MenuItem onClick={() => settings?.setPrioritizeMIDIAudio(val => !val)}>
                                            <ListItemIcon>
                                                <SettingsIcon style={{ color: "white" }} fontSize="small" />
                                            </ListItemIcon>
                                            {/* <ListItemText> Prioritize accurate audio timings over synchronicity with onscreen visuals </ListItemText> */}
                                            <ListItemText>Send midi events directly to devices</ListItemText>
                                            <Switch checked={settings?.prioritizeMIDIAudio} onChange={e => settings?.setPrioritizeMIDIAudio(e.target.checked)}></Switch>
                                        </MenuItem>
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Popover>
                    </MidiFileDataProvider>
                </ThemeProvider>
            </div>
        </div >
    );
}
export default ToolBar;