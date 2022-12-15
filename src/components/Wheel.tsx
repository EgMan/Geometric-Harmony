import { Console } from 'console';
import React from 'react';
import { Circle, Line } from 'react-konva';
import internal from 'stream';
import { InternalSymbolName } from 'typescript';
type Props = {
    x: number
    y: number
    radius: number
    subdivisionCount: number
    isCircleOfFifths: boolean
}

function Wheel(props: Props) {

    const [enabledNotes, setEnabledNotes] = React.useState(new Map<number, boolean>());

    const getNoteLocation = (i: number) => {
        if (props.isCircleOfFifths)
        {
            i = (i * 5) % props.subdivisionCount;
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
            const onClick = () => {
                // toggle enabled state
                const newMap = enabledNotes.set(i, enabledNotes.get(i) !== true)
                setEnabledNotes(new Map(newMap))
            };
            if (enabledNotes.get(i) === true)
            {
                notesArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} fill="white" radius={7} />);
            }
            clickListenersArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} radius={11.3} onClick={onClick} onTap={onClick} />);
            notesHaloArr.push(<Circle x={props.x + noteLoc.x} y={props.y + noteLoc.y} stroke="grey" radius={11.3} />);
        }
        return {
            values: notesArr,
            halos: notesHaloArr,
            clickListeners: clickListenersArr,
        }
    }, [props.subdivisionCount, props.x, props.y, props.radius, enabledNotes, setEnabledNotes]);

    const intervals: JSX.Element[] = React.useMemo(() => {
        const filteredNotes = Array.from(enabledNotes).filter((elem) => {return elem[1] === true}).map(elem => {
            return elem[0];
        });
        var intervalLines = [];
        for (var a = 0; a < filteredNotes.length; a++)
        {
            for (var b = a; b < filteredNotes.length; b++)
            {
                const aLoc = getNoteLocation(filteredNotes[a]);
                const bLoc = getNoteLocation(filteredNotes[b]);
                const dist = getIntervalDistance(filteredNotes[a], filteredNotes[b]);
                const discColor = getIntervalColor(dist);
                const emphasisColor = "rgba(55,55,55,255)";
                intervalLines.push(<Line x={props.x} y={props.y} stroke={discColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
                // intervalLines.push(<Line x={props.x} y={props.y} stroke={emphasisColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
            }
        }
        return intervalLines;
    }, [enabledNotes, props.x, props.y]);

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