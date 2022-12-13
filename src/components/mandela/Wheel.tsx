import { Console } from 'console';
import React from 'react';
import { Circle, Line } from 'react-konva';
import internal from 'stream';
import { InternalSymbolName } from 'typescript';
import Note from './Note';
type Props = {
    x: number
    y: number
    radius: number
    subdivisionCount: number
}

function Wheel(props: Props) {

    const [enabledNotes, setEnabledNotes] = React.useState(new Map<number, boolean>());

    const getNoteLocation = (i: number) => {
        const radians = i * 2 * Math.PI / props.subdivisionCount;
        return {
            x: Math.cos(radians) * props.radius,
            y: Math.sin(radians) * props.radius,
        }
    }

    const notes: JSX.Element[] = React.useMemo(() => {
        return [...Array(props.subdivisionCount)].map((_, i) => {
            const noteLoc = getNoteLocation(i);
            // const radians = i * 2 * Math.PI / props.subdivisionCount;
            const onClick = () => {
                // toggle enabled state
                const newMap = enabledNotes.set(i, enabledNotes.get(i) !== true)
                setEnabledNotes(new Map(newMap))
                console.log(intervals);
            };
            return (
                <Note x={props.x + noteLoc.x} y={props.y + noteLoc.y} isEnabled={enabledNotes.get(i) === true} onClick={onClick} />
            )
        })
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
                intervalLines.push(<Line x={props.x} y={props.y} stroke="white" points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]}/>);
            }
        }
        return intervalLines;
    }, [enabledNotes, props.x, props.y]);

    const centerPointRadius = 7;
    const centerpoint = (<Line stroke="white" x={props.x} y={props.y} points={[-centerPointRadius, 0, centerPointRadius, 0, 0, 0, 0, -centerPointRadius, 0, centerPointRadius]}></Line>);

    return (
        <div>
            {notes}
            {intervals}
            {centerpoint}
        </div>
    );
}
export default Wheel;