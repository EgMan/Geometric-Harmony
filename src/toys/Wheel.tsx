import React from 'react';
import { Circle, Group, Line, Text } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { MenuItem, Select, Switch } from '@mui/material';
import { KonvaEventObject } from 'konva/lib/Node';
import { useGetActiveNotesInCommonWithModulation, useModulateActiveNotes } from '../sound/HarmonicModulation';
import { getIntervalColor, getIntervalDistance, getNoteName } from '../utils/Utils';
import { NoteSet, normalizeToSingleOctave, useChannelDisplays, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import useRenderingTrace from '../utils/ProfilingUtils';
type Props = {
    width: number,
    height: number,
    subdivisionCount: number
    isCircleOfFifths: boolean
} & WidgetComponentProps

function Wheel(props: Props) {
    const radius = Math.min(props.width, props.height) / 2;
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const inputNotes = useNoteSet(NoteSet.PlayingInput, true).notes;

    const emphasizedNotes = useGetCombinedModdedEmphasis();
    const updateNotes = useUpdateNoteSet();
    const getNotesInCommon = useGetActiveNotesInCommonWithModulation();
    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();
    const channelDisplays = useChannelDisplays();


    const modulateActiveNotes = useModulateActiveNotes();

    const [highlightedNotes, setHighlightedNotes] = React.useState(new Set<number>());

    useRenderingTrace("Wheel", { activeNotes, inputNotes, emphasizedNotes, highlightedNotes, homeNote, setHomeNote, getNotesInCommon, modulateActiveNotes, updateNotes });

    // Settings Storage

    const [displayInterval, setDisplayIntervals] = React.useState([true, true, true, true, true, true]);
    const setDisplayInterval = (index: number, value: boolean) => {
        const newDisplayInterval = displayInterval.slice();
        newDisplayInterval[index] = value;
        setDisplayIntervals(newDisplayInterval);
    }

    const [isCircleOfFifths, setIsCircleOfFiths] = React.useState(props.isCircleOfFifths);

    const [showNoteNames, setShowNoteNames] = React.useState(true);

    enum IntervalDisplayType {
        Active,
        Playing,
    }
    const [intervalDisplay, setIntervalDisplay] = React.useState(IntervalDisplayType.Active);

    ///////////////////

    const getNoteLocation = React.useCallback((i: number) => {
        if (isCircleOfFifths) {
            i = (i * 7) % props.subdivisionCount;
        }
        const radians = i * 2 * Math.PI / props.subdivisionCount;
        return {
            x: Math.sin(radians) * radius,
            y: -Math.cos(radians) * radius,
        }
    }, [isCircleOfFifths, props.subdivisionCount, radius])

    const settingsMenuItems = [
        (<tr key={'tr0'}>
            <td>Show Minor Seconds (Major Sevenths)</td>
            <td style={{ color: getIntervalColor(1), textAlign: "center" }}>■</td>
            <td><Switch color={"primary"} checked={displayInterval[0]} onChange={e => setDisplayInterval(0, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr1'}>
            <td>Show Major Seconds (Minor Sevenths)</td>
            <td style={{ color: getIntervalColor(2), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[1]} onChange={e => setDisplayInterval(1, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr2'}>
            <td>Show Minor Thirds (Major Sixths)</td>
            <td style={{ color: getIntervalColor(3), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[2]} onChange={e => setDisplayInterval(2, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr3'}>
            <td>Show Major Thirds (Minor Sixths)</td>
            <td style={{ color: getIntervalColor(4), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[3]} onChange={e => setDisplayInterval(3, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr4'}>
            <td>Show Perfect Fourths (Perfect Fifths)</td>
            <td style={{ color: getIntervalColor(5), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[4]} onChange={e => setDisplayInterval(4, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr5'}>
            <td>Show Tritones</td>
            <td style={{ color: getIntervalColor(6), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[5]} onChange={e => setDisplayInterval(5, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr6'}>
            <td>Display Intervals For</td>
            <td colSpan={2}><Select
                id="menu-dropdown"
                value={intervalDisplay}
                label="Interval Display Type"
                labelId="demo-simple-select-filled-label"
                onChange={e => { setIntervalDisplay(e.target.value as number) }}
            >
                <MenuItem value={IntervalDisplayType.Active}>Active Notes</MenuItem>
                <MenuItem value={IntervalDisplayType.Playing}>Playing Notes</MenuItem>
            </Select></td>
        </tr>),
        (<tr key={'tr7'}>
            <td>Show note names</td>
            <td style={{ textAlign: "center" }}>♯</td>
            <td><Switch checked={showNoteNames} onChange={e => setShowNoteNames(e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr8'}>
            <td>Adjacent notes are</td>
            {/* <td><FormControlLabel control={<Switch checked={isCircleOfFifths} onChange={e => setIsCircleOfFiths(e.target.checked)}/>} label={isCircleOfFifths ? "" : 1} /></td> */}
            <td colSpan={2}>  <Select
                id="menu-dropdown"
                value={isCircleOfFifths ? 1 : 0}
                label="Note layout"
                labelId="demo-simple-select-filled-label"
                onChange={e => { setIsCircleOfFiths(e.target.value === 1) }}
            >
                <MenuItem value={1}>Fifths</MenuItem>
                <MenuItem value={0}>Semitones</MenuItem>
            </Select></td>
        </tr>),
    ];

    const [isRotating, setIsRotating] = React.useState(false);
    const [rotatingStartingNote, setRotatingStartingNote] = React.useState(0);
    const [rotation, setRotation] = React.useState(0);

    const notes = React.useMemo(() => {
        let notesArr: JSX.Element[] = [];
        let notesHaloArr: JSX.Element[] = [];
        let clickListenersArr: JSX.Element[] = [];
        let emphasized: JSX.Element[] = [];
        let highlighted: JSX.Element[] = [];
        let noteNames: JSX.Element[] = [];

        const onRotateDrag = (e: KonvaEventObject<DragEvent>) => {
            const startingLoc = getNoteLocation(rotatingStartingNote);
            const startingAngle = Math.atan2(startingLoc.y, startingLoc.x) * 180 / (Math.PI);
            const currentAngle = Math.atan2(e.currentTarget.y(), e.currentTarget.x()) * 180 / (Math.PI);
            const angle = currentAngle - startingAngle;
            let noteDiff = Math.round(angle * props.subdivisionCount / 360);
            if (noteDiff < 0) {
                noteDiff += props.subdivisionCount;
            }
            if (isCircleOfFifths) {
                noteDiff = (noteDiff * 7) % props.subdivisionCount;
            }
            // updateNotes(NoteSet.Emphasized, getNotesInCommon(noteDiff), true, true);
            setHighlightedNotes(new Set(Array.from(getNotesInCommon(noteDiff)).map((note) => (note + props.subdivisionCount - noteDiff) % props.subdivisionCount)));
            setRotation(angle);
        }

        const onRotateDragStart = (e: KonvaEventObject<DragEvent>, idx: number) => {
            setIsRotating(true);
            setRotatingStartingNote(idx);

            updateNotes(NoteSet.Emphasized, [], false, true);
        }

        const onRotateDragEnd = (e: KonvaEventObject<DragEvent>) => {
            const startingLoc = getNoteLocation(rotatingStartingNote);
            const startingAngle = Math.atan2(startingLoc.y, startingLoc.x) * 180 / (Math.PI);
            const currentAngle = Math.atan2(e.currentTarget.y(), e.currentTarget.x()) * 180 / (Math.PI);
            const angle = currentAngle - startingAngle;
            let noteDiff = Math.round(angle * props.subdivisionCount / 360);
            if (isCircleOfFifths) {
                noteDiff *= 7;
            }

            e.currentTarget.x(startingLoc.x);
            e.currentTarget.y(startingLoc.y);

            setIsRotating(false);
            modulateActiveNotes(noteDiff);
        }

        for (let i = 0; i < props.subdivisionCount; i++) {
            const noteLoc = getNoteLocation(i);
            const toggleActive = (evt: KonvaEventObject<MouseEvent>) => {
                if (evt.evt.button === 2) {
                    setHomeNote((i === homeNote) ? null : i);
                }
                else {
                    updateNotes(NoteSet.Active, [i], !activeNotes.has(i));
                }
            };
            const emphasize = () => {
                updateNotes(NoteSet.Emphasized, [i], true, true);
            };
            const unemphasize = () => {
                updateNotes(NoteSet.Emphasized, [i], false);
            };
            if (activeNotes.has(i)) {
                const noteColor = homeNote === i ? "yellow" : "white";
                notesArr.push(<Circle key={`active${i}`} x={noteLoc.x} y={noteLoc.y} fill={noteColor} radius={10} />);
            }
            var hasPushed = false;
            for (const channelDisplay of channelDisplays) {
                if (Array.from(channelDisplay.notes).some((note) => normalizeToSingleOctave(note) === i)) {
                    const opacity = hasPushed ? 0.5 : 1;
                    emphasized.push(<Circle key={`${channelDisplay.name}-${i}`} opacity={opacity} x={noteLoc.x} y={noteLoc.y} fill={channelDisplay.color ?? "white"} radius={20} />);
                    hasPushed = true;
                    // break;
                }
            }
            if (highlightedNotes.has(i)) {
                highlighted.push(<Circle key={`highlighted${i}`} x={noteLoc.x} y={noteLoc.y} fill="white" radius={20} />);
            }
            if (showNoteNames) {
                noteNames.push(<Text key={`noteName${i}`} width={40} height={40} x={noteLoc.x - 20} y={noteLoc.y - 20} text={getNoteName(i, activeNotes)} fontSize={14} fontFamily='monospace' fill={activeNotes.has(i) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" />);
            }
            notesHaloArr.push(<Circle key={`halo${i}`} x={noteLoc.x} y={noteLoc.y} stroke="rgba(255,255,255,0.1)" radius={20} />);
            clickListenersArr.push(<Circle key={`clickListen${i}`} draggable x={noteLoc.x} y={noteLoc.y} radius={20} onClick={toggleActive} onTap={toggleActive} onTouchStart={emphasize} onTouchEnd={unemphasize} onMouseOver={emphasize} onMouseOut={unemphasize} onDragMove={onRotateDrag} onDragStart={(e) => onRotateDragStart(e, i)} onDragEnd={onRotateDragEnd} />);
        }
        return {
            values: notesArr,
            halos: notesHaloArr,
            emphasized: emphasized,
            highlighted: highlighted,
            clickListeners: clickListenersArr,
            names: noteNames,
        }
    }, [getNoteLocation, rotatingStartingNote, props.subdivisionCount, isCircleOfFifths, getNotesInCommon, updateNotes, modulateActiveNotes, activeNotes, highlightedNotes, showNoteNames, setHomeNote, homeNote, channelDisplays]);

    const intervals = React.useMemo(() => {
        var intervalLines: JSX.Element[] = [];
        var emphasized: JSX.Element[] = [];
        var highlighted: JSX.Element[] = [];

        for (let noteA = 0; noteA < 12; noteA++) {
            for (let noteB = noteA; noteB < 12; noteB++) {
                const aLoc = getNoteLocation(noteA);
                const bLoc = getNoteLocation(noteB);
                const dist = getIntervalDistance(noteA, noteB, props.subdivisionCount);
                const discColor = getIntervalColor(dist);
                if (intervalDisplay === IntervalDisplayType.Playing && (!emphasizedNotes.has(noteA) || !emphasizedNotes.has(noteB))) {
                    continue;
                }
                if (!displayInterval[dist - 1]) {
                    continue;
                }
                const emphasize = () => {
                    updateNotes(NoteSet.Emphasized, [noteA, noteB], true)
                };
                const deemphasize = () => {
                    updateNotes(NoteSet.Emphasized, [noteA, noteB], false);
                };
                const isIntervalEmphasized = channelDisplays.some((channelDisplay) => Array.from(channelDisplay.notes).some(note => normalizeToSingleOctave(note) === noteA) && Array.from(channelDisplay.notes).some(note => normalizeToSingleOctave(note) === noteB));
                if (isIntervalEmphasized) {
                    emphasized.push(<Line key={`1-${noteA}-${noteB}`} stroke={discColor} strokeWidth={3} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
                }
                const isIntervalHighlighted = highlightedNotes.has(noteA) && highlightedNotes.has(noteB);
                if (isIntervalHighlighted) {
                    highlighted.push(<Line key={`2-${noteA}-${noteB}`} stroke={discColor} strokeWidth={5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
                }

                const isActiveNoteInterval = activeNotes.has(noteA) && activeNotes.has(noteB);
                if (isActiveNoteInterval) {
                    intervalLines.push(<Line key={`3-${noteA}-${noteB}`} stroke={"grey"} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} opacity={0.25} />);
                    intervalLines.push(<Line key={`4-${noteA}-${noteB}`} stroke={'rgba(0,0,0,0)'} strokeWidth={5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseOver={emphasize} onMouseOut={deemphasize} />);
                }
            }
        }

        inputNotes.forEach((noteA) => {
            inputNotes.forEach((noteB) => {
                const aLoc = getNoteLocation(noteA);
                const bLoc = getNoteLocation(noteB);
                const dist = getIntervalDistance(noteA, noteB, props.subdivisionCount);
                const discColor = getIntervalColor(dist);
                intervalLines.push(<Line key={`5-${noteA}-${noteB}`} stroke={discColor} strokeWidth={3} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
            });
        });

        return {
            line: intervalLines,
            emphasized: emphasized,
            highlighted: highlighted,
        }
    }, [IntervalDisplayType.Playing, activeNotes, channelDisplays, displayInterval, emphasizedNotes, getNoteLocation, highlightedNotes, inputNotes, intervalDisplay, props.subdivisionCount, updateNotes]);

    const fullRender = React.useMemo((
    ) => {
        const centerpoint = (<Circle radius={1} fill="white"></Circle>);
        return (
            <Group x={radius} y={radius}>
                <Group opacity={isRotating ? 0.125 : 1} key={"realGroup"}>
                    {notes.halos}
                    {intervals.emphasized}
                    {intervals.line}
                    {notes.values}
                    {notes.emphasized}
                    {centerpoint}
                </Group>
                {isRotating && <Group rotation={rotation} key={"rotationalGroup"}>
                    {notes.halos}
                    {intervals.line}
                    {intervals.highlighted}
                    {notes.values}
                    {notes.highlighted}
                    {centerpoint}
                </Group>}
                {notes.names}
                {notes.clickListeners}
            </Group>
        );
    }, [intervals.emphasized, intervals.highlighted, intervals.line, isRotating, notes.clickListeners, notes.emphasized, notes.halos, notes.highlighted, notes.names, notes.values, radius, rotation]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={settingsMenuItems} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}
export default Wheel;