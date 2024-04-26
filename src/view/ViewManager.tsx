import { Layer, Stage } from "react-konva";
import BackPlate from "./BackPlate";
import HarmonyAnalyzer from "../toys/HarmonyAnalyzer";
import Wheel from "../toys/Wheel";
import Piano from "../toys/Piano";
import StringInstrument from "../toys/StringInstrument";
import React from "react";
import Widget from "./Widget";
import { Vector2d } from "konva/lib/types";
import Konva from "konva";
import { Shape } from "konva/lib/Shape";
import Tonnetz from "../toys/Tonnetz";
import ToolBar from "./ToolBar";
import { SCROLL_PADDING, realignSpaces } from "../utils/SpacesUtils";
import PlayTheShapeGame from "../toys/PlayTheShapeGame";
import Oscilloscope from "../toys/Oscilloscope";
import FrequencyVisualizer from "../toys/FrequencyVisualizer";
import HeartModal from "./HeartModal";
import { useSettings } from "./SettingsProvider";
import Wireframe from "../toys/Wireframe";
import Icosahedron from "../toys/Icosahedron";
import Spiral from "../toys/Spiral";
import DiatonicChordExplorer from "../toys/DiatonicChordExplorer";

export type WidgetTracker = {
    type: WidgetType,
    initialPosition: Vector2d,
    draggedPosition?: Vector2d,
    isMaxamized?: boolean,
    // dimentions: Dimentions,
    width: number,
    height: number,
}

export type WidgetTrackerActions = {
    killWidget: (uid: String) => boolean,
    spawnWidget: (type: WidgetType, position?: Vector2d) => string,
    getWidgetTracker: (uid: String) => WidgetTracker | null,
    setWidgetTracker: (uid: String, tracker: WidgetTracker | null) => boolean,
    updateWidgetTracker: (uid: String, callback: (currentTracker: WidgetTracker) => WidgetTracker) => boolean,
}


export enum WidgetType {
    Wheel,
    Piano,
    Guitar,
    Analyzer,
    Tonnetz,
    PlayShapeGame,
    Oscilloscope,
    FrequencyVis,
    Icosahedron,
    Spiral,
    DiatonicExplorer,
}

export const widgetNameByType = (type: WidgetType) => {
    switch (type) {
        case WidgetType.Piano:
            return "Piano";
        case WidgetType.Wheel:
            return "Wheel";
        case WidgetType.Guitar:
            return "Guitar";
        case WidgetType.Analyzer:
            return "Analyzer";
        case WidgetType.Tonnetz:
            return "Tonnetz";
        case WidgetType.PlayShapeGame:
            return "Quiz";
        case WidgetType.Oscilloscope:
            return "Waveform";
        case WidgetType.FrequencyVis:
            return "Frequency";
        case WidgetType.Icosahedron:
            return "Icosahedron";
        case WidgetType.DiatonicExplorer:
            return "DiatonicExplorer";
    }
}

type Props = {
    width: number,
    height: number,
}

