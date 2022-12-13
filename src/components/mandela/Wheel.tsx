import { Console } from 'console';
import React from 'react';
import { Circle, Line } from 'react-konva';
import internal from 'stream';
import Note from './Note';
type Props = {
    x: number
    y: number
    radius: number
    subdivisionCount: number
}

function Wheel(props: Props) {

    const [enabledNotes, setEnabledNotes] = React.useState(new Map<number, boolean>());

    const notes = React.useMemo(() => {
        return [...Array(props.subdivisionCount)].map((_, i) => {
            const radians = i * 2 * Math.PI / props.subdivisionCount;
            const onClick = () => {
                // toggle enabled state
                const newMap = enabledNotes.set(i, enabledNotes.get(i) !== true)
                setEnabledNotes(new Map(newMap))
            };
            return (
                <Note x={props.x + Math.cos(radians) * props.radius} y={props.y + Math.sin(radians) * props.radius} isEnabled={enabledNotes.get(i) === true} onClick={onClick} />
            )
        })
    }, [props.subdivisionCount, props.x, props.y, props.radius, enabledNotes, setEnabledNotes]);

    const centerPointRadius = 7;
    const centerpoint = (<Line stroke="white" x={props.x} y={props.y} points={[-centerPointRadius, 0, centerPointRadius, 0, 0, 0, 0, -centerPointRadius, 0, centerPointRadius]}></Line>);

    return (
        <div>
            {notes}
            {centerpoint}
        </div>
    );
}
export default Wheel;