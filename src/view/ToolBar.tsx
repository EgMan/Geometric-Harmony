import React from "react";
import { Box, Button, ClickAwayListener, Collapse, ListItemIcon, ListItemText, DialogTitle, MenuItem, MenuList, Paper, Popover, Switch, Select, Slider, Tooltip, Toolbar as MUItoolbar, Badge, Typography, Chip, ListItem } from "@mui/material";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ShapeNavigationTool from "./ShapeNavigationTool";
import { WidgetConfig, WidgetTrackerActions, WidgetType } from "./ViewManager";
import { Stage } from "konva/lib/Stage";
import AddBoxIcon from '@mui/icons-material/AddBox';
import CampaignIcon from '@mui/icons-material/Campaign';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import ConstructionIcon from '@mui/icons-material/Construction';
import PianoIcon from '@mui/icons-material/Piano';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import WidgetsIcon from '@mui/icons-material/Widgets';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import TimelineIcon from '@mui/icons-material/Timeline';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useSettings } from "./SettingsProvider";
import { MidiFileDataProvider, MidiFileParser } from "../sound/MidiFileParser";
import { MidiTransport } from "./MidiTransport";
import { LocalSynthVoice } from "../sound/SynthVoicings";
import DensityMediumRoundedIcon from '@mui/icons-material/DensityMediumRounded';
import { NoteDisplayMode } from "./SettingsProvider";
import MIDIConnectionManager from "../sound/MIDIConnectionManager";
import MicIcon from '@mui/icons-material/Mic';
import { useAppTheme, useChangeAppTheme, Theme_Classic, Theme_BlackOnWhite, Theme_WhiteOnBlack, ColorPalette } from "./ThemeManager";
import { blendColors, changeLightness, getRandomColor, getRandomColorWithAlpha } from "../utils/Utils";
import VolumeSlider from "../sound/VolumeSlider";
import { WidgetConfig_Wheel_Figths as WidgetConfig_Wheel_Fifths, WidgetConfig_Wheel_Semitones } from "../toys/Wheel";
import { WidgetConfig_String_Guitar, WidgetConfig_String_Harpejji } from "../toys/StringInstrument";
import CharIcon from "./CharIcon";
import { normalizeToSingleOctave, useNoteBank } from "../sound/NoteProvider";
import { getAllExactFits, getModeNameInShape, getNoteNameInExactFitShape, maybeModulateNoteFromShapeType, useGetAllExactFits } from "../toys/HarmonyAnalyzer";
import { shapeToNoteArray } from "../sound/HarmonicModulation";
import { useActiveNoteBank } from "../utils/NotesetBank";
import { on } from "events";
import { ShapeType } from "../utils/KnownHarmonicShapes";
const TOOLBAR_Z_INDEX = 1301;
const SHAPE_NAV_WIDTH = 600;
// import useSettings from "./SettingsProvider"