function ViewManager(props: Props) {
    const limitingAxisIsHeight = props.width > props.height;
    // const limitingAxisSize = limitingAxisIsHeight ? props.height : props.width;
    const PortraitMaxXScreenWheelDiameter = props.width / 3;
    const PortraitmaxYScreenWheelDiameter = props.height * 2 / 3;
    const LandscapeMaxXScreenWheelDiameter = props.width * 2 / 3;
    const LandscapemaxYScreenWheelDiameter = props.height * 2 / 3;

    const wheelDiameter = limitingAxisIsHeight ?
        Math.min(PortraitMaxXScreenWheelDiameter, PortraitmaxYScreenWheelDiameter) :
        Math.min(LandscapeMaxXScreenWheelDiameter, LandscapemaxYScreenWheelDiameter);
    const wheelRadius = wheelDiameter / 2;
    const pianoOctaveCount = limitingAxisIsHeight ? 7 : 2;
    const pianoHeight = ((props.height / 2) - wheelRadius) * 2 / 3;
    const guitarHeight = props.height - 200;
    // const pianoWidth = (props.width) - .5;
    const pianoWidth = (props.width) + 1.5;
    // const [isPeaceModeEnabled, setIsPeaceModeEnabled] = React.useState(false);
    const settings = useSettings();
    const isPeaceModeEnabled = settings?.isPeaceModeEnabled ?? false;
    const [isHeartModalOpen, setIsHeartModalOpen] = React.useState(false);

    const [trackedWidgets, setTrackedWidgets] = React.useState<Map<String, WidgetTracker>>(
        new Map<String, WidgetTracker>(limitingAxisIsHeight ?
            // Portrait mode
            [
                ['1', {
                    type: WidgetType.Analyzer,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) },
                    width: props.width / (8 / 3),
                    height: 0,
                }],
                ['2', {
                    type: WidgetType.Piano,
                    initialPosition: { x: props.width / 2, y: props.height - pianoHeight - 19 },
                    width: pianoWidth,
                    height: pianoHeight,
                }],
                // ['3', {
                //     type: WidgetType.Guitar,
                //     initialPosition: { x: (4 * props.width / 5) - 50 + (wheelRadius / 2), y: (props.height / 8) - (guitarHeight / 13) },
                // }],
                ['3', {
                    type: WidgetType.DiatonicExplorer,
                    initialPosition: { x: 3 * props.width / 4, y: 75 },
                    width: wheelRadius,
                    height: wheelRadius,
                }],
                // ['3', {
                //     type: WidgetType.Tonnetz,
                //     initialPosition: { x: 3 * props.width / 4, y: 75 },
                //     width: wheelRadius,
                //     height: wheelRadius,
                // }],
                ['4', {
                    type: WidgetType.Wheel,
                    initialPosition: { x: props.width / 4, y: 75 },
                    width: wheelDiameter,
                    height: wheelRadius,
                }],
                ['5', {
                    type: WidgetType.Oscilloscope,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) + wheelRadius - 120 },
                    width: props.width / (8 / 3),
                    height: wheelRadius / 2,
                }],
                // ['6', {
                //     type: WidgetType.Icosahedron,
                //     initialPosition: { x: props.width / 2, y: 75 },
                //     width: wheelRadius,
                //     height: wheelRadius,
                // }],
            ]
            // Landscape mode
            : [
                ['1', {
                    type: WidgetType.Analyzer,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) + (wheelRadius * 2 / 3) },
                    width: props.width / (8 / 3),
                    height: 0,
                }],
                ['2', {
                    type: WidgetType.Piano,
                    initialPosition: { x: props.width / 2, y: props.height - pianoHeight - 19 },
                    width: props.width,
                    height: pianoHeight,
                }],
                ['4', {
                    type: WidgetType.Wheel,
                    initialPosition: { x: props.width / 2, y: 125 },
                    width: wheelRadius * 2,
                    height: wheelRadius * 2,
                }],
                ['5', {
                    type: WidgetType.Oscilloscope,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) + (3 * wheelRadius / 4) },
                    width: props.width / (8 / 3),
                    height: wheelRadius / 2,
                }],
            ]
        )
    );

    // React.useEffect(() => {
    //     console.log("Widget tracker:", trackedWidgets);
    // }, [trackedWidgets]);

    const killWidget = React.useCallback((uid: String) => {
        if (trackedWidgets.has(uid)) {
            setTrackedWidgets(oldTrackedWidgets => {
                const newTrackedWidgets = new Map(oldTrackedWidgets);
                newTrackedWidgets.delete(uid);
                return newTrackedWidgets;
            });
            return true;
        }
        return false;
    }, [trackedWidgets]);

    const spawnWidget = React.useCallback((type: WidgetType, position?: Vector2d) => {
        console.log("Spawning widget of type:", type);
        const newUid = genUID();
        const newWidget: WidgetTracker = {
            type: type,
            initialPosition: position ?? { x: props.width / 2, y: props.height / 2 },
            isMaxamized: true,
            width: 50,//TODO CHANGE THIS
            height: 50,
        }
        setTrackedWidgets(oldTrackedWidgets => new Map(oldTrackedWidgets).set(newUid, newWidget));
        return newUid;
    }, [props.width, props.height]);

    const setWidgetTracker = React.useCallback((uid: String, tracker: WidgetTracker | null) => {
        if (trackedWidgets.has(uid) && tracker != null) {
            setTrackedWidgets(oldTrackedWidgets => {
                const newTrackedWidgets = new Map(oldTrackedWidgets);
                const widget = newTrackedWidgets.get(uid);
                newTrackedWidgets.set(uid, { ...widget, ...tracker });
                return newTrackedWidgets;
            });
            return true;
        }
        return false;
    }, [trackedWidgets])

    const getWidgetTracker = React.useCallback((uid: String) => {
        return trackedWidgets.get(uid) ?? null;
    }, [trackedWidgets])

    const updateWidgetTracker = React.useCallback((uid: String, callback: (currentTracker: WidgetTracker) => WidgetTracker | null) => {
        if (trackedWidgets.has(uid)) {
            setTrackedWidgets(oldTrackedWidgets => {
                const newTrackedWidgets = new Map(oldTrackedWidgets);
                const widget = newTrackedWidgets.get(uid);
                if (widget) {
                    const newTracker = callback(widget);
                    if (newTracker) {
                        newTrackedWidgets.set(uid, { ...widget, ...newTracker });
                    }
                }
                return newTrackedWidgets;
            });
            return true;
        }
        return false;
    }, [trackedWidgets]);

    const setIsMaxamized = React.useCallback((uid: String, isMaxamized: boolean) => {
        if (trackedWidgets.has(uid)) {
            setTrackedWidgets(oldTrackedWidgets => {
                const newTrackedWidgets = new Map(oldTrackedWidgets);
                const widget = newTrackedWidgets.get(uid);
                if (widget) {
                    widget.isMaxamized = isMaxamized;
                }
                return newTrackedWidgets;
            });
            return true;
        }
        return false;
    }, [trackedWidgets])

    const trackerActions: WidgetTrackerActions = React.useMemo(() => ({
        killWidget: killWidget,
        spawnWidget: spawnWidget,
        getWidgetTracker: getWidgetTracker,
        setWidgetTracker: setWidgetTracker,
        updateWidgetTracker: updateWidgetTracker,
    }), [getWidgetTracker, killWidget, setWidgetTracker, spawnWidget, updateWidgetTracker]);

    const [pointerPos, setPointerPos] = React.useState<Vector2d | null>(null);
    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        setPointerPos(stage.getPointerPosition());
    };
    const handleTouchStart = (e: Konva.KonvaEventObject<TouchEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;
        setPointerPos(stage.getPointerPosition());
    };

    const [shapeHoveredOnTouchDevice, setShapeHoveredOnTouchDevice] = React.useState<Shape | null>(null);
    const handleTouchMove = (e: Konva.KonvaEventObject<TouchEvent>) => {
        const stage = e.target.getStage();

        if (!stage) return;
        const position = stage.getPointerPosition();
        if (!position) return;

        const shape = stage.getIntersection(position);

        shapeHoveredOnTouchDevice?.fire('mouseout');
        shapeHoveredOnTouchDevice?.fire('mouseleave');

        setShapeHoveredOnTouchDevice(shape);

        shape?.fire('mouseover');
        shape?.fire('mouseenter');
    };
    const handleTouchEnd = (e: Konva.KonvaEventObject<TouchEvent>) => {
        shapeHoveredOnTouchDevice?.fire('mouseout');
        shapeHoveredOnTouchDevice?.fire('mouseleave');

        setShapeHoveredOnTouchDevice(null);
    };

    const onWidgetDrag = React.useCallback((uid: String, value: Vector2d) => {
        updateWidgetTracker(uid, (widget) => {
            setPointerPos({ x: value.x + widget.initialPosition.x, y: value.y + widget.initialPosition.y });
            return { ...widget, draggedPosition: value };
        });
    }, [updateWidgetTracker]);

    // TODO remove all constant functions to improve performance

    const setDraggedPosition = React.useCallback((uid: String) => {
        return (val: Vector2d) => { onWidgetDrag(uid, val) }
    }, [onWidgetDrag])

    const renderWidgetFromTracker = React.useCallback((uid: String, widget: WidgetTracker) => {
        switch (widget.type) {
            case WidgetType.Piano:
                return <Widget of={Piano}
                    layout={{ displayName: "Piano" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: pianoWidth / 2, y: -20 }}
                    width={pianoWidth}
                    height={pianoHeight}
                    octaveCount={pianoOctaveCount} />
            case WidgetType.Wheel:
                return <Widget of={Wheel}
                    layout={{ displayName: "Wheel" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius, y: -40 }}
                    subdivisionCount={12}
                    width={wheelRadius * 2}
                    height={wheelRadius * 2}
                    lockAspectRatio
                    isCircleOfFifths={false} />
            case WidgetType.Guitar:
                const fretCount = 13;
                return <Widget of={StringInstrument}
                    layout={{ displayName: "Guitar" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius / 2, y: - guitarHeight / fretCount }}
                    height={guitarHeight}
                    width={wheelRadius}
                    fretCount={fretCount}
                    tuning={[4, 9, 14, 19, 23, 28]}
                />
            case WidgetType.Analyzer:
                return <Widget of={HarmonyAnalyzer}
                    layout={{ displayName: "Harmony Analyzer" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    contextMenuOffset={{ x: props.width / (16 / 3), y: 0 }}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    subdivisionCount={12}
                    width={props.width / (8 / 3)}
                />
            case WidgetType.Tonnetz:
                return <Widget of={Tonnetz}
                    layout={{ displayName: "Tonnetz Diagram" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    lockAspectRatio
                    contextMenuOffset={{ x: wheelRadius, y: -40 }}
                    width={wheelRadius * 2}
                    height={wheelRadius * 2}
                />
            case WidgetType.PlayShapeGame:
                return <Widget of={PlayTheShapeGame}
                    layout={{ displayName: "Chord Game" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius * 0.6, y: -20 }}
                    width={wheelRadius * 1.2}
                    height={wheelRadius / 2}
                />
            case WidgetType.Oscilloscope:
                return <Widget of={Oscilloscope}
                    layout={{ displayName: "Oscilloscope" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius * 0.6, y: -20 }}
                    width={wheelRadius * 1.2}
                    height={wheelRadius / 2}
                />
            case WidgetType.FrequencyVis:
                return <Widget of={FrequencyVisualizer}
                    layout={{ displayName: "Frequency Visualizer" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius * 0.6, y: -20 }}
                    width={wheelRadius * 1.2}
                    height={wheelRadius / 2}
                />
            case WidgetType.Icosahedron:
                return <Widget of={Icosahedron}
                    layout={{ displayName: "Icosahedron" }}
                    lockAspectRatio
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius / 4, y: -20 }}
                    width={wheelRadius / 2}
                    height={wheelRadius / 2}
                />
            case WidgetType.Spiral:
                return <Widget of={Spiral}
                    layout={{ displayName: "Spiral" }}
                    lockAspectRatio
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius, y: -20 }}
                    width={wheelRadius * 2}
                    height={wheelRadius * 2}
                />
            case WidgetType.DiatonicExplorer:
                return <Widget of={DiatonicChordExplorer}
                    layout={{ displayName: "DiatonicChordExplorer" }}
                    uid={uid}
                    actions={trackerActions}
                    tracker={widget}
                    key={`${uid}`}
                    isPeaceModeEnabled={isPeaceModeEnabled}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition(uid)}
                    contextMenuOffset={{ x: wheelRadius, y: -20 }}
                    width={wheelRadius * 2}
                    height={wheelRadius * 2} />
        }
    }, [guitarHeight, isPeaceModeEnabled, pianoHeight, pianoOctaveCount, pianoWidth, props.width, setDraggedPosition, trackerActions, wheelRadius])

    const widgetElements = React.useMemo(() => {
        return Array.from(trackedWidgets).map(([uid, widget]) => renderWidgetFromTracker(uid, widget));
    }, [renderWidgetFromTracker, trackedWidgets]);

    const stageRef = React.useRef<Konva.Stage>(null);

    const timeout = React.useRef<number | null>(null);

    const onContainerScroll = React.useCallback(() => {
        var scrollContainer = document.getElementById('stage-scroll-container');
        var stageContainer = document.getElementById('stage-container');
        if (scrollContainer && stageContainer) {
            var dx = scrollContainer.scrollLeft - SCROLL_PADDING;
            var dy = scrollContainer.scrollTop - SCROLL_PADDING;
            stageContainer.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
            stageRef.current?.position({ x: -dx, y: -dy });
        }

        // If it has been 750ms since the last scroll event, realign the spaces
        if (timeout.current !== null) {
            window.clearTimeout(timeout.current);
        }
        timeout.current = window.setTimeout(function () {
            realignSpaces();
        }, 750)
    }, []);

    React.useEffect(() => {
        realignSpaces();
    }, []);

    return (
        <div>
            <ToolBar widgetTrackerActions={trackerActions} stageRef={stageRef} setIsHeartModalOpen={setIsHeartModalOpen} />
            <div id="stage-scroll-container" onScroll={onContainerScroll}>
                <div id="spaces-container">
                    <div className="desktop-space space1" >
                        <div id="stage-container">
                            <Stage
                                ref={stageRef}
                                width={props.width + SCROLL_PADDING * 2}
                                height={props.height + SCROLL_PADDING * 2}
                                onContextMenu={(e) => { e.evt.preventDefault() }}
                                onMouseMove={handleMouseMove}
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                <Layer>
                                    <BackPlate width={props.width} height={props.height} />
                                    <HeartModal isOpen={isHeartModalOpen} setIsOpen={setIsHeartModalOpen} />
                                    {widgetElements}
                                </Layer>
                            </Stage>
                        </div>
                    </div>
                    <div className="desktop-space space2" />
                    <div className="desktop-space space3" />
                    <div className="desktop-space space4" />
                </div>
            </div>
        </div>
    );
}

export function genUID() {
    return `UID-${Math.floor(Math.random() * 10000000000000000)}`;
}

export default ViewManager;