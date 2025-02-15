import React from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { Vector2d } from "konva/lib/types";
import MiniButton from "./MiniButton";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { addVectors, setPointer, useShadowVector } from "../utils/Utils";
import { WidgetConfig, WidgetTracker, WidgetTrackerActions } from "./ViewManager";
import { SCROLL_PADDING, getCurrentSpace, useGotoSpaceRateLimited } from "../utils/SpacesUtils";
import { useHTMLOverlay } from "./HTMLOverlayProvider";

export type WidgetComponentProps = {
    fromWidget: {
        isOverlayVisible: boolean;
        setIsOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
        position: Vector2d;
        positionOffset: Vector2d;
        containerPosition: Vector2d;
        widgetConfig: WidgetConfig;
    }
}

export interface WidgetLayout {
    displayName: string;
}


type WidgetProps<TElem extends React.ElementType> = {
    of?: TElem;
    uid: String,
    actions: WidgetTrackerActions;
    tracker: WidgetTracker;
    children?: React.ReactNode;
    initialPosition: Vector2d;
    draggedPosition: Vector2d;
    contextMenuOffset: Vector2d;
    isMaxamized: boolean;
    setDraggedPosition: (val: Vector2d) => void;
    setDragComplete?: (val: Vector2d) => void;
    lockAspectRatio?: boolean | undefined;
    isPeaceModeEnabled: boolean;
    layout: WidgetLayout;
    // width: number,
    // height: number,
    // setWidth: (w: number) => void,
    // trackerActions: WidgetTrackerActions,
} & Omit<React.ComponentPropsWithoutRef<TElem>, keyof WidgetComponentProps>;

