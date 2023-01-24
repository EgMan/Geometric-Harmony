import React from "react";
import { Circle, Group } from "react-konva";

type Props = {
    children?: React.ReactNode
    x: number
    y: number
    contextMenuX: number
    contextMenuY: number
}

const hoveredOpacity = 0.75;
const notHoveredOpacity = 0.25;

function Widget(props: Props) {

    const [draggedX, setDraggedX] = React.useState(0);
    const [draggedY, setDraggedY] = React.useState(0);
    const [draggableOpacity, setDraggableOpacity] = React.useState(notHoveredOpacity);

    return (
        <div>
            <Group x={props.x} y={props.y}>
                <Group draggable x={props.contextMenuX} y={props.contextMenuY} onDragMove={a => {setDraggedX(a.currentTarget.x()-props.contextMenuX); setDraggedY(a.currentTarget.y()-props.contextMenuY); console.log(a.currentTarget.getAbsolutePosition().x, props.y)}}>
                    {/* <Html divProps={{
                        style: {
                            position: 'absolute'
                        }
                    }}>
                        <button type="button" style={{ backgroundColor: "transparennt" }} onClick={() => alert('Hello world!')}>⚙️</button>
                        <input placeholder="DOM input from Konva nodes" />
                    </Html> */}
                    <Circle radius={15} opacity={draggableOpacity} fill={"black"} onMouseEnter={() => setDraggableOpacity(hoveredOpacity)}  onMouseLeave={() => setDraggableOpacity(notHoveredOpacity)}></Circle>
                </Group>
                <Group x={draggedX} y={draggedY}>
                    {props.children}
                </Group>
            </Group>
        </div>
    )
}

export default Widget;