import React from "react";
import { Circle, Group, Rect } from "react-konva";
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

    const mainGroupTransition = useTransition(isMaxamized, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 750 }
    });

    const [fullContextMenuOpen, setFullContextMenuOpen] = React.useState(false);
    const fullContextMenuProps = useSpring({ opacity: fullContextMenuOpen ? 1 : 0, scaleX: fullContextMenuOpen ? 1 : 0.8, scaleY: fullContextMenuOpen ? 1 : 0.8 });

    const contextMenuRef = React.useRef<Konva.Group>(null);
    const widgetRef = React.useRef<Konva.Group>(null);

    const [mainButtonHover, setMainButtonHover] = React.useState(false);
    const mainButtonProps = useSpring({ opacity: (!isMaxamized && 0.3) || (mainButtonHover && 0.1) || 0, radius: !isMaxamized || mainButtonHover ? 15 : 10, fill: isMaxamized ? "white" : "black" });
    const mainButtonTextProps = useSpring(
        {
            text: isMaxamized ? (fullContextMenuOpen ? "⚙" : "…") : "﹣",
            y: (!isMaxamized && -18) || (fullContextMenuOpen && -19) || -22,
        }
    );

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
            {mainGroupTransition((transitionProps, item) => {
                return (
                    /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                    < animated.Group
                        x={draggedPosition.x - (contextMenuOffset?.x ?? 0)}
                        y={draggedPosition.y - (contextMenuOffset?.y ?? 0)}
                        opacity={transitionProps.opacity}
                    >
                        {item && (
                            <Component {...otherProps} fromWidget={fromWidget}>
                                {children}
                            </Component>
                        )
                        }
                    </animated.Group>
                );
            })}
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
                        iconOffset={{ x: 0, y: 2 }}
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
                <Group>
                    {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                    <animated.Circle {...mainButtonProps} ></animated.Circle>
                    <Circle
                        radius={16}
                        opacity={0}
                        onMouseEnter={() => { setMainButtonHover(true) }}
                        onMouseLeave={() => { setMainButtonHover(false) }}
                        onTouchStart={isMaxamized ? (fullContextMenuOpen ? () => setIsSettingsOverlayVisible(true) : () => setFullContextMenuOpen(true)) : () => actions.setIsMaxamized(true)}
                        onClick={isMaxamized ? (fullContextMenuOpen ? () => setIsSettingsOverlayVisible(true) : () => setFullContextMenuOpen(true)) : () => actions.setIsMaxamized(true)}
                        onContextMenu={(e) => { setIsSettingsOverlayVisible(true); e.currentTarget.preventDefault() }} />
                    <animated.Text
                        {...mainButtonTextProps}
                        bold={true}
                        listening={false}
                        opacity={1}
                        width={40}
                        height={40}
                        // x={-20 + (props.iconOffset?.x ?? 0)}
                        // y={-20 + (props.iconOffset?.y ?? 0)}
                        x={-20}
                        fill={"white"}
                        fontSize={16}
                        fontFamily='monospace'
                        align="center"
                        verticalAlign="middle" />
                </Group>
            </Group>
        </Group >
    )
}

export default Widget;