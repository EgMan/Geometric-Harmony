// May god help you if you're looking in here.  
// Turn away now, it's not too late.

import React from "react";
import { Circle, Group, Line, Rect } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { Vector2d } from "konva/lib/types";
import MiniButton from "./MiniButton";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { addVectors, setPointer, useShadowVector } from "../utils/Utils";
import { WidgetConfig, WidgetTracker, WidgetTrackerActions } from "./ViewManager";
import { useHTMLOverlay } from "./HTMLOverlayProvider";

export type WidgetComponentProps = {
    fromWidget: {
        isOverlayVisible: boolean;
        setIsOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
        position: Vector2d;
        positionOffset: Vector2d;
        containerPosition: Vector2d;
        widgetConfig: WidgetConfig;
        widgetSize?: { width: number; height: number };
        isPreview?: boolean;
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

    // Allows context window to close on mobile
    React.useEffect(() => {
        if (!fullContextMenuOpen) return;
        const close = () => setFullContextMenuOpen(false);
        const timer = setTimeout(() => document.addEventListener('touchstart', close), 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener('touchstart', close);
        };
    }, [fullContextMenuOpen, setFullContextMenuOpen]);
    const fullContextMenuProps = useSpring({ opacity: fullContextMenuOpen ? 1 : 0, scaleX: fullContextMenuOpen ? 1 : 0.8, scaleY: fullContextMenuOpen ? 1 : 0.8 });

    const [resizeMenuOpen, setResizeMenuOpen] = React.useState(false);
    const resizeMenuProps = useSpring({ opacity: resizeMenuOpen ? 1 : 0 });

    const contextMenuRef = React.useRef<Konva.Group>(null);
    const widgetRef = React.useRef<Konva.Group>(null);
    const contentRef = React.useRef<Konva.Group>(null);

    const [initialWidth, setInitialWidth] = React.useState(otherProps.width ?? 1);
    const [initialHeight, setInitialHeight] = React.useState(otherProps.height ?? 1);
    const [scaledOffsetY, setScaledOffsetY] = React.useState(contextMenuOffset.y);

    const [leftBoundBase, setLeftBoundBase] = React.useState(0);
    const [rightBoundBase, setRightBoundBase] = React.useState(initialWidth);
    const [topBoundBase, setTopBoundBase] = React.useState(0);
    const [bottomBoundBase, setBottomBoundBase] = React.useState(initialHeight);

    const prevWindowRef = React.useRef({ w: window.innerWidth, h: window.innerHeight });
    const lockAspectRatioRef = React.useRef(lockAspectRatio);
    lockAspectRatioRef.current = lockAspectRatio;
    React.useEffect(() => {
        const handleResize = () => {
            const prev = prevWindowRef.current;
            const w = window.innerWidth;
            const h = window.innerHeight;
            if (prev.w === w && prev.h === h) return;
            let scaleX = w / prev.w;
            let scaleY = h / prev.h;
            prevWindowRef.current = { w, h };
            if (lockAspectRatioRef.current) {
                const uniformScale = Math.min(w, h) / Math.min(prev.w, prev.h);
                scaleX = uniformScale;
                scaleY = uniformScale;
            }
            setInitialWidth(old => old * scaleX);
            setInitialHeight(old => old * scaleY);
            setScaledOffsetY(old => old * scaleY);
            setLeftBoundBase(old => old * scaleX);
            setRightBoundBase(old => old * scaleX);
            setTopBoundBase(old => old * scaleY);
            setBottomBoundBase(old => old * scaleY);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const leftBoundDraggedRef = React.useRef(0);
    const rightBoundDraggedRef = React.useRef(0);
    const topBoundDraggedRef = React.useRef(0);
    const bottomBoundDraggedRef = React.useRef(0);
    const resizeBorderRef = React.useRef<Konva.Rect>(null);
    const resizeButtonGroupRef = React.useRef<Konva.Group>(null);
    const MIN_WIDGET_SIZE = 50;
    const currentBaseWidth = rightBoundBase - leftBoundBase;
    const currentBaseHeight = bottomBoundBase - topBoundBase;

    const horrizontalOffsetFromResizing = (leftBoundBase + (rightBoundBase - initialWidth)) / 2;
    const contentWidth = currentBaseWidth;
    const contentHeight = currentBaseHeight;

    const updateResizeVisuals = React.useCallback(() => {
        const ld = leftBoundDraggedRef.current;
        const rd = rightBoundDraggedRef.current;
        const td = topBoundDraggedRef.current;
        const bd = bottomBoundDraggedRef.current;
        const lb = leftBoundBase + ld;
        const rb = rightBoundBase + rd;
        const tb = topBoundBase + td;
        const w = rb - lb;
        const h = (bottomBoundBase + bd) - (topBoundBase + td);
        if (resizeBorderRef.current) {
            resizeBorderRef.current.setAttrs({ x: lb, y: tb, width: w, height: h });
        }
        if (resizeButtonGroupRef.current) {
            const hOffset = (lb + (rb - initialWidth)) / 2;
            resizeButtonGroupRef.current.setAttrs({ x: hOffset, y: tb });
        }
    }, [leftBoundBase, rightBoundBase, topBoundBase, bottomBoundBase, initialWidth]);

    // Set/update border and button positions imperatively (not via React props)
    // so external re-renders can't overwrite values during active resize
    React.useLayoutEffect(() => {
        updateResizeVisuals();
    }, [updateResizeVisuals]);

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

    const fromWidget = React.useMemo(() => ({
        isOverlayVisible: isSettingsOverlayVisible,
        setIsOverlayVisible: setIsSettingsOverlayVisible,
        position: { x: initialPosition.x + draggedPosition.x, y: initialPosition.y + draggedPosition.y },
        containerPosition: { x: - initialWidth / 2 + leftBoundBase, y: - scaledOffsetY + topBoundBase },
        widgetConfig: tracker.config,
        widgetSize: { width: contentWidth, height: contentHeight },
    }), [isSettingsOverlayVisible, initialPosition.x, initialPosition.y, draggedPosition.x, draggedPosition.y, initialWidth, scaledOffsetY, leftBoundBase, topBoundBase, tracker.config, contentWidth, contentHeight]);

    const CONSTRAIN_DRAG_FROM_TOP = 50;
    const CONSTRAIN_DRAG_FROM_SIDES = 16;
    const CONSTRAIN_DRAG_FROM_BOTTOM = 16;
    const onDrag = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        const stage = event.target.getStage();
        if (stage) {
            const pos = event.target.getAbsolutePosition();
            const stagePos = stage.getAbsolutePosition();
            const minX = CONSTRAIN_DRAG_FROM_SIDES + stagePos.x - horrizontalOffsetFromResizing;
            const maxX = window.innerWidth - CONSTRAIN_DRAG_FROM_SIDES + stagePos.x - horrizontalOffsetFromResizing;
            const minY = CONSTRAIN_DRAG_FROM_TOP + stagePos.y - topBoundBase;
            const maxY = window.innerHeight - CONSTRAIN_DRAG_FROM_BOTTOM + stagePos.y - topBoundBase;
            event.target.setAbsolutePosition({
                x: Math.min(Math.max(pos.x, minX), maxX),
                y: Math.min(Math.max(pos.y, minY), maxY),
            });
        }
        setDraggedPosition(event.currentTarget.position());
    }, [setDraggedPosition, topBoundBase, horrizontalOffsetFromResizing]);

    const onDragEnd = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        setDragComplete?.({ x: event.currentTarget.x() + initialPosition.x, y: event.currentTarget.y() + initialPosition.y });
    }, [initialPosition.x, initialPosition.y, setDragComplete]);

    const exportWidget = React.useCallback(async () => {
        const node = contentRef.current;
        if (!node) return;
        const dataURL = node.toDataURL({ pixelRatio: 3 });

        // Convert data URL to blob for file picker
        const res = await fetch(dataURL);
        const blob = await res.blob();

        let name = `GeometricMusic_${layout.displayName}.png`

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await (window as any).showSaveFilePicker({
                    suggestedName: name,
                    types: [{ description: 'PNG Image', accept: { 'image/png': ['.png'] } }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
                return;
            } catch (e: any) {
                if (e.name === 'AbortError') return; // User cancelled
            }
        }

        // Fallback: auto-download
        const link = document.createElement('a');
        link.download = name;
        link.href = URL.createObjectURL(blob);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }, [layout.displayName]);

    const resizeComplete = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        const ld = leftBoundDraggedRef.current;
        const rd = rightBoundDraggedRef.current;
        const td = topBoundDraggedRef.current;
        const bd = bottomBoundDraggedRef.current;
        leftBoundDraggedRef.current = 0;
        rightBoundDraggedRef.current = 0;
        topBoundDraggedRef.current = 0;
        bottomBoundDraggedRef.current = 0;
        setLeftBoundBase(oldVal => oldVal + ld);
        setRightBoundBase(oldVal => oldVal + rd);
        setTopBoundBase(oldVal => oldVal + td);
        setBottomBoundBase(oldVal => oldVal + bd);
        event.currentTarget.setPosition({ x: 0, y: 0 });
    }, [])

    return (
        <Group x={(initialPosition?.x ?? 0)} y={(initialPosition?.y ?? 0)} ref={widgetRef}>
            {mainGroupTransition((transitionProps, item) => {
                return (
                    /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                    < animated.Group
                        x={draggedPosition.x - initialWidth / 2 + leftBoundBase}
                        y={draggedPosition.y - (scaledOffsetY ?? 0) + topBoundBase}
                        opacity={transitionProps.opacity}
                        listening={!resizeMenuOpen}
                    >
                        {item && (
                            <Group ref={contentRef}>
                                <Component {...otherProps} fromWidget={fromWidget} width={contentWidth} height={contentHeight}>
                                    {children}
                                </Component>
                            </Group>
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
                        <animated.Group {...resizeMenuProps} x={-initialWidth / 2} y={-scaledOffsetY} listening={resizeMenuOpen}>
                            <Rect ref={resizeBorderRef} stroke={"white"} dash={[2, 2]} fill="rgba(255,255,255,0.1)"></Rect>
                            <Group key="resize hitbox group"
                                onMouseLeave={evt => setPointer(evt, "default")}
                            >
                                <Group y={topBoundBase}>
                                    <Line draggable key={'l1'}
                                        stroke={"red"}
                                        opacity={0}
                                        strokeWidth={9}
                                        points={[leftBoundBase, 0, leftBoundBase + contentWidth, 0]}
                                        onDragMove={evt => {
                                            const maxDrag = (lockAspectRatio ? Math.min(currentBaseHeight, currentBaseWidth) : currentBaseHeight) - MIN_WIDGET_SIZE;
                                            const y = Math.min(evt.currentTarget.position().y, maxDrag);
                                            evt.currentTarget.setPosition({ x: 0, y });
                                            topBoundDraggedRef.current = y;
                                            if (lockAspectRatio) {
                                                rightBoundDraggedRef.current = -y / 2;
                                                leftBoundDraggedRef.current = y / 2;
                                            }
                                            updateResizeVisuals();
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
                                        points={[leftBoundBase, 0, leftBoundBase + contentWidth, 0]}
                                        onDragMove={evt => {
                                            const minDrag = -((lockAspectRatio ? Math.min(currentBaseHeight, currentBaseWidth) : currentBaseHeight) - MIN_WIDGET_SIZE);
                                            const y = Math.max(evt.currentTarget.position().y, minDrag);
                                            evt.currentTarget.setPosition({ x: 0, y });
                                            bottomBoundDraggedRef.current = y;
                                            if (lockAspectRatio) {
                                                rightBoundDraggedRef.current = y / 2;
                                                leftBoundDraggedRef.current = -y / 2;
                                            }
                                            updateResizeVisuals();
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
                                        points={[0, topBoundBase, 0, topBoundBase + contentHeight]}
                                        onDragMove={evt => {
                                            const maxDrag = (lockAspectRatio ? Math.min(currentBaseWidth, currentBaseHeight) : currentBaseWidth) - MIN_WIDGET_SIZE;
                                            const x = Math.min(evt.currentTarget.position().x, maxDrag);
                                            evt.currentTarget.setPosition({ x, y: 0 });
                                            leftBoundDraggedRef.current = x;
                                            if (lockAspectRatio) {
                                                bottomBoundDraggedRef.current = -x;
                                            }
                                            updateResizeVisuals();
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
                                        points={[0, topBoundBase, 0, topBoundBase + contentHeight]}

                                        onDragMove={evt => {
                                            const minDrag = -((lockAspectRatio ? Math.min(currentBaseWidth, currentBaseHeight) : currentBaseWidth) - MIN_WIDGET_SIZE);
                                            const x = Math.max(evt.currentTarget.position().x, minDrag);
                                            evt.currentTarget.setPosition({ x, y: 0 });
                                            rightBoundDraggedRef.current = x;
                                            if (lockAspectRatio) {
                                                bottomBoundDraggedRef.current = x;
                                            }
                                            updateResizeVisuals();
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
                                                const maxDrag = Math.min(currentBaseWidth, currentBaseHeight) - MIN_WIDGET_SIZE;
                                                const lockToSquarePos = Math.min((evt.currentTarget.position().x + evt.currentTarget.position().y) / 2, maxDrag);
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: lockToSquarePos });
                                            } else {
                                                evt.currentTarget.setPosition({
                                                    x: Math.min(evt.currentTarget.position().x, currentBaseWidth - MIN_WIDGET_SIZE),
                                                    y: Math.min(evt.currentTarget.position().y, currentBaseHeight - MIN_WIDGET_SIZE),
                                                });
                                            }
                                            leftBoundDraggedRef.current = evt.currentTarget.position().x;
                                            topBoundDraggedRef.current = evt.currentTarget.position().y;
                                            updateResizeVisuals();
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
                                                const minDrag = -(Math.min(currentBaseWidth, currentBaseHeight) - MIN_WIDGET_SIZE);
                                                const lockToSquarePos = Math.max((evt.currentTarget.position().x - evt.currentTarget.position().y) / 2, minDrag);
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: -lockToSquarePos });
                                            } else {
                                                evt.currentTarget.setPosition({
                                                    x: Math.max(evt.currentTarget.position().x, -(currentBaseWidth - MIN_WIDGET_SIZE)),
                                                    y: Math.min(evt.currentTarget.position().y, currentBaseHeight - MIN_WIDGET_SIZE),
                                                });
                                            }
                                            rightBoundDraggedRef.current = evt.currentTarget.position().x;
                                            topBoundDraggedRef.current = evt.currentTarget.position().y;
                                            updateResizeVisuals();
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
                                                const maxDrag = Math.min(currentBaseWidth, currentBaseHeight) - MIN_WIDGET_SIZE;
                                                const lockToSquarePos = Math.min((evt.currentTarget.position().x - evt.currentTarget.position().y) / 2, maxDrag);
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: -lockToSquarePos });
                                            } else {
                                                evt.currentTarget.setPosition({
                                                    x: Math.min(evt.currentTarget.position().x, currentBaseWidth - MIN_WIDGET_SIZE),
                                                    y: Math.max(evt.currentTarget.position().y, -(currentBaseHeight - MIN_WIDGET_SIZE)),
                                                });
                                            }
                                            leftBoundDraggedRef.current = evt.currentTarget.position().x;
                                            bottomBoundDraggedRef.current = evt.currentTarget.position().y;
                                            updateResizeVisuals();
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
                                                const minDrag = -(Math.min(currentBaseWidth, currentBaseHeight) - MIN_WIDGET_SIZE);
                                                const lockToSquarePos = Math.max((evt.currentTarget.position().x + evt.currentTarget.position().y) / 2, minDrag);
                                                evt.currentTarget.setPosition({ x: lockToSquarePos, y: lockToSquarePos });
                                            } else {
                                                evt.currentTarget.setPosition({
                                                    x: Math.max(evt.currentTarget.position().x, -(currentBaseWidth - MIN_WIDGET_SIZE)),
                                                    y: Math.max(evt.currentTarget.position().y, -(currentBaseHeight - MIN_WIDGET_SIZE)),
                                                });
                                            }
                                            rightBoundDraggedRef.current = evt.currentTarget.position().x;
                                            bottomBoundDraggedRef.current = evt.currentTarget.position().y;
                                            updateResizeVisuals();
                                        }}
                                        onDragEnd={resizeComplete}
                                        onMouseEnter={evt => setPointer(evt, "se-resize")}
                                    />
                                </Group>
                            </Group>
                        </animated.Group>
                        {/* <Rect ref={contextMenuRef} cornerRadius={15} fill="black" width={90} height={60} x={-45} y={-45} /> */}
                        {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                        <Group ref={resizeButtonGroupRef} >
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
                                <MiniButton icon={"↓"}
                                    x={-30}
                                    y={-30}
                                    onTouchStart={exportWidget}
                                    onClick={exportWidget}
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
                                    onTouchStart={(e) => {
                                        const touch = e.evt.touches[0];
                                        if (!touch) return;
                                        e.currentTarget.getStage()?.container().dispatchEvent(new MouseEvent('mousemove', {
                                            clientX: touch.clientX,
                                            clientY: touch.clientY,
                                            bubbles: true,
                                        }));
                                        mainButtonAttr.onSelect();
                                    }}
                                    onTouchEnd={() => {
                                        setMainButtonHover(false);
                                    }}
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
        </Group >
    )
}

export default Widget;