function cssColorToHex(color: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function getAlpha(color: string): number | null {
    const match = color.match(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
    return match ? parseFloat(match[1]) : null;
}

function hexToRgba(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const colorGroups: { label: string; fields: { key: keyof ColorPalette; label: string }[] }[] = [
    {
        label: 'UI',
        fields: [
            { key: 'Main_Background', label: 'Background' },
            { key: 'UI_Primary', label: 'Text & Icons' },
            { key: 'UI_Background', label: 'Panel' },
            { key: 'UI_Background_Alternate', label: 'Panel Alt' },
            { key: 'UI_Accent', label: 'Accent' },
        ]
    },
    {
        label: 'Widgets',
        fields: [
            { key: 'Widget_Primary', label: 'Primary' },
            { key: 'Widget_MutedPrimary', label: 'Muted Primary' },
        ]
    },
    {
        label: 'Notes',
        fields: [
            { key: 'Note_Active', label: 'Active' },
            { key: 'Note_Home', label: 'Home' },
        ]
    },
    {
        label: 'Intervals',
        fields: [
            { key: 'Interval_Semitone', label: 'Semitone' },
            { key: 'Interval_Wholetone', label: 'Whole Tone' },
            { key: 'Interval_MinorThird', label: 'Minor Third' },
            { key: 'Interval_MajorThird', label: 'Major Third' },
            { key: 'Interval_PerfectFourth', label: 'Perfect Fourth' },
            { key: 'Interval_Tritone', label: 'Tritone' },
        ]
    },
];

type Props =
    {
        widgetTrackerActions: WidgetTrackerActions,
        stageRef: React.RefObject<Stage>,
        setIsHeartModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
        onWidgetHover: (info: { type: WidgetType, config?: WidgetConfig } | null) => void,
        onHeightChange?: (height: number) => void,
    }

function ToolBar(props: Props) {
    const addButtonRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const el = addButtonRef.current;
        if (!el || !props.onHeightChange) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                props.onHeightChange?.(entry.contentRect.height);
            }
        });
        observer.observe(el);
        return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const [addDropdownOpen, setAddDropdownOpen] = React.useState(false);
    const [settingsDropdownOpen, setSettingsDropdownOpen] = React.useState(false);
    const [midiSettingsDropdownOpen, setMidiSettingsDropdownOpen] = React.useState(false);
    const [noteBankDropdownOpen, setNoteBankDropdownOpen] = React.useState(false);
    const [instrumentsOpen, setInstrumentsOpen] = React.useState(false);
    const [toolsOpen, setToolsOpen] = React.useState(false);
    const [abstractOpen, setAbstractOpen] = React.useState(false);
    const [exercisesOpen, setExercisesOpen] = React.useState(false);
    const [colorDropdownOpen, setColorDropdownOpen] = React.useState(false);
    const [otherDropdownOpen, setOtherDropdownOpen] = React.useState(false);
    const [customizeOpen, setCustomizeOpen] = React.useState(false);
    const isClosingRef = React.useRef(false);
    const isTouchRef = React.useRef(false);
    const addNewWidget = React.useCallback((widgetType: WidgetType, config?: WidgetConfig) => {
        // const pos = props.stageRef.current?.getPointerPosition() ?? undefined;
        const pos = { x: 0.5 * window.innerWidth, y: 0.25 * window.innerHeight };
        isClosingRef.current = true;
        isTouchRef.current = false;
        props.widgetTrackerActions.spawnWidget(widgetType, pos, config);
        setAddDropdownOpen(false);
        props.onWidgetHover(null);
    }, [props.widgetTrackerActions, props.onWidgetHover]);
    const onItemHover = React.useCallback((info: { type: WidgetType, config?: WidgetConfig } | null) => {
        if (!isClosingRef.current && !isTouchRef.current) props.onWidgetHover(info);
    }, [props.onWidgetHover]);
    const settings = useSettings();
    const changeTheme = useChangeAppTheme();
    const { colorPalette } = useAppTheme()!;
    const noteBank = useNoteBank();

    const hexColors = React.useMemo(() => {
        const result: Partial<Record<keyof ColorPalette, string>> = {};
        for (const group of colorGroups) {
            for (const field of group.fields) {
                result[field.key] = cssColorToHex(colorPalette[field.key]);
            }
        }
        return result;
    }, [colorPalette]);

    const handleColorChange = React.useCallback((key: keyof ColorPalette, hexValue: string) => {
        changeTheme?.(prev => {
            const alpha = getAlpha(prev[key]);
            const newColor = alpha !== null ? hexToRgba(hexValue, alpha) : hexValue;
            const updated = { ...prev, [key]: newColor };
            if (key === 'Main_Background' || key === 'Widget_Primary') {
                updated.Widget_MutedPrimary = blendColors([
                    updated.Widget_Primary, updated.Widget_Primary, updated.Widget_Primary,
                    updated.Main_Background, updated.Main_Background
                ])!;
            }
            return updated;
        });
    }, [changeTheme]);

    const anyDropdownOpen = addDropdownOpen || colorDropdownOpen || settingsDropdownOpen || midiSettingsDropdownOpen || noteBankDropdownOpen || otherDropdownOpen;

    const closeAllDropdowns = React.useCallback(() => {
        setAddDropdownOpen(false);
        setColorDropdownOpen(false);
        setSettingsDropdownOpen(false);
        setMidiSettingsDropdownOpen(false);
        setNoteBankDropdownOpen(false);
        setOtherDropdownOpen(false);
        props.onWidgetHover(null);
    }, [props.onWidgetHover]);

    const swapBank = useActiveNoteBank();
    const noteBankElems = React.useMemo(() => {
        return noteBank.get.entries.map((noteBankEntry, i) => {
            const noteBankFit = getAllExactFits(new Set(noteBankEntry.activeNotes), noteBankEntry.homeNote, ShapeType.SCALE)[0];
            const label = getNoteNameInExactFitShape(new Set(noteBankEntry.activeNotes), noteBankEntry.homeNote ?? 0, noteBankFit);
            const shapeType = ShapeType[noteBankFit.shape.type].toString().toLowerCase();
            return <MenuItem
                selected={i === noteBank.get.activeIndex}
                key={`${i}`}
                onClick={() => {
                    swapBank(i);
                }}
                onKeyDown={(e) => {
                    if (e.key === "ArrowDown") {
                        swapBank(i + 1);
                    }
                    if (e.key === "ArrowUp") {
                        swapBank(i - 1);
                    }
                    const keyAsNum = Number(e.key);
                    if (!Number.isNaN(keyAsNum)) {
                        swapBank(keyAsNum);
                    }
                }}
            >
                <CharIcon charDisplay={`${i}`} />
                <ListItemText
                    primaryTypographyProps={{ sx: { pl: "12px", pr: "12px" } }}
                    sx={{ color: colorPalette.Note_Home }}
                >{label}</ListItemText>
                <Chip label={`${shapeType[0].toUpperCase()}${shapeType.slice(1)}`} size="small" sx={{ color: colorPalette.UI_Primary, fontFamily: "monospace" }} />
            </MenuItem>
        });
    }, [colorPalette.Note_Home, colorPalette.UI_Primary, noteBank.get.activeIndex, noteBank.get.entries, swapBank]);

    React.useEffect(() => {
        if (!addDropdownOpen && !settingsDropdownOpen && !midiSettingsDropdownOpen && !noteBankDropdownOpen && !otherDropdownOpen) {
            (document.activeElement as HTMLElement).blur();
        }
    }, [props.stageRef, addDropdownOpen, settingsDropdownOpen, midiSettingsDropdownOpen, noteBankDropdownOpen, otherDropdownOpen]);

    React.useEffect(() => {
        if (!addDropdownOpen) {
            props.onWidgetHover(null);
            isTouchRef.current = false;
        }
    }, [addDropdownOpen, props.onWidgetHover]);

    return (
        <div style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap"
        }}>
            <div ref={addButtonRef} style={{ position: "fixed", transform: "translate(0, 0px)", zIndex: TOOLBAR_Z_INDEX /*one higher than mui popup backdrop*/, width: "100vw", backgroundColor: "transparent", borderBottomLeftRadius: "9px", borderBottomRightRadius: "9px", display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div className="nav-left" style={{ display: "flex" }}>
                    {
                        settings?.isPeaceModeEnabled ? null :
                            <>
                                <Tooltip title="Toys" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                                    <Button className="top-nav-button" type="submit" variant="contained"
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
                                            closeAllDropdowns();
                                            isClosingRef.current = false;
                                            setAddDropdownOpen(true);
                                        }}
                                        onMouseEnter={() => {
                                            if (anyDropdownOpen && !addDropdownOpen) {
                                                closeAllDropdowns();
                                                setAddDropdownOpen(true);
                                            }
                                        }}
                                    >
                                        <AddBoxIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Color" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                                    <Button className="top-nav-button" type="submit" variant="contained"
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
                                            closeAllDropdowns();
                                            setColorDropdownOpen(true);
                                        }}
                                        onMouseEnter={() => {
                                            if (anyDropdownOpen && !colorDropdownOpen) {
                                                closeAllDropdowns();
                                                setColorDropdownOpen(true);
                                            }
                                        }}
                                    >
                                        <ColorLensIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Sound" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                                    <Button className="top-nav-button" type="submit" variant="contained"
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
                                            closeAllDropdowns();
                                            setSettingsDropdownOpen(true);
                                        }}
                                        onMouseEnter={() => {
                                            if (anyDropdownOpen && !settingsDropdownOpen) {
                                                closeAllDropdowns();
                                                setSettingsDropdownOpen(true);
                                            }
                                        }}
                                    >
                                        <HeadphonesIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" style={{ height: '100%' }} />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="MIDI" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                                    <Button className="top-nav-button" type="submit" variant="contained"
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
                                            closeAllDropdowns();
                                            setMidiSettingsDropdownOpen(true);
                                        }}
                                        onMouseEnter={() => {
                                            if (anyDropdownOpen && !midiSettingsDropdownOpen) {
                                                closeAllDropdowns();
                                                setMidiSettingsDropdownOpen(true);
                                            }
                                        }}
                                    >
                                        <PianoIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Quick Swap" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                                    <Button className="top-nav-button" type="submit" variant="contained"
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
                                            closeAllDropdowns();
                                            setNoteBankDropdownOpen(true);
                                        }}
                                        onMouseEnter={() => {
                                            if (anyDropdownOpen && !noteBankDropdownOpen) {
                                                closeAllDropdowns();
                                                setNoteBankDropdownOpen(true);
                                            }
                                        }}
                                    >
                                        <CharIcon charDisplay={`${noteBank.get.activeIndex}`} />
                                    </Button>
                                </Tooltip>
                                <Tooltip title="Other Bits" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                                    <Button className="top-nav-button" type="submit" variant="contained"
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
                                            closeAllDropdowns();
                                            setOtherDropdownOpen(true);
                                        }}
                                        onMouseEnter={() => {
                                            if (anyDropdownOpen && !otherDropdownOpen) {
                                                closeAllDropdowns();
                                                setOtherDropdownOpen(true);
                                            }
                                        }}
                                    >
                                        <WidgetsIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </Button>
                                </Tooltip>
                            </>
                    }
                </div>
                <div className='nav-middle menu-section' style={{ display: "flex", height: "auto" }}>
                    {
                        settings?.isPeaceModeEnabled ? null :
                            <ShapeNavigationTool width={SHAPE_NAV_WIDTH} subdivisionCount={12} />
                    }
                </div>
                <div className='nav-right menu-section' style={{ display: "flex", height: "auto" }}>
                    {
                        settings?.isPeaceModeEnabled ? null :
                            <Tooltip title="Love" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                                <Button className="top-nav-button" type="submit" variant="contained"
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
                    <Tooltip title="Peace" slotProps={{ popper: { modifiers: [{ name: 'offset', options: { offset: [0, -10] } }] } }}>
                        <Button className="top-nav-button" type="submit" variant="contained"
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
            <div className='menu-section' style={{ width: 320, maxWidth: '100%', zIndex: 1, display: 'flex', height: 'auto' }}>
                <Popover
                    open={addDropdownOpen}
                    onClose={() => { setAddDropdownOpen(false); props.onWidgetHover(null); }}
                    anchorEl={addButtonRef.current}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: -10,
                    }}
                    style={{ transform: "translate(-15px, 0px)" }}
                    role={"menu"}
                    slotProps={{ paper: { sx: { minWidth: 315, maxHeight: 'calc(100vh - 50px)', overflowY: 'auto', borderRadius: 2 } } }}
                >
                    <ClickAwayListener onClickAway={() => { setAddDropdownOpen(false); props.onWidgetHover(null); }}>
                        <MenuList sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}
                            onTouchStart={() => { isTouchRef.current = true; }}
                        >
                            <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold", textAlign: "center" }} onMouseEnter={() => onItemHover(null)}>Spawn Toys</DialogTitle>
                            <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                <MenuItem onClick={() => setInstrumentsOpen(open => !open)} onMouseEnter={() => onItemHover(null)}>
                                    <ListItemIcon>
                                        {instrumentsOpen ? <ExpandLess sx={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <ExpandMore sx={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText>Instruments</ListItemText>
                                </MenuItem>
                                <Collapse in={instrumentsOpen} timeout="auto" unmountOnExit>
                                    <MenuList disablePadding>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Piano)} onMouseEnter={() => onItemHover({ type: WidgetType.Piano })}>
                                            <ListItemIcon>
                                                <MusicNoteIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Piano</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Guitar, WidgetConfig_String_Guitar)} onMouseEnter={() => onItemHover({ type: WidgetType.Guitar, config: WidgetConfig_String_Guitar })}>
                                            <ListItemIcon>
                                                <MusicNoteIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Guitar</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Guitar, WidgetConfig_String_Harpejji)} onMouseEnter={() => onItemHover({ type: WidgetType.Guitar, config: WidgetConfig_String_Harpejji })}>
                                            <ListItemIcon>
                                                <MusicNoteIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Harpejji</ListItemText>
                                        </MenuItem>
                                    </MenuList>
                                </Collapse>
                            </Box>
                            <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                <MenuItem onClick={() => setAbstractOpen(open => !open)} onMouseEnter={() => onItemHover(null)}>
                                    <ListItemIcon>
                                        {abstractOpen ? <ExpandLess sx={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <ExpandMore sx={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText>Geometry</ListItemText>
                                </MenuItem>
                                <Collapse in={abstractOpen} timeout="auto" unmountOnExit>
                                    <MenuList disablePadding>
                                        <Typography variant="caption" sx={{ color: colorPalette.UI_Primary, fontFamily: 'monospace', fontWeight: 'bold', px: 1, opacity: 0.6, display: 'block', textAlign: 'center' }}>
                                            2D
                                        </Typography>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Tonnetz)} onMouseEnter={() => onItemHover({ type: WidgetType.Tonnetz })}>
                                            <ListItemIcon>
                                                <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Tonnetz Diagram</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Wheel, WidgetConfig_Wheel_Fifths)} onMouseEnter={() => onItemHover({ type: WidgetType.Wheel, config: WidgetConfig_Wheel_Fifths })}>
                                            <ListItemIcon>
                                                <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Circle of Fifths</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Wheel, WidgetConfig_Wheel_Semitones)} onMouseEnter={() => onItemHover({ type: WidgetType.Wheel, config: WidgetConfig_Wheel_Semitones })}>
                                            <ListItemIcon>
                                                <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Circle of Semitones</ListItemText>
                                        </MenuItem>

                                        <Typography variant="caption" sx={{ color: colorPalette.UI_Primary, fontFamily: 'monospace', fontWeight: 'bold', px: 1, opacity: 0.6, display: 'block', textAlign: 'center' }}>
                                            3D
                                        </Typography>
                                        {/* <MenuItem sx={{}} disabled={true} onClick={() => addNewWidget(WidgetType.Wheel)}>
                                            <ListItemIcon>
                                                <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Spiral of Fifths</ListItemText>
                                        </MenuItem> */}
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Spiral)} onMouseEnter={() => onItemHover({ type: WidgetType.Spiral })}>
                                            <ListItemIcon>
                                                <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Coil of Semitones</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Icosahedron)} onMouseEnter={() => onItemHover({ type: WidgetType.Icosahedron })}>
                                            <ListItemIcon>
                                                <ConstructionIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Icosahedron of Semitones</ListItemText>
                                        </MenuItem>
                                    </MenuList>
                                </Collapse>
                            </Box>
                            <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                <MenuItem onClick={() => setToolsOpen(open => !open)} onMouseEnter={() => onItemHover(null)}>
                                    <ListItemIcon>
                                        {toolsOpen ? <ExpandLess sx={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <ExpandMore sx={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText>Tools</ListItemText>
                                </MenuItem>
                                <Collapse in={toolsOpen} timeout="auto" unmountOnExit>
                                    <MenuList disablePadding>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Oscilloscope)} onMouseEnter={() => onItemHover({ type: WidgetType.Oscilloscope })}>
                                            <ListItemIcon>
                                                <TimelineIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Oscilloscope</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.FrequencyVis)} onMouseEnter={() => onItemHover({ type: WidgetType.FrequencyVis })}>
                                            <ListItemIcon>
                                                <TimelineIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Frequency Visualizer</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.DiatonicExplorer)} onMouseEnter={() => onItemHover({ type: WidgetType.DiatonicExplorer })}>
                                            <ListItemIcon>
                                                <SquareFootIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Diatonic Chord Explorer</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.MicPitch)} onMouseEnter={() => onItemHover({ type: WidgetType.MicPitch })}>
                                            <ListItemIcon>
                                                <MicIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Tuner</ListItemText>
                                        </MenuItem>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.Analyzer)} onMouseEnter={() => onItemHover({ type: WidgetType.Analyzer })}>
                                            <ListItemIcon>
                                                <SquareFootIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Chord Identifier</ListItemText>
                                        </MenuItem>
                                    </MenuList>
                                </Collapse>
                            </Box>
                            <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                <MenuItem onClick={() => setExercisesOpen(open => !open)} onMouseEnter={() => onItemHover(null)}>
                                    <ListItemIcon>
                                        {exercisesOpen ? <ExpandLess sx={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <ExpandMore sx={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText>Exercises</ListItemText>
                                </MenuItem>
                                <Collapse in={exercisesOpen} timeout="auto" unmountOnExit>
                                    <MenuList disablePadding>
                                        <MenuItem sx={{}} onClick={() => addNewWidget(WidgetType.PlayShapeGame)} onMouseEnter={() => onItemHover({ type: WidgetType.PlayShapeGame })}>
                                            <ListItemIcon>
                                                <VideogameAssetIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText sx={{ color: colorPalette.UI_Primary }}>Chord Game</ListItemText>
                                        </MenuItem>
                                    </MenuList>
                                </Collapse>
                            </Box>
                        </MenuList>
                    </ClickAwayListener>
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
                    <Paper sx={{ borderRadius: 2 }}>
                        <ClickAwayListener onClickAway={() => setAddDropdownOpen(false)}>
                            <MenuList sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                                <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold", textAlign: "center" }}>Audio Settings</DialogTitle>
                                <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                    <MenuItem onClick={() => settings?.setIsMuted(muted => !muted)}>
                                        <ListItemIcon>
                                            {settings?.isMuted ? <VolumeOffIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <VolumeUpIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                        </ListItemIcon>
                                        <ListItemText>In-browser Synth</ListItemText>
                                        <Switch checked={!settings?.isMuted} onChange={e => settings?.setIsMuted(!e.target.checked)}></Switch>
                                    </MenuItem>
                                    {!settings?.isMuted && (
                                        <>
                                            <MenuItem>
                                                <ListItemIcon>
                                                    <VolumeUpIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                                </ListItemIcon>
                                                <VolumeSlider />
                                            </MenuItem>
                                            <MenuItem>
                                                <ListItemIcon>
                                                    <CampaignIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                                </ListItemIcon>
                                                <ListItemText>Synth voice</ListItemText>
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
                                        </>
                                    )}
                                </Box>
                                <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                    <MenuItem onClick={() => settings?.setIsPercussionMuted(muted => !muted)}>
                                        <ListItemIcon>
                                            {settings?.isPercussionMuted ? <VolumeOffIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <VolumeUpIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                        </ListItemIcon>
                                        <ListItemText>In-browser Percussion</ListItemText>
                                        <Switch checked={!settings?.isPercussionMuted} onChange={e => settings?.setIsPercussionMuted(!e.target.checked)}></Switch>
                                    </MenuItem>
                                    {!settings?.isPercussionMuted && (
                                        <MenuItem>
                                            <ListItemIcon>
                                                <VolumeUpIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <Slider
                                                size="small"
                                                value={settings?.percussionVolume ?? 100}
                                                onChange={(e, v) => settings?.setPercussionVolume(v as number)}
                                                defaultValue={100}
                                                aria-label="Percussion Volume"
                                                valueLabelDisplay="auto"
                                            />
                                        </MenuItem>
                                    )}
                                </Box>
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
                        <Paper sx={{ borderRadius: 2 }}>
                            <ClickAwayListener onClickAway={() => setMidiSettingsDropdownOpen(false)}>
                                <MenuList sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                                    <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                        <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold", textAlign: "center" }}>MIDI File</DialogTitle>
                                        <MidiFileParser key={"midifileparser"} closeContainer={() => setMidiSettingsDropdownOpen(false)} />
                                        <MidiTransport />
                                        <MenuItem onClick={() => settings?.setIsDiscoMode(d => !d)}>
                                            <ListItemIcon>
                                                <ColorLensIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                            </ListItemIcon>
                                            <ListItemText>
                                                Disco Mode
                                                <Typography sx={{
                                                    color: colorPalette.UI_Primary,
                                                    fontFamily: 'monospace',
                                                    fontSize: 11,
                                                    opacity: 0.8,
                                                }}>
                                                    WARNING: Flashing Lights
                                                </Typography>
                                            </ListItemText>
                                            <Switch checked={settings?.isDiscoMode ?? false} onChange={e => settings?.setIsDiscoMode(e.target.checked)} />
                                        </MenuItem>
                                    </Box>
                                    <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                        <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold", textAlign: "center" }}>MIDI Devices</DialogTitle>
                                        <MenuItem onClick={() => { }}>
                                            <MIDIConnectionManager key={"midiconnectionmanager"} />
                                        </MenuItem>
                                    </Box>
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
                    <Paper sx={{ borderRadius: 2 }}>
                        <ClickAwayListener onClickAway={() => setNoteBankDropdownOpen(false)}>
                            <MenuList sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                                <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                    <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold", textAlign: "center" }}>Shapes Bound to Number Keys</DialogTitle>
                                    {noteBankElems}
                                </Box>
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Popover>
                <Popover
                    open={colorDropdownOpen}
                    onClose={() => setColorDropdownOpen(false)}
                    anchorEl={addButtonRef.current}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: -10,
                    }}
                    style={{ transform: "translate(-15px, 0px)" }}
                    role={"menu"}
                    disablePortal
                    slotProps={{ paper: { sx: { minWidth: 280, maxHeight: 'calc(100vh - 50px)', overflowY: 'auto', borderRadius: 2 } } }}
                >
                    <ClickAwayListener onClickAway={() => setColorDropdownOpen(false)}>
                        <MenuList sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                            <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold", textAlign: "center" }}>Theme</DialogTitle>
                                <MenuItem onClick={() => { changeTheme?.(Theme_Classic); setColorDropdownOpen(false); (window as any).gtag?.('event', 'change_theme', { theme: 'Classic' }); }}>
                                    <ListItemIcon>
                                        <ColorLensIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: colorPalette.UI_Primary }}>Classic</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => { changeTheme?.(Theme_WhiteOnBlack); setColorDropdownOpen(false); (window as any).gtag?.('event', 'change_theme', { theme: 'White on Black' }); }}>
                                    <ListItemIcon>
                                        <ColorLensIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: colorPalette.UI_Primary }}>White on Black</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => { changeTheme?.(Theme_BlackOnWhite); setColorDropdownOpen(false); (window as any).gtag?.('event', 'change_theme', { theme: 'Black on White' }); }}>
                                    <ListItemIcon>
                                        <ColorLensIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: colorPalette.UI_Primary }}>Black on White</ListItemText>
                                </MenuItem>
                                <MenuItem onClick={() => {
                                    (window as any).gtag?.('event', 'change_theme', { theme: 'Random' });
                                    changeTheme?.(prev => {
                                        const Widget_Primary = changeLightness(getRandomColor(), 1.25);
                                        const Main_Background = changeLightness(getRandomColor(), 0.75);
                                        const Widget_MutedPrimary = blendColors([Widget_Primary, Widget_Primary, Widget_Primary, Main_Background, Main_Background])!;
                                        return {
                                            ...prev,
                                            Main_Background,
                                            UI_Background: getRandomColorWithAlpha(),
                                            UI_Primary: getRandomColor(),
                                            UI_Accent: getRandomColor(),
                                            Widget_Primary,
                                            Widget_MutedPrimary,
                                            Note_Home: getRandomColor(),
                                        }
                                    });
                                    setColorDropdownOpen(false);
                                }}>
                                    <ListItemIcon>
                                        <ColorLensIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText sx={{ color: colorPalette.UI_Primary }}>I'm feelin lucky</ListItemText>
                                </MenuItem>
                            </Box>
                            <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                <MenuItem onClick={() => setCustomizeOpen(open => !open)}>
                                    <ListItemIcon>
                                        {customizeOpen ? <ExpandLess sx={{ color: colorPalette.UI_Primary }} fontSize="small" /> : <ExpandMore sx={{ color: colorPalette.UI_Primary }} fontSize="small" />}
                                    </ListItemIcon>
                                    <ListItemText>Customize</ListItemText>
                                </MenuItem>
                                <Collapse in={customizeOpen} timeout="auto" unmountOnExit>
                                    <Box sx={{ px: 1, pb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {colorGroups.map(group => (
                                            <Box key={group.label}>
                                                <Typography variant="caption" sx={{ color: colorPalette.UI_Primary, fontFamily: 'monospace', fontWeight: 'bold', px: 1, opacity: 0.6, display: 'block', textAlign: 'center' }}>
                                                    {group.label}
                                                </Typography>
                                                {group.fields.map(field => (
                                                    <Box key={field.key} sx={{ display: 'flex', alignItems: 'center', px: 1, py: 0.25, gap: 1.5 }}>
                                                        <input
                                                            type="color"
                                                            value={hexColors[field.key]}
                                                            onChange={e => handleColorChange(field.key, e.target.value)}
                                                            style={{
                                                                width: 28,
                                                                height: 22,
                                                                border: 'none',
                                                                padding: 0,
                                                                cursor: 'pointer',
                                                                backgroundColor: 'transparent',
                                                                borderRadius: 4,
                                                            }}
                                                        />
                                                        <Typography sx={{ color: colorPalette.UI_Primary, fontFamily: 'monospace' }}>
                                                            {field.label}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        ))}
                                    </Box>
                                </Collapse>
                            </Box>
                        </MenuList>
                    </ClickAwayListener>
                </Popover>
                <Popover
                    open={otherDropdownOpen}
                    onClose={() => setOtherDropdownOpen(false)}
                    anchorEl={addButtonRef.current}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: -10,
                    }}
                    style={{ transform: "translate(-15px, 0px)" }}
                    role={"menu"}
                    disablePortal
                >
                    <Paper sx={{ borderRadius: 2 }}>
                        <MenuList sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
                            <Box sx={{ borderRadius: 1, backgroundColor: colorPalette.UI_Background_Alternate, textAlign: "left" }}>
                                <DialogTitle fontSize="large" sx={{ fontFamily: "monospace", fontWeight: "bold", textAlign: "center" }}>Other Settings</DialogTitle>
                                <MenuItem>
                                    <ListItemText> Note Display </ListItemText>
                                    <Select
                                        sx={{ fontFamily: "monospace", marginLeft: "16px" }}
                                        id="menu-dropdown"
                                        value={settings?.noteDisplayMode}
                                        onChange={e => { settings?.setNoteDisplayMode(e.target.value as NoteDisplayMode) }}
                                    >
                                        <MenuItem value={NoteDisplayMode.NoteNames}>Note Names</MenuItem>
                                        <MenuItem value={NoteDisplayMode.Intervals}>Intervals</MenuItem>
                                    </Select>
                                </MenuItem>
                            </Box>
                            <Box sx={{ textAlign: "center", opacity: 0.5, fontFamily: "monospace", fontSize: "0.45em", py: 0.25 }}>
                                app version {process.env.REACT_APP_VERSION}
                            </Box>
                        </MenuList>
                    </Paper>
                </Popover>
            </div>
        </div >
    );
}

export default ToolBar;