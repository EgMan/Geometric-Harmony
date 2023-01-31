import React from "react";
import { Circle, Group, Layer, Stage } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { Html } from "react-konva-utils";

type Props = {
    children?: React.ReactNode
    x: number
    y: number
    contextMenuX: number
    contextMenuY: number
    settingsRows?: JSX.Element[];
}

function Widget(props: Props) {

    const [draggedX, setDraggedX] = React.useState(0);
    const [draggedY, setDraggedY] = React.useState(0);

    const [contextMenuOpen, setContextMenuUpen] = React.useState(false);
    const contextMenuProps = useSpring({ opacity: contextMenuOpen ? 0.75 : 0.25, radius: contextMenuOpen ? 15 : 10 });

    const [isSettingsOverlayVisible, setIsSettingsOverlayVisible] = React.useState(false);

    const mainGroupTransition = useTransition(true, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 750 }
    });




    return (
        <div>
            {isSettingsOverlayVisible &&
                <Html divProps={{ id: "overlay" }}>
                    <Stage width={window.innerWidth} height={window.innerHeight}>
                        <Layer>
                            <Group x={props.x + draggedX} y={props.y + draggedY}>
                                {props.children}
                            </Group>
                        </Layer>
                    </Stage>
                    <div id="click-back-div" onClick={() => setIsSettingsOverlayVisible(false)}>
                        <div id="overlay-content" onClick={(e) => e.stopPropagation()}>
                            <table>
                                {props.settingsRows}
                            </table>
                        </div>
                    </div>
                </Html>
            }

            <Group x={props.x} y={props.y}>
                {mainGroupTransition(
                    (transitionProps, item, t) =>
                        /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                        <animated.Group x={draggedX} y={draggedY} {...transitionProps}>
                            {props.children}
                        </animated.Group>
                )}
                <Group draggable x={props.contextMenuX} y={props.contextMenuY} onDragMove={a => { setDraggedX(a.currentTarget.x() - props.contextMenuX); setDraggedY(a.currentTarget.y() - props.contextMenuY); }}>
                    {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                    <animated.Circle radius={15} {...contextMenuProps} fill={"black"}></animated.Circle>
                    <Circle radius={15} opacity={0} onMouseEnter={() => setContextMenuUpen(true)} onMouseLeave={() => setContextMenuUpen(false)} onClick={() => setIsSettingsOverlayVisible(true)} onContextMenu={(e) => { setIsSettingsOverlayVisible(true); e.currentTarget.preventDefault() }}></Circle>
                </Group>
            </Group>
        </div>
    )
}

export default Widget;