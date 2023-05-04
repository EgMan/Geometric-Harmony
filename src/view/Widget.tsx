import React from "react";
import { Group, Rect } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { Vector2d } from "konva/lib/types";
import MiniButton from "./MiniButton";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";

export type WidgetComponentProps = {
    fromWidget: {
        isOverlayVisible: boolean;
        setIsOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
        position: Vector2d;
        positionOffset: Vector2d;
        containerPosition: Vector2d;
    }
}

export type WidgetManagerActions = {
    killSelf: () => boolean;
    setIsMaxamized: (isMaxamized: boolean) => boolean;
};

type WidgetProps<TElem extends React.ElementType> = {
    of?: TElem;
    actions: WidgetManagerActions;
    children?: React.ReactNode;
    initialPosition: Vector2d;
    draggedPosition: Vector2d;
    contextMenuOffset: Vector2d;
    isMaxamized: boolean;
    setDraggedPosition: (val: Vector2d) => void;
    setDragComplete: (val: Vector2d) => void;
} & Omit<React.ComponentPropsWithoutRef<TElem>, keyof WidgetComponentProps>;

function Widget<TElem extends React.ElementType>({ of, actions, children, initialPosition, draggedPosition, contextMenuOffset, isMaxamized, setDraggedPosition, setDragComplete, ...otherProps }: WidgetProps<TElem>) {
    const Component = of || Group;

    const [isSettingsOverlayVisible, setIsSettingsOverlayVisible] = React.useState(false);

    const mainGroupTransition = useTransition(true, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 750 }
    });

    const [fullContextMenuOpen, setFullContextMenuOpen] = React.useState(false);
    const fullContextMenuProps = useSpring({ opacity: fullContextMenuOpen ? 1 : 0, scaleX: fullContextMenuOpen ? 1 : 0.8, scaleY: fullContextMenuOpen ? 1 : 0.8 });

    const contextMenuRef = React.useRef<Konva.Group>(null);
    const widgetRef = React.useRef<Konva.Group>(null);

    const fromWidget = {
        isOverlayVisible: isSettingsOverlayVisible,
        setIsOverlayVisible: setIsSettingsOverlayVisible,
        position: { x: initialPosition.x + draggedPosition.x, y: initialPosition.y + draggedPosition.y },
        containerPosition: { x: - contextMenuOffset.x, y: - contextMenuOffset.y },
    }

    const onDrag = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        setDraggedPosition(event.currentTarget.position());
    }, [setDraggedPosition]);

    const onDragEnd = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        setDragComplete({ x: event.currentTarget.x() + initialPosition.x, y: event.currentTarget.y() + initialPosition.y });
    }, [initialPosition.x, initialPosition.y, setDragComplete]);

    return (
        <Group x={(initialPosition?.x ?? 0)} y={(initialPosition?.y ?? 0)} ref={widgetRef}>
            {mainGroupTransition(
                (transitionProps, item, t) =>
                    isMaxamized && (
                        /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                        <animated.Group x={draggedPosition.x - (contextMenuOffset?.x ?? 0)} y={draggedPosition.y - (contextMenuOffset?.y ?? 0)} {...transitionProps}>
                            <Component {...otherProps} fromWidget={fromWidget}>{children}</Component>
                        </animated.Group>
                    )
            )}
            <Group
                draggable
                // x={contextMenuOffset?.x ?? 0}
                // y={contextMenuOffset?.y ?? 0}
                ref={contextMenuRef}
                onDragMove={onDrag}
                onDragEnd={onDragEnd}
                onMouseLeave={() => setFullContextMenuOpen(false)}>
                {/* <Rect ref={contextMenuRef} cornerRadius={15} fill="black" width={90} height={60} x={-45} y={-45} /> */}
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
                        onTouchStart={() => actions.setIsMaxamized(false)}
                        onClick={() => { actions.setIsMaxamized(false); setFullContextMenuOpen(false) }}
                        onContextMenu={() => actions.setIsMaxamized(false)}
                    />
                    <MiniButton icon={"⤡"}
                        x={-30}
                        onTouchStart={() => actions.setIsMaxamized(false)}
                        onClick={() => { actions.setIsMaxamized(false); setFullContextMenuOpen(false) }}
                        onContextMenu={() => actions.setIsMaxamized(false)}
                        disabled={true}
                    />
                    <MiniButton icon={"⟳"}
                        x={-30}
                        y={-30}
                        onTouchStart={() => actions.setIsMaxamized(false)}
                        onClick={() => { actions.setIsMaxamized(false); setFullContextMenuOpen(false) }}
                        onContextMenu={() => actions.setIsMaxamized(false)}
                        disabled={true}
                    />
                </animated.Group>
                <MiniButton
                    icon={isMaxamized ? (fullContextMenuOpen ? "⚙" : "…") : "﹣"}
                    iconOffset={(!isMaxamized || fullContextMenuOpen) ? { x: 0, y: 0 } : { x: 0, y: -3 }}
                    onTouchStart={isMaxamized ? (fullContextMenuOpen ? () => setIsSettingsOverlayVisible(true) : () => setFullContextMenuOpen(true)) : () => actions.setIsMaxamized(true)}
                    onClick={isMaxamized ? (fullContextMenuOpen ? () => setIsSettingsOverlayVisible(true) : () => setFullContextMenuOpen(true)) : () => actions.setIsMaxamized(true)}
                    onContextMenu={() => setIsSettingsOverlayVisible(true)}
                />
            </Group>
        </Group>
    )
}

export default Widget;