function Widget<TElem extends React.ElementType>({ of, actions, uid, tracker, children, initialPosition, draggedPosition, contextMenuOffset, isMaxamized, lockAspectRatio, isPeaceModeEnabled, setDraggedPosition, setDragComplete, layout, ...otherProps }: WidgetProps<TElem>) {
    const Component = of || Group;

    const [isSettingsOverlayVisible, setIsSettingsOverlayVisible] = React.useState(false);

    const overlayProvider = useHTMLOverlay();

    const mainGroupTransition = useTransition(isMaxamized, {
        from: { opacity: 1 },//opacity 1 is just because I disabled this transition for now
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        // config: { duration: 750 }
    });
    const [shadowVect] = useShadowVector(addVectors(initialPosition, draggedPosition), { x: window.innerWidth / 2, y: 0 }, 7);

    const [fullContextMenuOpen, setFullContextMenuOpenRaw] = React.useState(false);
    const setFullContextMenuOpen = React.useCallback((val: boolean) => {
        overlayProvider?.setMouseTooltip("");
        setFullContextMenuOpenRaw(val);
    }, [overlayProvider]);
    const fullContextMenuProps = useSpring({ opacity: fullContextMenuOpen ? 1 : 0, scaleX: fullContextMenuOpen ? 1 : 0.8, scaleY: fullContextMenuOpen ? 1 : 0.8 });

    const [resizeMenuOpen, setResizeMenuOpen] = React.useState(false);
    const resizeMenuProps = useSpring({ opacity: resizeMenuOpen ? 1 : 0 });

    const contextMenuRef = React.useRef<Konva.Group>(null);
    const widgetRef = React.useRef<Konva.Group>(null);

    const gotoSpaceRateLimited = useGotoSpaceRateLimited();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const [initialWidth, initialHeight] = React.useMemo(() => [otherProps.width ?? 1, otherProps.height ?? 1], []);

    const [leftBoundBase, setLeftBoundBase] = React.useState(0);
    const [rightBoundBase, setRightBoundBase] = React.useState(initialWidth);
    const [topBoundBase, setTopBoundBase] = React.useState(0);
    const [bottomBoundBase, setBottomBoundBase] = React.useState(initialHeight);

    const [leftBoundDragged, setLeftBoundDragged] = React.useState(0);
    const [rightBoundDragged, setRightBoundDragged] = React.useState(0);
    const [topBoundDragged, setTopBoundDragged] = React.useState(0);
    const [bottomBoundDragged, setBottomBoundDragged] = React.useState(0);

    const leftBound = leftBoundBase + leftBoundDragged;
    const rightBound = rightBoundBase + rightBoundDragged;
    const topBound = topBoundBase + topBoundDragged;
    const bottomBound = bottomBoundBase + bottomBoundDragged;
    const horrizontalOffsetFromResizing = (leftBound + (rightBound - initialWidth)) / 2;
    const verticalOffsetFromResizing = topBound;

    const resizedWidth = (rightBoundDragged + rightBoundBase) - (leftBoundBase + leftBoundDragged);
    const resizedHeight = (bottomBoundBase + bottomBoundDragged) - (topBoundBase + topBoundDragged);

    const [mainButtonHover, setMainButtonHoverRaw] = React.useState(false);
    const setMainButtonHover = React.useCallback((val: boolean) => {
        if (val) {
            overlayProvider?.setMouseTooltip(layout.displayName);
        } else {
            overlayProvider?.setMouseTooltip("");
        }
        setMainButtonHoverRaw(val);
    }, [layout.displayName, overlayProvider]);

    const mainButtonAttr = React.useMemo(() => {
        if (isMaxamized) {
            return {
                buttonAttr: {
                    radius: mainButtonHover ? 15 : 10,
                    opacity: mainButtonHover ? 0.1 : 0,
                    fill: "white",
                },
                textAttr: {
                    text: (resizeMenuOpen ? "✓" : (fullContextMenuOpen ? "⚙" : "…")),
                    y: (resizeMenuOpen ? -19 : (fullContextMenuOpen ? -19 : -22)),
                    fill: mainButtonHover || fullContextMenuOpen || resizeMenuOpen ? "white" : "rgb(255,255,255,0.25)",
                },
                onSelect: () => {
                    if (fullContextMenuOpen) {
                        setIsSettingsOverlayVisible(true);
                        setFullContextMenuOpen(false)
                    }
                    else if (resizeMenuOpen) {
                        setResizeMenuOpen(false);
                    }
                    else {
                        setFullContextMenuOpen(true);
                    }
                }
            }
        }
        else return {
            buttonAttr: {
                radius: 12,
                opacity: 0.3,
                fill: "black",
            },
            textAttr: {
                text: "•",
                y: -19,
                fill: mainButtonHover ? "white" : "grey",
            },
            onSelect: () => {
                actions.updateWidgetTracker(uid, widget => ({ ...widget, isMaxamized: true }))
            },
        }
    }, [actions, fullContextMenuOpen, isMaxamized, mainButtonHover, resizeMenuOpen, uid]);

    const mainButtonProps = useSpring({
        ...mainButtonAttr.buttonAttr,
    });

    const mainButtonTextProps = useSpring({
        ...mainButtonAttr.textAttr,
    });

    const fromWidget = {
        isOverlayVisible: isSettingsOverlayVisible,
        setIsOverlayVisible: setIsSettingsOverlayVisible,
        position: { x: initialPosition.x + draggedPosition.x, y: initialPosition.y + draggedPosition.y },
        containerPosition: { x: - contextMenuOffset.x, y: - contextMenuOffset.y },
        widgetConfig: tracker.config,
    }

    const CONSTRAIN_DRAG_FROM_TOP = 50;
    const CONSTRAIN_DRAG_FROM_SIDES = 16;
    const CONSTRAIN_DRAG_FROM_BOTTOM = 16;
    const onDrag = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        var stage = event.target.getStage();
        // Constrain widget
        // const a = event.target.absolutePosition();
        // event.target.setAbsolutePosition({ x: a.x, y: Math.max(a.y, CONSTRAIN_DRAG_FROM_TOP) });
        // event.target.y(Math.max(event.target.y(), 50));
        // console.log("ypos", event.target.absolutePosition().y, event.target.y(), event.target.absolutePosition().y - event.target.y())


        // Scroll to adjacent space if dragging near edge
        if (stage !== null) {
            // console.log("stagepos", stage.getAbsolutePosition());
            var pointerPos = stage.getPointerPosition();

            if (pointerPos !== null) {
                // Spaces logic
                const { row, col } = getCurrentSpace();

                const stagePos = stage.getAbsolutePosition();
                const minY = CONSTRAIN_DRAG_FROM_TOP + stagePos.y + (row * window.innerHeight);
                const maxY = window.innerHeight - CONSTRAIN_DRAG_FROM_BOTTOM + stagePos.y + (row * window.innerHeight);
                const minX = CONSTRAIN_DRAG_FROM_SIDES + stagePos.x + (col * window.innerWidth);
                const maxX = window.innerWidth - CONSTRAIN_DRAG_FROM_SIDES + stagePos.x + (col * window.innerWidth);
                event.target.setAbsolutePosition({ x: Math.min(Math.max(pointerPos.x - horrizontalOffsetFromResizing, minX), maxX), y: Math.min(Math.max(pointerPos.y, minY) - verticalOffsetFromResizing, maxY) });

                if (pointerPos.y > maxY) {
                    gotoSpaceRateLimited(row + 1, col);
                }
                if (pointerPos.y < minY) {
                    console.log("gotoSpaceRateLimited", row - 1, col);
                    gotoSpaceRateLimited(row - 1, col);
                }
                if (pointerPos.x > maxX) {
                    gotoSpaceRateLimited(row, col + 1);
                }
                if (pointerPos.x < minX) {
                    gotoSpaceRateLimited(row, col - 1);
                }
            }
        }
        setDraggedPosition(event.currentTarget.position());
    }, [gotoSpaceRateLimited, horrizontalOffsetFromResizing, setDraggedPosition, verticalOffsetFromResizing]);

    const onDragEnd = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        setDragComplete?.({ x: event.currentTarget.x() + initialPosition.x, y: event.currentTarget.y() + initialPosition.y });
    }, [initialPosition.x, initialPosition.y, setDragComplete]);

    const resizeComplete = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        setLeftBoundBase(oldVal => (oldVal + leftBoundDragged));
        setRightBoundBase(oldVal => (oldVal + rightBoundDragged));
        setTopBoundBase(oldVal => (oldVal + topBoundDragged));
        setBottomBoundBase(oldVal => (oldVal + bottomBoundDragged));
        setLeftBoundDragged(0);
        setRightBoundDragged(0);
        setTopBoundDragged(0);
        setBottomBoundDragged(0);
        event.currentTarget.setPosition({ x: 0, y: 0 });
    }, [bottomBoundDragged, leftBoundDragged, rightBoundDragged, topBoundDragged])

    return (
        <Group x={(initialPosition?.x ?? 0)} y={(initialPosition?.y ?? 0)} ref={widgetRef}>
            {mainGroupTransition((transitionProps, item) => {
                return (
                    /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                    < animated.Group
                        x={draggedPosition.x - (contextMenuOffset?.x ?? 0) + leftBound}
                        y={draggedPosition.y - (contextMenuOffset?.y ?? 0) + topBound}
                        opacity={transitionProps.opacity}
                        listening={!resizeMenuOpen}
                    >
                        {item && (
                            <Component {...otherProps} fromWidget={fromWidget} width={resizedWidth} height={resizedHeight}>
                                {children}
                            </Component>
                        )
                        }
                    </animated.Group>
                );
            })}
            {
                isPeaceModeEnabled ? null :
                    <Group
                        draggable
                        x={draggedPosition.x}
                        y={draggedPosition.y}
                        ref={contextMenuRef}
                        onDragMove={onDrag}
                        onDragEnd={onDragEnd}
                        onMouseLeave={() => setFullContextMenuOpen(false)}>
                        <animated.Group {...resizeMenuProps} x={-contextMenuOffset.x} y={-contextMenuOffset.y} listening={resizeMenuOpen}>
                            <Rect stroke={"white"} dash={[2, 2]} fill="rgba(255,255,255,0.1)" x={leftBound} y={topBound} width={resizedWidth} height={resizedHeight}></Rect>
                            <Group key="resize hitbox group"
                                onMouseLeave={evt => setPointer(evt, "default")}
                            >
                                <Group y={topBoundBase}>
                                    <Line draggable key={'l1'}
                                        stroke={"red"}
                                        opacity={0}
                                        strokeWidth={9}
                                        points={[leftBound, 0, leftBound + resizedWidth, 0]}
                                        onDragMove={evt => {
                                            // actions.updateWidgetTracker(uid, widget => ({ ...widget, width: evt.currentTarget.position().x + 100 }));
                                            // actions.setWidgetTracker(uid, { ...tracker, width: evt.currentTarget.position().x });
                                            evt.currentTarget.setPosition({ x: 0, y: evt.currentTarget.position().y })
                                            setTopBoundDragged(evt.currentTarget.position().y);
                                            if (lockAspectRatio) {
                                                setRightBoundDragged(-evt.currentTarget.position().y / 2);
                                                setLeftBoundDragged(evt.currentTarget.position().y / 2);
                                            }
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "n-resize")}
                                    />
                                </Group>
                                <Group y={bottomBoundBase}>
                                    <Line draggable key={'l2'}
                                        stroke={"yellow"}
                                        opacity={0}
                                        strokeWidth={9}
                                        points={[leftBound, 0, leftBound + resizedWidth, 0]}
                                        onDragMove={evt => {
                                            evt.currentTarget.setPosition({ x: 0, y: evt.currentTarget.position().y })
                                            setBottomBoundDragged(evt.currentTarget.position().y);
                                            if (lockAspectRatio) {
                                                setRightBoundDragged(evt.currentTarget.position().y / 2);
                                                setLeftBoundDragged(-evt.currentTarget.position().y / 2);
                                            }
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "s-resize")}
                                    />
                                </Group>
                                <Group x={leftBoundBase}>
                                    <Line draggable key={'l3'}
                                        stroke={"green"}
                                        opacity={0}
                                        strokeWidth={9}
                                        points={[0, topBound, 0, topBound + resizedHeight]}
                                        onDragMove={evt => {
                                            evt.currentTarget.setPosition({ x: evt.currentTarget.position().x, y: 0 })
                                            setLeftBoundDragged(evt.currentTarget.position().x);
                                            if (lockAspectRatio) {
                                                setBottomBoundDragged(-evt.currentTarget.position().x);
                                            }
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "w-resize")}
                                    />
                                </Group>
                                <Group x={rightBoundBase}>
                                    <Line draggable key={'l4'}
                                        stroke={"blue"}
                                        opacity={0}
                                        strokeWidth={9}
                                        points={[0, topBound, 0, topBound + resizedHeight]}

                                        onDragMove={evt => {
                                            evt.currentTarget.setPosition({ x: evt.currentTarget.position().x, y: 0 })
                                            setRightBoundDragged(evt.currentTarget.position().x);
                                            if (lockAspectRatio) {
                                                setBottomBoundDragged(evt.currentTarget.position().x);
                                            }
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "e-resize")}
                                    />
                                </Group>
                                <Group x={leftBoundBase} y={topBoundBase}>
                                    <Circle
                                        draggable
                                        radius={10}
                                        fill="orange"
                                        opacity={0}
                                        onDragMove={evt => {
                                            if (lockAspectRatio) {
                                                const lockToSquarePos = (evt.currentTarget.position().x + evt.currentTarget.position().y) / 2;
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: lockToSquarePos })
                                            }
                                            setLeftBoundDragged(evt.currentTarget.position().x);
                                            setTopBoundDragged(evt.currentTarget.position().y);
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "nw-resize")}
                                    />
                                </Group>
                                <Group x={rightBoundBase} y={topBoundBase}>
                                    <Circle
                                        draggable
                                        radius={10}
                                        fill="lightblue"
                                        opacity={0}
                                        onDragMove={evt => {
                                            if (lockAspectRatio) {
                                                const lockToSquarePos = (evt.currentTarget.position().x - evt.currentTarget.position().y) / 2;
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: -lockToSquarePos })
                                            }
                                            setRightBoundDragged(evt.currentTarget.position().x);
                                            setTopBoundDragged(evt.currentTarget.position().y);
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "ne-resize")}
                                    />
                                </Group>
                                <Group x={leftBoundBase} y={bottomBoundBase}>
                                    <Circle
                                        draggable
                                        radius={10}
                                        fill="lightgreen"
                                        opacity={0}
                                        onDragMove={evt => {
                                            if (lockAspectRatio) {
                                                const lockToSquarePos = (evt.currentTarget.position().x - evt.currentTarget.position().y) / 2;
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: -lockToSquarePos })
                                            }
                                            setLeftBoundDragged(evt.currentTarget.position().x);
                                            setBottomBoundDragged(evt.currentTarget.position().y);
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "sw-resize")}
                                    />
                                </Group>
                                <Group x={rightBoundBase} y={bottomBoundBase}>
                                    <Circle
                                        draggable
                                        radius={10}
                                        fill="pink"
                                        opacity={0}
                                        onDragMove={evt => {
                                            if (lockAspectRatio) {
                                                const lockToSquarePos = (evt.currentTarget.position().x + evt.currentTarget.position().y) / 2;
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: lockToSquarePos })
                                            }
                                            setRightBoundDragged(evt.currentTarget.position().x);
                                            setBottomBoundDragged(evt.currentTarget.position().y);
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "se-resize")}
                                    />
                                </Group>
                            </Group>
                        </animated.Group>
                        {/* <Rect ref={contextMenuRef} cornerRadius={15} fill="black" width={90} height={60} x={-45} y={-45} /> */}
                        {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                        <Group x={horrizontalOffsetFromResizing} y={topBound} >
                            <animated.Group {...fullContextMenuProps} listening={fullContextMenuOpen} >
                                <Rect cornerRadius={15} fill="rgba(255,255,255,0.1)" width={90} height={60} x={-45} y={-45} />
                                <Rect cornerRadius={15} fill="rgba(255,255,255,0)" width={110} height={80} x={-55} y={-55} />
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
                                    onTouchStart={() => actions.killWidget(uid)}
                                    onClick={() => actions.killWidget(uid)}
                                    onContextMenu={() => setIsSettingsOverlayVisible(true)}
                                />
                                <MiniButton icon={"﹣"}
                                    x={30}
                                    iconOffset={{ x: 0, y: 2 }}
                                    onTouchStart={() => { actions.updateWidgetTracker(uid, widget => ({ ...widget, isMaxamized: false })); setFullContextMenuOpen(false) }}
                                    onClick={() => { actions.updateWidgetTracker(uid, widget => ({ ...widget, isMaxamized: false })); setFullContextMenuOpen(false) }}
                                    onContextMenu={() => { actions.updateWidgetTracker(uid, widget => ({ ...widget, isMaxamized: false })); setFullContextMenuOpen(false) }}
                                />
                                <MiniButton icon={"⤡"}
                                    x={-30}
                                    onTouchStart={() => { setResizeMenuOpen(!resizeMenuOpen); setFullContextMenuOpen(false) }}
                                    onClick={() => { setResizeMenuOpen(!resizeMenuOpen); setFullContextMenuOpen(false) }}
                                    onContextMenu={() => { setResizeMenuOpen(!resizeMenuOpen); setFullContextMenuOpen(false) }}
                                />
                                <MiniButton icon={"⟳"}
                                    x={-30}
                                    y={-30}
                                    disabled={true}
                                />
                            </animated.Group>
                            <Group>
                                {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                                <animated.Circle {...mainButtonProps}
                                    shadowBlur={11}
                                    shadowColor={"black"}
                                    shadowOffset={shadowVect}
                                ></animated.Circle>
                                <Circle
                                    radius={16}
                                    opacity={0}
                                    onMouseEnter={() => { setMainButtonHover(true) }}
                                    onMouseLeave={() => { setMainButtonHover(false) }}
                                    onTouchStart={mainButtonAttr.onSelect}
                                    onClick={mainButtonAttr.onSelect}
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
                                    fontSize={16}
                                    fontFamily='monospace'
                                    align="center"
                                    verticalAlign="middle" />
                            </Group>
                        </Group>
                    </Group>
            }
            {/* <Group>
                <Line draggable key={'l1'}
                    stroke={"red"}
                    strokeWidth={5}
                    points={[0, 0, testWidth, 0]}
                />
                <Line draggable key={'l2'}
                    stroke={"red"}
                    strokeWidth={5}
                    points={[0, testHeight, testWidth, testHeight]}
                />
                <Line draggable key={'l3'}
                    stroke={"green"}
                    strokeWidth={5}
                    points={[0, 0, 0, testHeight]}
                    onDragMove={evt => {
                        // actions.updateWidgetTracker(uid, widget => ({ ...widget, width: evt.currentTarget.position().x + 100 }));
                        // actions.setWidgetTracker(uid, { ...tracker, width: evt.currentTarget.position().x });
                        evt.currentTarget.setPosition({ x: evt.currentTarget.position().x, y: 0 })
                        setLeftBound(evt.currentTarget.position().x);
                        console.log(evt.currentTarget.position().x);
                    }}
                />
                <Line draggable key={'l4'}
                    stroke={"blue"}
                    strokeWidth={5}
                    points={[testWidth, 0, testWidth, testHeight]}

                    onDragMove={evt => {
                        // actions.updateWidgetTracker(uid, widget => ({ ...widget, width: evt.currentTarget.position().x + 100 }));
                        // actions.setWidgetTracker(uid, { ...tracker, width: Math.max(0, evt.currentTarget.position().x) });
                        evt.currentTarget.setPosition({ x: evt.currentTarget.position().x, y: 0 })
                        setRightBound(evt.currentTarget.position().x + testWidth);
                        console.log(evt.currentTarget.position().x);
                    }}
                />
            </Group> */}
        </Group >
    )
}

export default Widget;