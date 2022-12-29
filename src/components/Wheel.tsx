import React from 'react';
import { Circle, Line } from 'react-konva';
import { useActiveNotes, useSetAreNotesActive, useEmphasizedNotes, useSetAreNotesEmphasized } from './NoteProvider';
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

    const getNoteLocation = React.useCallback((i: number) => {
        if (props.isCircleOfFifths) {
            i = (i * 7) % props.subdivisionCount;
        }
        const radians = i * 2 * Math.PI / props.subdivisionCount;
        return {
            x: Math.sin(radians) * props.radius,
            y: -Math.cos(radians) * props.radius,
        }
    }, [props.isCircleOfFifths, props.radius, props.subdivisionCount])



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
                notesArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} fill="white" radius={7} />);
            }
            if (emphasizedNotes.has(i)) {
                notesArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} fill="red" stroke="red" radius={11.3} />);
            }
            notesHaloArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} stroke="grey" radius={11.3} />);
            clickListenersArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} radius={11.3} onClick={toggleActive} onTap={toggleActive} onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseEnter={emphasize} onMouseLeave={deemphasize} />);
        }
        return {
            values: notesArr,
            halos: notesHaloArr,
            clickListeners: clickListenersArr,
        }
    }, [props.subdivisionCount, props.x, props.y, activeNotes, emphasizedNotes, getNoteLocation, setAreNotesEmphasized, setAreNotesActive]);

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
                const emphasize = () => {
                    setAreNotesEmphasized([noteA, noteB], true)
                };
                const deemphasize = () => {
                    setAreNotesEmphasized([noteA, noteB], false);
                };
                const isIntervalEmphasized = emphasizedNotes.has(noteA) && emphasizedNotes.has(noteB);
                const lineWidth = isIntervalEmphasized ? 3 : 1.5;
                intervalLines.push(<Line x={props.x} y={props.y} stroke={discColor} strokeWidth={lineWidth} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />);
                intervalLines.push(<Line x={props.x} y={props.y} stroke={'rgba(0,0,0,0)'} strokeWidth={5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseEnter={emphasize} onMouseLeave={deemphasize} />);
                // intervalLines.push(<Line x={props.x} y={props.y} stroke={emphasisColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
            }
        }
        return intervalLines;
    }, [activeNotes, emphasizedNotes, getNoteLocation, props.subdivisionCount, props.x, props.y, setAreNotesEmphasized]);

    const centerpoint = (<Circle x={props.x} y={props.y} radius={1} fill="grey"></Circle>);

    return (
        <div>
            {notes.halos}
            {intervals}
            {notes.values}
            {notes.clickListeners}
            {centerpoint}
        </div>
    );
}
export default Wheel;