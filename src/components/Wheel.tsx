import React from 'react';
import { Circle, Line } from 'react-konva';
import { useActiveNotes, useSetAreNotesActive, useEmphasizedNotes, useSetAreNotesEmphasized } from './NoteProvider';
import Widget from './Widget';
import { MenuItem, Select, Switch } from '@mui/material';
type Props = {
    x: number
    y: number
    radius: number
    subdivisionCount: number
    isCircleOfFifths: boolean
}

function Wheel(props: Props) {
    const activeNotes = useActiveNotes();
    const setAreNotesActive = useSetAreNotesActive();

    const emphasizedNotes = useEmphasizedNotes();
    const setAreNotesEmphasized = useSetAreNotesEmphasized();

    // Settings Storage

    const [displayInterval, setDisplayIntervals] = React.useState([true, true, true, true, true, true]);
    const setDisplayInterval = (index: number, value: boolean) => {
        const newDisplayInterval = displayInterval.slice();
        newDisplayInterval[index] = value;
        setDisplayIntervals(newDisplayInterval);
    }

    const [isCircleOfFifths, setIsCircleOfFiths] = React.useState(props.isCircleOfFifths);

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



    const getIntervalColor = (distance: number) => {
        switch (distance) {
            case 1:
                return "violet"
            case 2:
                return "rgb(112, 0, 195)"
            case 3:
                return "blue"
            case 4:
                return "green"
            case 5:
                return "orange"
            case 6:
                return "red"
            default:
                return "white"
        }
    }

    const settingsMenuItems = [
        (<tr>
            <td>Adjacent notes are</td>
            <td />
            {/* <td><FormControlLabel control={<Switch checked={isCircleOfFifths} onChange={e => setIsCircleOfFiths(e.target.checked)}/>} label={isCircleOfFifths ? "" : 1} /></td> */}
            <td>  <Select
                id="demo-simple-select"
                value={isCircleOfFifths ? 1 : 0}
                label="Note layout"
                labelId="demo-simple-select-filled-label"
                onChange={e => { setIsCircleOfFiths(e.target.value === 1) }}
            >
                <MenuItem value={1}>Fifths</MenuItem>
                <MenuItem value={0}>Semitones</MenuItem>
            </Select></td>
        </tr>),
        (<tr>
            <td>Display Minor Seconds (Major Sevenths)</td>
            <td style={{ color: getIntervalColor(1) }}>■</td>
            <td><Switch checked={displayInterval[0]} onChange={e => setDisplayInterval(0, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Display Major Seconds (Minor Sevenths)</td>
            <td style={{ color: getIntervalColor(2) }}>■</td>
            <td><Switch checked={displayInterval[1]} onChange={e => setDisplayInterval(1, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Display Minor Thirds (Major Sixths)</td>
            <td style={{ color: getIntervalColor(3) }}>■</td>
            <td><Switch checked={displayInterval[2]} onChange={e => setDisplayInterval(2, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Display Major Thirds (Minor Sixths)</td>
            <td style={{ color: getIntervalColor(4) }}>■</td>
            <td><Switch checked={displayInterval[3]} onChange={e => setDisplayInterval(3, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Display Perfect Fourths (Perfect Fifths)</td>
            <td style={{ color: getIntervalColor(5) }}>■</td>
            <td><Switch checked={displayInterval[4]} onChange={e => setDisplayInterval(4, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Display Tritones</td>
            <td style={{ color: getIntervalColor(6) }}>■</td>
            <td><Switch checked={displayInterval[5]} onChange={e => setDisplayInterval(5, e.target.checked)} /></td>
        </tr>),
    ];

    const notes = React.useMemo(() => {
        let notesArr: JSX.Element[] = [];
        let notesHaloArr: JSX.Element[] = [];
        let clickListenersArr: JSX.Element[] = [];
        for (let i = 0; i < props.subdivisionCount; i++) {
            const noteLoc = getNoteLocation(i);
            const toggleActive = () => {
                setAreNotesActive([i], !activeNotes.has(i));
            };
            const emphasize = () => {
                setAreNotesEmphasized([i], true, true);
            };
            const deemphasize = () => {
                setAreNotesEmphasized([i], false);
            };
            if (activeNotes.has(i)) {
                notesArr.push(<Circle x={noteLoc.x} y={noteLoc.y} fill="white" radius={10} />);
            }
            if (emphasizedNotes.has(i)) {
                notesArr.push(<Circle x={noteLoc.x} y={noteLoc.y} fill="red" stroke="red" radius={20} />);
            }
            notesHaloArr.push(<Circle x={noteLoc.x} y={noteLoc.y} stroke="grey" radius={20} />);
            clickListenersArr.push(<Circle x={noteLoc.x} y={noteLoc.y} radius={20} onClick={toggleActive} onTap={toggleActive} onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseOver={emphasize} onMouseOut={deemphasize} />);
        }
        return {
            values: notesArr,
            halos: notesHaloArr,
            clickListeners: clickListenersArr,
        }
    }, [props.subdivisionCount, activeNotes, emphasizedNotes, getNoteLocation, setAreNotesEmphasized, setAreNotesActive]);

    const intervals: JSX.Element[] = React.useMemo(() => {
        const getIntervalDistance = (loc1: number, loc2: number) => {
            const dist1 = Math.abs(loc1 - loc2);
            // const dist2 = (props.subdivisionCount-loc1 +loc2) % (Math.ceil(props.subdivisionCount/2));
            const dist2 = (props.subdivisionCount - Math.max(loc1, loc2) + Math.min(loc1, loc2));
            return Math.min(dist1, dist2);
        }
        var intervalLines: JSX.Element[] = [];
        const activeNoteArr = Array.from(activeNotes);
        for (var a = 0; a < activeNoteArr.length; a++) {
            for (var b = a; b < activeNoteArr.length; b++) {
                const noteA = activeNoteArr[a];
                const noteB = activeNoteArr[b];
                const aLoc = getNoteLocation(noteA);
                const bLoc = getNoteLocation(noteB);
                const dist = getIntervalDistance(noteA, noteB);
                const discColor = getIntervalColor(dist);
                if (!displayInterval[dist - 1]) {
                    continue;
                }
                const emphasize = () => {
                    setAreNotesEmphasized([noteA, noteB], true)
                };
                const deemphasize = () => {
                    setAreNotesEmphasized([noteA, noteB], false);
                };
                const isIntervalEmphasized = emphasizedNotes.has(noteA) && emphasizedNotes.has(noteB);
                const lineWidth = isIntervalEmphasized ? 3 : 1.5;
                intervalLines.push(<Line stroke={discColor} strokeWidth={lineWidth} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
                intervalLines.push(<Line stroke={'rgba(0,0,0,0)'} strokeWidth={5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseOver={emphasize} onMouseOut={deemphasize} />);
                // intervalLines.push(<Line x={props.x} y={props.y} stroke={emphasisColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
            }
        }
        return intervalLines;
    }, [activeNotes, displayInterval, emphasizedNotes, getNoteLocation, props.subdivisionCount, setAreNotesEmphasized]);

    const centerpoint = (<Circle radius={1} fill="grey"></Circle>);

    return (
        <Widget x={props.x} y={props.y} contextMenuX={0} contextMenuY={-props.radius - 50} settingsRows={settingsMenuItems}>
            {notes.halos}
            {intervals}
            {notes.values}
            {notes.clickListeners}
            {centerpoint}
        </Widget>
    );
}
export default Wheel;