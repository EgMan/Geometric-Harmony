import React from "react";
import { Circle, Group } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva'

type Props = {
    children?: React.ReactNode
    x: number
    y: number
    contextMenuX: number
    contextMenuY: number
}

function Widget(props: Props) {

    const [draggedX, setDraggedX] = React.useState(0);
    const [draggedY, setDraggedY] = React.useState(0);
    const [contextMenuOpen, setContextMenuUpen] = React.useState(false);

    const contextMenuProps = useSpring({ opacity: contextMenuOpen ? 0.75 : 0.25, radius: contextMenuOpen ? 15 : 10 });

    const mainGroupTransition = useTransition(true, {
        from: {opacity: 0},
        enter: {opacity: 1},
        leave: {opacity: 0},
        config: { duration: 750 }
    });

    return (
        <div>
            <Group x={props.x} y={props.y}>
                {mainGroupTransition(
                    (transitionProps, item, t) =>
                        /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                        <animated.Group x={draggedX} y={draggedY} {...transitionProps}>
                            {props.children}
                        </animated.Group>
                )}
                <Group draggable x={props.contextMenuX} y={props.contextMenuY} onDragMove={a => { setDraggedX(a.currentTarget.x() - props.contextMenuX); setDraggedY(a.currentTarget.y() - props.contextMenuY); console.log(a.currentTarget.getAbsolutePosition().x, props.y) }}>
                    {/* <Html divProps={{
                        style: {
                            position: 'absolute'
                        }
                    }}>
                        <button type="button" style={{ backgroundColor: "transparennt" }} onClick={() => alert('Hello world!')}>⚙️</button>
                        <input placeholder="DOM input from Konva nodes" />
                    </Html> */}
                    {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                    <animated.Circle radius={15} {...contextMenuProps} fill={"black"}></animated.Circle>
                    <Circle radius={15} opacity={0} onMouseEnter={() => setContextMenuUpen(true)} onMouseLeave={() => setContextMenuUpen(false)} onClick={() => alert("show menu here")}></Circle>
                </Group>
            </Group>
        </div>
    )
}

export default Widget;