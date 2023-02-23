import React from 'react';
import { Circle, Group, Line, Text } from 'react-konva';
import Widget from './Widget';
import { MenuItem, Select, Switch } from '@mui/material';
import { KonvaEventObject } from 'konva/lib/Node';
import { useGetActiveNotesInCommonWithModulation, useModulateActiveNotes } from './HarmonicModulation';
import { getIntervalColor, getIntervalDistance, getNoteName } from './Utils';
import { NoteSet, useGetCombinedModdedEmphasis, useNoteSet, useUpdateNoteSet } from './NoteProvider';
type Props = {
    x: number
    y: number
    radius: number
    subdivisionCount: number
    isCircleOfFifths: boolean
}

function Wheel(props: Props) {
    const activeNotes = useNoteSet()(NoteSet.Active);

    const emphasizedNotes = useGetCombinedModdedEmphasis()();;
    const updateNotes = useUpdateNoteSet();
    const getNotesInCommon = useGetActiveNotesInCommonWithModulation();

    const modulateActiveNotes = useModulateActiveNotes();

    const [highlightedNotes, setHighlightedNotes] = React.useState(new Set<number>());

    // Settings Storage

    const [displayInterval, setDisplayIntervals] = React.useState([true, true, true, true, true, true]);
    const setDisplayInterval = (index: number, value: boolean) => {
        const newDisplayInterval = displayInterval.slice();
        newDisplayInterval[index] = value;
        setDisplayIntervals(newDisplayInterval);
    }

    const [isCircleOfFifths, setIsCircleOfFiths] = React.useState(props.isCircleOfFifths);

    const [showNoteNames, setShowNoteNames] = React.useState(true);

    ///////////////////

    const getNoteLocation = React.useCallback((i: number) => {
        if (isCircleOfFifths) {
            i = (i * 7) % props.subdivisionCount;
        }
        const radians = i * 2 * Math.PI / props.subdivisionCount;
        return {
            x: Math.sin(radians) * props.radius,
            y: -Math.cos(radians) * props.radius,
        }
    }, [isCircleOfFifths, props.radius, props.subdivisionCount])

    const settingsMenuItems = [
        (<tr>
            <td>Show Minor Seconds (Major Sevenths)</td>
            <td style={{ color: getIntervalColor(1), textAlign: "center" }}>■</td>
            <td><Switch color={"primary"} checked={displayInterval[0]} onChange={e => setDisplayInterval(0, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Major Seconds (Minor Sevenths)</td>
            <td style={{ color: getIntervalColor(2), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[1]} onChange={e => setDisplayInterval(1, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Minor Thirds (Major Sixths)</td>
            <td style={{ color: getIntervalColor(3), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[2]} onChange={e => setDisplayInterval(2, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Major Thirds (Minor Sixths)</td>
            <td style={{ color: getIntervalColor(4), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[3]} onChange={e => setDisplayInterval(3, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Perfect Fourths (Perfect Fifths)</td>
            <td style={{ color: getIntervalColor(5), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[4]} onChange={e => setDisplayInterval(4, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Tritones</td>
            <td style={{ color: getIntervalColor(6), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[5]} onChange={e => setDisplayInterval(5, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show note names</td>
            <td style={{ textAlign: "center" }}>♯</td>
            <td><Switch checked={showNoteNames} onChange={e => setShowNoteNames(e.target.checked)} /></td>
        </tr>),
        (<tr>
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
            const toggleActive = () => {
                updateNotes(NoteSet.Active, [i], !activeNotes.has(i));
            };
            const emphasize = () => {
                updateNotes(NoteSet.Emphasized, [i], true, true);
            };
            const deemphasize = () => {
                updateNotes(NoteSet.Emphasized, [i], false);
            };
            if (activeNotes.has(i)) {
                notesArr.push(<Circle key={`active${i}`} x={noteLoc.x} y={noteLoc.y} fill="white" radius={10} />);
            }
            if (emphasizedNotes.has(i)) {
                emphasized.push(<Circle key={`emphasize${i}`} x={noteLoc.x} y={noteLoc.y} fill="red" stroke="red" radius={20} />);
            }
            if (highlightedNotes.has(i)) {
                highlighted.push(<Circle key={`highlighted${i}`} x={noteLoc.x} y={noteLoc.y} fill="white" radius={20} />);
            }
            if (showNoteNames) {

                noteNames.push(<Text key={`noteName${i}`} width={40} height={40} x={noteLoc.x - 20} y={noteLoc.y - 20} text={getNoteName(i, activeNotes)} fontSize={14} fontFamily='monospace' fill={activeNotes.has(i) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" />);
            }
            notesHaloArr.push(<Circle key={`halo${i}`} x={noteLoc.x} y={noteLoc.y} stroke="grey" radius={20} />);
            clickListenersArr.push(<Circle key={`clickListen${i}`} draggable x={noteLoc.x} y={noteLoc.y} radius={20} onClick={toggleActive} onTap={toggleActive} onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseOver={emphasize} onMouseOut={deemphasize} onDragMove={onRotateDrag} onDragStart={(e) => onRotateDragStart(e, i)} onDragEnd={onRotateDragEnd} />);
        }
        return {
            values: notesArr,
            halos: notesHaloArr,
            emphasized: emphasized,
            highlighted: highlighted,
            clickListeners: clickListenersArr,
            names: noteNames,
        }
    }, [getNoteLocation, rotatingStartingNote, props.subdivisionCount, isCircleOfFifths, getNotesInCommon, updateNotes, modulateActiveNotes, activeNotes, emphasizedNotes, highlightedNotes, showNoteNames]);

    const intervals = React.useMemo(() => {
        var intervalLines: JSX.Element[] = [];
        var emphasized: JSX.Element[] = [];
        var highlighted: JSX.Element[] = [];

        const activeNoteArr = Array.from(activeNotes);
        for (var a = 0; a < activeNoteArr.length; a++) {
            for (var b = a; b < activeNoteArr.length; b++) {
                const noteA = activeNoteArr[a];
                const noteB = activeNoteArr[b];
                const aLoc = getNoteLocation(noteA);
                const bLoc = getNoteLocation(noteB);
                const dist = getIntervalDistance(noteA, noteB, props.subdivisionCount);
                const discColor = getIntervalColor(dist);
                if (!displayInterval[dist - 1]) {
                    continue;
                }
                const emphasize = () => {
                    updateNotes(NoteSet.Emphasized, [noteA, noteB], true)
                };
                const deemphasize = () => {
                    updateNotes(NoteSet.Emphasized, [noteA, noteB], false);
                };
                const isIntervalEmphasized = emphasizedNotes.has(noteA) && emphasizedNotes.has(noteB);
                if (isIntervalEmphasized) {
                    emphasized.push(<Line stroke={discColor} strokeWidth={3} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
                }
                const isIntervalHighlighted = highlightedNotes.has(noteA) && highlightedNotes.has(noteB);
                if (isIntervalHighlighted) {
                    highlighted.push(<Line stroke={discColor} strokeWidth={5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
                }
                intervalLines.push(<Line stroke={discColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
                intervalLines.push(<Line stroke={'rgba(0,0,0,0)'} strokeWidth={5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseOver={emphasize} onMouseOut={deemphasize} />);
                // intervalLines.push(<Line x={props.x} y={props.y} stroke={emphasisColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
            }
        }
        return {
            line: intervalLines,
            emphasized: emphasized,
            highlighted: highlighted,
        }
    }, [activeNotes, displayInterval, emphasizedNotes, getNoteLocation, highlightedNotes, props.subdivisionCount, updateNotes]);

    const centerpoint = (<Circle radius={1} fill="grey"></Circle>);

    return (
        <Widget x={props.x} y={props.y} contextMenuX={0} contextMenuY={-props.radius - 50} settingsRows={settingsMenuItems}>
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
        </Widget>
    );
}
export default Wheel;