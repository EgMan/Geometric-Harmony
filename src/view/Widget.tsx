import React from "react";
import { Circle, Group, Rect, Text } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { createTheme } from "@mui/material";
import { green, purple } from "@mui/material/colors";
import { Vector2d } from "konva/lib/types";
import MiniButton from "./MiniButton";

export type WidgetComponentProps = {
    fromWidget: {
        isOverlayVisible: boolean;
        setIsOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
        position: Vector2d;
        containerPosition: Vector2d;
    }
}

export type WidgetManagerActions = {
    killSelf: () => boolean;
};

type WidgetProps<TElem extends React.ElementType> = {
    of?: TElem;
    actions: WidgetManagerActions;
    children?: React.ReactNode;
    initialPosition: Vector2d;
    contextMenuOffset: Vector2d;
} & Omit<React.ComponentPropsWithoutRef<TElem>, keyof WidgetComponentProps>;

function Widget<TElem extends React.ElementType>({ of, actions, children, initialPosition, contextMenuOffset, ...otherProps }: WidgetProps<TElem>) {
    // const test = <Component {...otherProps}></Component>
    const Component = of || Group;

    const [draggedX, setDraggedX] = React.useState(0);
    const [draggedY, setDraggedY] = React.useState(0);

    const [isMaxamized, setIsMaxamized] = React.useState(true);

    const [isSettingsOverlayVisible, setIsSettingsOverlayVisible] = React.useState(false);

    const mainGroupTransition = useTransition(true, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 750 }
    });

    const [fullContextMenuOpen, setFullContextMenuOpen] = React.useState(false);
    const fullContextMenuProps = useSpring({ opacity: fullContextMenuOpen ? 1 : 0, scaleX: fullContextMenuOpen ? 1 : 0.8, scaleY: fullContextMenuOpen ? 1 : 0.8 });

    const fromWidget = {
        isOverlayVisible: isSettingsOverlayVisible,
        setIsOverlayVisible: setIsSettingsOverlayVisible,
        position: { x: initialPosition.x + draggedX, y: initialPosition.y + draggedY },
        containerPosition: { x: initialPosition.x + draggedX, y: initialPosition.y + draggedY },
    }

    return (
        <Group x={initialPosition?.x ?? 0} y={initialPosition?.y ?? 0}>
            {mainGroupTransition(
                (transitionProps, item, t) =>
                    isMaxamized && (
                        /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                        <animated.Group x={draggedX} y={draggedY} {...transitionProps}>
                            <Component {...otherProps} fromWidget={fromWidget}>{children}</Component>
                        </animated.Group>
                    )
            )}
            <Group draggable x={contextMenuOffset?.x ?? 0} y={contextMenuOffset?.y ?? 0} onDragMove={a => { a.currentTarget.parent?.moveToTop(); setDraggedX(a.currentTarget.x() - (contextMenuOffset?.x ?? 0)); setDraggedY(a.currentTarget.y() - (contextMenuOffset?.y ?? 0)); }} onMouseLeave={() => setFullContextMenuOpen(false)}>
                {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                <animated.Group {...fullContextMenuProps} listening={fullContextMenuOpen}>
                    <Rect cornerRadius={15} fill="rgba(255,255,255,0.1)" width={90} height={60} x={-45} y={-45} />
                    <MiniButton icon={"?"}
                        y={-30}
                        onTouchStart={() => setIsSettingsOverlayVisible(true)}
                        onClick={() => setFullContextMenuOpen(true)}
                        onContextMenu={() => setIsSettingsOverlayVisible(true)}
                        disabled={true}
                    />
                    {/* <MiniButton icon={"⨯"} */}
                    <MiniButton icon={"⤫"}
                        y={-30}
                        x={30}
                        onTouchStart={() => actions.killSelf()}
                        onClick={() => actions.killSelf()}
                        onContextMenu={() => setIsSettingsOverlayVisible(true)}
                    />
                    <MiniButton icon={"﹣"}
                        x={30}
                        onTouchStart={() => setIsMaxamized(false)}
                        onClick={() => { setIsMaxamized(false); setFullContextMenuOpen(false) }}
                        onContextMenu={() => setIsMaxamized(false)}
                    />
                    <MiniButton icon={"⤡"}
                        x={-30}
                        onTouchStart={() => setIsMaxamized(false)}
                        onClick={() => { setIsMaxamized(false); setFullContextMenuOpen(false) }}
                        onContextMenu={() => setIsMaxamized(false)}
                        disabled={true}
                    />
                    <MiniButton icon={"⟳"}
                        x={-30}
                        y={-30}
                        onTouchStart={() => setIsMaxamized(false)}
                        onClick={() => { setIsMaxamized(false); setFullContextMenuOpen(false) }}
                        onContextMenu={() => setIsMaxamized(false)}
                        disabled={true}
                    />
                </animated.Group>
                <MiniButton
                    icon={isMaxamized ? (fullContextMenuOpen ? "⚙" : "…") : "﹣"}
                    iconOffset={(!isMaxamized || fullContextMenuOpen) ? { x: 0, y: 0 } : { x: 0, y: -3 }}
                    onTouchStart={isMaxamized ? (fullContextMenuOpen ? () => setIsSettingsOverlayVisible(true) : () => setFullContextMenuOpen(true)) : () => setIsMaxamized(true)}
                    onClick={isMaxamized ? (fullContextMenuOpen ? () => setIsSettingsOverlayVisible(true) : () => setFullContextMenuOpen(true)) : () => setIsMaxamized(true)}
                    onContextMenu={() => setIsSettingsOverlayVisible(true)}
                />
            </Group>
        </Group>
    )
}

export default Widget;