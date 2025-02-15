import React from "react";
import { Button, ClickAwayListener, ListItemIcon, ListItemText, DialogTitle, MenuItem, MenuList, Paper, Popover, Switch, Select, Tooltip, Toolbar as MUItoolbar, Badge, Typography } from "@mui/material";
import ShapeNavigationTool from "./ShapeNavigationTool";
import { WidgetConfig, WidgetTrackerActions, WidgetType } from "./ViewManager";
import { Stage } from "konva/lib/Stage";
import { getCurrentSpace } from "../utils/SpacesUtils";
import AddBoxIcon from '@mui/icons-material/AddBox';
import CampaignIcon from '@mui/icons-material/Campaign';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ConstructionIcon from '@mui/icons-material/Construction';
import PianoIcon from '@mui/icons-material/Piano';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
// import SettingsIcon from '@mui/icons-material/Settings';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import TimelineIcon from '@mui/icons-material/Timeline';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useSettings } from "./SettingsProvider";
import { MidiFileDataProvider, MidiFileParser } from "../sound/MidiFileParser";
import { LocalSynthVoice } from "../sound/SynthVoicings";
import DensityMediumRoundedIcon from '@mui/icons-material/DensityMediumRounded';
import MIDIConnectionManager from "../sound/MIDIConnectionManager";
import { useAppTheme, useChangeAppTheme } from "./ThemeManager";
import { blendColors, changeLightness, getNoteName, getRandomColor, getRandomColorWithAlpha } from "../utils/Utils";
import VolumeSlider from "../sound/VolumeSlider";
import { WidgetConfig_Wheel_Figths as WidgetConfig_Wheel_Fifths, WidgetConfig_Wheel_Semitones } from "../toys/Wheel";
import { WidgetConfig_String_Guitar, WidgetConfig_String_Harpejji } from "../toys/StringInstrument";
import CharIcon from "./CharIcon";
import { normalizeToSingleOctave, useNoteBank } from "../sound/NoteProvider";
import { getAllExactFits, getModeNameInShape, getNoteNameInExactFitShape, maybeModulateNoteFromShapeType, useGetAllExactFits } from "../toys/HarmonyAnalyzer";
import { shapeToNoteArray } from "../sound/HarmonicModulation";
import { useActiveNoteBank } from "../utils/NotesetBank";
// import useSettings from "./SettingsProvider"

type Props =
    {
        widgetTrackerActions: WidgetTrackerActions,
        stageRef: React.RefObject<Stage>,
        setIsHeartModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    }

