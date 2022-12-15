import { Console } from 'console';
import React from 'react';
import { Circle, Line } from 'react-konva';
import internal from 'stream';
import { InternalSymbolName } from 'typescript';
import { useGetAllActiveNotes, useIsNoteActive, useIsNoteEmphasized, useSetIsNoteActive, useSetIsNoteEmphasized, } from './NoteContext';
type Props = {
    x: number
    y: number
    radius: number
    subdivisionCount: number
    isCircleOfFifths: boolean
}

function Wheel(props: Props) {

    const isNoteActive = useIsNoteActive();
    const setIsNoteActive = useSetIsNoteActive();
    const getAllActiveNotes = useGetAllActiveNotes();
    const isNoteEmphasized = useIsNoteEmphasized();
    const setIsNoteEmphasized = useSetIsNoteEmphasized();

    const getNoteLocation = (i: number) => {
        if (props.isCircleOfFifths)
        {
            i = (i * 7) % props.subdivisionCount;
        }
        const radians = i * 2 * Math.PI / props.subdivisionCount;
        return {
            x: Math.sin(radians) * props.radius,
            y: -Math.cos(radians) * props.radius,
        }
    }

    const getIntervalDistance = (loc1: number, loc2: number) =>
    {
        const dist1 = Math.abs(loc1-loc2);
        // const dist2 = (props.subdivisionCount-loc1 +loc2) % (Math.ceil(props.subdivisionCount/2));
        const dist2 = (props.subdivisionCount-Math.max(loc1, loc2) +Math.min(loc1, loc2));
        return Math.min(dist1, dist2);
    }

    const getIntervalColor = (distance: number) =>
    {
        switch (distance)
        {
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
        let notesArr = [];
        let notesHaloArr = [];
        let clickListenersArr = [];
        for (let i = 0; i < props.subdivisionCount; i++)
        {
            const noteLoc = getNoteLocation(i);
            const toggleActive = () => {
                setIsNoteActive(i, !isNoteActive(i));
            };
            const emphasize = () => {
                setIsNoteEmphasized(i, true, true);
            };
            const deemphasize = () => {
                setIsNoteEmphasized(i, false);
            };
            if (isNoteActive(i))
            {
                notesArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} fill="white" radius={7} />);
            }
            if (isNoteEmphasized(i))
            {
                notesArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} fill="yellow" radius={11.3} />);
            }
            notesHaloArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} stroke="grey" radius={11.3} />);
            clickListenersArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} radius={11.3} onClick={toggleActive} onTap={toggleActive} onMouseEnter={emphasize} onMouseLeave={deemphasize} />);
        }
        return {
            values: notesArr,
            halos: notesHaloArr,
            clickListeners: clickListenersArr,
        }
    }, [props.subdivisionCount, props.x, props.y, props.radius, isNoteActive, setIsNoteActive]);

    const intervals: JSX.Element[] = React.useMemo(() => {
        const activeNotes = getAllActiveNotes();
        var intervalLines = [];
        for (var a = 0; a < activeNotes.length; a++)
        {
            for (var b = a; b < activeNotes.length; b++)
            {
                const noteA = activeNotes[a];
                const noteB = activeNotes[b];
                const aLoc = getNoteLocation(noteA);
                const bLoc = getNoteLocation(noteB);
                const dist = getIntervalDistance(noteA, noteB);
                const discColor = getIntervalColor(dist);
                const emphasisColor = "rgba(55,55,55,255)";
                const emphasize = () => {
                    console.log("emphasize?");
                    setIsNoteEmphasized(noteA, true)
                    setIsNoteEmphasized(noteB, true);
                };
                const deemphasize = () => {
                    console.log("deemphasize");
                    setIsNoteEmphasized(noteA, false);
                    setIsNoteEmphasized(noteB, false);
                };
                intervalLines.push(<Line x={props.x} y={props.y} stroke={discColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
                intervalLines.push(<Line x={props.x} y={props.y} stroke={'rgba(0,0,0,0)'} strokeWidth={5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} onMouseEnter={emphasize} onMouseLeave={deemphasize}/>);
                // intervalLines.push(<Line x={props.x} y={props.y} stroke={emphasisColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
            }
        }
        return intervalLines;
    }, [getAllActiveNotes, props.x, props.y]);

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