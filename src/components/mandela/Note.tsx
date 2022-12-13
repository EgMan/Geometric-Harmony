import { Circle } from 'react-konva';
import internal from 'stream';
type Props = {
    x: number
    y: number
    isEnabled: boolean
    onClick: () => void
}
function Note(props: Props) {
    return (
        <div>
            {props.isEnabled && <Circle x={props.x} y={props.y} fill="white" radius={7} />}
            <Circle x={props.x} y={props.y} stroke="white" radius={11.3} onClick={props.onClick} />
        </div>);
}
export default Note;