function ToolBar(props: Props) {
    const addButtonRef = React.useRef(null);
    const [addDropdownOpen, setAddDropdownOpen] = React.useState(false);
    const [settingsDropdownOpen, setSettingsDropdownOpen] = React.useState(false);
    const [midiSettingsDropdownOpen, setMidiSettingsDropdownOpen] = React.useState(false);
    const [noteBankDropdownOpen, setNoteBankDropdownOpen] = React.useState(false);
    const addNewWidget = React.useCallback((widgetType: WidgetType, config?: WidgetConfig) => {
        // const pos = props.stageRef.current?.getPointerPosition() ?? undefined;
        const space = getCurrentSpace();
        const pos = { x: (space.col + 0.5) * window.innerWidth, y: (space.row + 0.25) * window.innerHeight };
        props.widgetTrackerActions.spawnWidget(widgetType, pos, config);
        setAddDropdownOpen(false);
    }, [props.widgetTrackerActions]);
    const settings = useSettings();
    const changeTheme = useChangeAppTheme();
    const { colorPalette } = useAppTheme()!;
    const noteBank = useNoteBank();

    const swapBank = useActiveNoteBank();
    const noteBankElems = React.useMemo(() => {
        return noteBank.get.entries.map((noteBankEntry, i) => {
            const noteBankFit = getAllExactFits(new Set(noteBankEntry.activeNotes))[0];
            const label = getNoteNameInExactFitShape(new Set(noteBankEntry.activeNotes), noteBankEntry.homeNote ?? 0, noteBankFit);
            return <MenuItem selected={i === noteBank.get.activeIndex} key={`${i}`} onClick={() => {
                swapBank(i);
            }}>
                <CharIcon charDisplay={`${i}`} />
                <ListItemText>{label}</ListItemText>
            </MenuItem>
        });
    }, [noteBank.get.activeIndex, noteBank.get.entries, swapBank]);

    React.useEffect(() => {
        if (!addDropdownOpen && !settingsDropdownOpen && !midiSettingsDropdownOpen && !noteBankDropdownOpen) {
            (document.activeElement as HTMLElement).blur();
        }
    }, [props.stageRef, addDropdownOpen, settingsDropdownOpen, midiSettingsDropdownOpen, noteBankDropdownOpen]);

    return (
        <div>
            <div ref={addButtonRef} style={{ position: "fixed", transform: "translate(0, 0px)", zIndex: 1, width: "100vw", backgroundColor: "transparent", borderBottomLeftRadius: "9px", borderBottomRightRadius: "9px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex" }}>
                    {
                        settings?.isPeaceModeEnabled ? null :
                            <>
                                <Tooltip title="Toys">
                                    <Button type="submit" variant="contained"
                                        sx={{
                                            height: "auto",
                                            maxWidth: '66px',
                                            minWidth: '66px',
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
                                                // background: 'transparent',
                                                // color: "grey"
                                            }
                                        }}
                                        onClick={() => {
                                            setAddDropdownOpen(true);
                                        }}
                                    >
                                        <AddBoxIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Color">
                                    <Button type="submit" variant="contained"
                                        sx={{
                                            height: "auto",
                                            maxWidth: '66px',
                                            minWidth: '66px',
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
                                        onClick={
                                            () => changeTheme?.(prev => {
                                                const Widget_Primary = changeLightness(getRandomColor(), 1.25);
                                                const Main_Background = changeLightness(getRandomColor(), 0.75);
                                                const Widget_MutedPrimary = blendColors([Widget_Primary, Widget_Primary, Widget_Primary, Main_Background, Main_Background])!;
                                                return {
                                                    ...prev,
                                                    Main_Background,
                                                    UI_Background: getRandomColorWithAlpha(),
                                                    UI_Primary: getRandomColor(),
                                                    UI_Accent: getRandomColor(),
                                                    // Interval_Semitone: getRandomColor(),
                                                    // Interval_Wholetone: getRandomColor(),
                                                    // Interval_MinorThird: getRandomColor(),
                                                    // Interval_MajorThird: getRandomColor(),
                                                    // Interval_PerfectFourth: getRandomColor(),
                                                    // Interval_Tritone: getRandomColor(),
                                                    Widget_Primary,
                                                    Widget_MutedPrimary,
                                                    Note_Home: getRandomColor(),
                                                }
                                            }
                                            )
                                        }
                                    >
                                        <ColorLensIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Sound">
                                    <Button type="submit" variant="contained"
                                        sx={{
                                            height: "auto",
                                            maxWidth: '66px',
                                            minWidth: '66px',
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
                                        <HeadphonesIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" style={{ height: '100%' }} />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="MIDI">
                                    <Button type="submit" variant="contained"
                                        sx={{
                                            height: "34px",
                                            maxWidth: '66px',
                                            minWidth: '66px',
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
                                        <PianoIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Quick Swap">
                                    <Button type="submit" variant="contained"
                                        sx={{
                                            height: "34px",
                                            maxWidth: '66px',
                                            minWidth: '66px',
                                            fontSize: "0.7em",
                                            color: `${colorPalette.UI_Primary}`,
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
                                            setNoteBankDropdownOpen(true);
                                        }}
                                    >
                                        <CharIcon charDisplay={`${noteBank.get.activeIndex}`} />
                                    </Button>
                                </Tooltip>
                            </>
                    }
                </div>
                <div style={{ display: "flex", height: "auto" }}>
                    {
                        settings?.isPeaceModeEnabled ? null :
                            <ShapeNavigationTool width={600} subdivisionCount={12} />
                    }
                </div>
                <div style={{ display: "flex", height: "auto" }}>
                    {
                        settings?.isPeaceModeEnabled ? null :
                            <Tooltip title="Love">
                                <Button type="submit" variant="contained"
                                    onClick={() => props.setIsHeartModalOpen(enabled => !enabled)}
                                    sx={{
                                        maxWidth: '66px',
                                        minWidth: '66px',
                                        fontSize: "18px",
                                        color: colorPalette.UI_Primary,
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
                                >

                                    <FavoriteBorderRoundedIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                </Button>
                            </Tooltip>
                    }
                    <Tooltip title="Peace">
                        <Button type="submit" variant="contained"
                            onClick={() => settings?.setIsPeaceModeEnabled(enabled => !enabled)}
                            sx={{
                                maxWidth: '66px',
                                minWidth: '66px',
                                maxHeight: '34px',
                                minHeight: '34px',
                                fontSize: "28px",
                                color: colorPalette.UI_Primary,
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
                    </Tooltip>
                </div>
            </div>
            <div style={{ width: 320, maxWidth: '100%', zIndex: 1 }}>
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
                                <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>Spawn Toys</DialogTitle>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Piano)}>
                                    <ListItemIcon>
                                        <MusicNoteIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Piano</ListItemText>
                                    {/* <Typography variant="body2">
                                            ⌘X
                                        </Typography> */}
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Guitar, WidgetConfig_String_Guitar)}>
                                    <ListItemIcon>
                                        <MusicNoteIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Guitar</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Guitar, WidgetConfig_String_Harpejji)}>
                                    <ListItemIcon>
                                        <MusicNoteIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Harpejji</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Oscilloscope)}>
                                    <ListItemIcon>
                                        <TimelineIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Oscilloscope</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.FrequencyVis)}>
                                    <ListItemIcon>
                                        <TimelineIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Frequency Visualizer</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Tonnetz)}>
                                    <ListItemIcon>
                                        <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Tonnetz Diagram</ListItemText>
                                </MenuItem>
                                {/* <MenuItem onClick={() => addNewWidget(WidgetType.Wheel)}>
                                        <ListItemText>Wheel of Fifths</ListItemText>
                                    </MenuItem> */}
                                <MenuItem onClick={() => addNewWidget(WidgetType.Wheel, WidgetConfig_Wheel_Fifths)}>
                                    <ListItemIcon>
                                        <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Circle of Fifths</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Wheel, WidgetConfig_Wheel_Semitones)}>
                                    <ListItemIcon>
                                        <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Circle of Semitones</ListItemText>
                                </MenuItem>
                                <MenuItem disabled={true} onClick={() => addNewWidget(WidgetType.Wheel)}>
                                    <ListItemIcon>
                                        <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Spiral of Fifths</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Spiral)}>
                                    <ListItemIcon>
                                        <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Spiral of Semitones</ListItemText>
                                </MenuItem>
                                <MenuItem disabled={true} onClick={() => addNewWidget(WidgetType.Wheel)}>
                                    <ListItemIcon>
                                        <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Icosahedron of Fifths</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Icosahedron)}>
                                    <ListItemIcon>
                                        <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Icosahedron of Semitones</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.Analyzer)}>
                                    <ListItemIcon>
                                        <SquareFootIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText>Chord Identifier</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => addNewWidget(WidgetType.PlayShapeGame)}>
                                    <ListItemIcon>
                                        <VideogameAssetIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
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
                                <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>In-Browser Synth Settings</DialogTitle>
                                <MenuItem >
                                    <ListItemIcon>
                                        {settings?.isMuted ? <VolumeOffIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <VolumeUpIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <VolumeSlider />
                                </MenuItem>
                                <MenuItem onClick={() => settings?.setIsMuted(muted => !muted)}>
                                    <ListItemIcon>
                                        {settings?.isMuted ? <VolumeOffIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <VolumeUpIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText> In-browser Synth </ListItemText>
                                    <Switch checked={!settings?.isMuted} onChange={e => settings?.setIsMuted(!e.target.checked)}></Switch>
                                </MenuItem>
                                <MenuItem onClick={() => settings?.setIsPercussionMuted(muted => !muted)}>
                                    <ListItemIcon>
                                        {settings?.isPercussionMuted ? <VolumeOffIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <VolumeUpIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText> In-browser Percussion (beta) </ListItemText>
                                    <Switch checked={!settings?.isPercussionMuted} onChange={e => settings?.setIsPercussionMuted(!e.target.checked)}></Switch>
                                </MenuItem>
                                <MenuItem>
                                    <ListItemIcon>
                                        <CampaignIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
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
                                    {/* <DialogTitle sx={{ fontFamily: "monospace" }}>MIDI Stuff</DialogTitle> */}
                                    <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>MIDI File</DialogTitle>
                                    <MidiFileParser key={"midifileparser"} closeContainer={() => setMidiSettingsDropdownOpen(false)} />
                                    <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>MIDI Devices</DialogTitle>
                                    <MenuItem onClick={() => { }}>
                                        <MIDIConnectionManager key={"midiconnectionmanager"} />
                                    </MenuItem>
                                    {/* TODO: Clean up this code */}
                                    {/* <MenuItem onClick={() => settings?.setPrioritizeMIDIAudio(val => !val)}>
                                            <ListItemIcon>
                                                <SettingsIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>Send midi events directly to devices</ListItemText>
                                            <Switch checked={settings?.prioritizeMIDIAudio} onChange={e => settings?.setPrioritizeMIDIAudio(e.target.checked)}></Switch>
                                        </MenuItem> */}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Popover>
                </MidiFileDataProvider>
                <Popover
                    open={noteBankDropdownOpen}
                    onClose={() => setNoteBankDropdownOpen(false)}
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
                        <ClickAwayListener onClickAway={() => setNoteBankDropdownOpen(false)}>
                            <MenuList>
                                <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold" }}>Shapes Bound to Number Keys</DialogTitle>
                                {noteBankElems}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Popover>
            </div>
        </div >
    );
}

export default ToolBar;