import { Group, Layer, Stage } from "react-konva";
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
import PlayTheShapeGame from "../toys/PlayTheShapeGame";
import Oscilloscope from "../toys/Oscilloscope";
import FrequencyVisualizer from "../toys/FrequencyVisualizer";
import HeartModal from "./HeartModal";
import { useSettings } from "./SettingsProvider";
import { useSpring as useSpring_web, animated as animated_web } from "@react-spring/web";
import Wireframe from "../toys/Wireframe";
import Icosahedron from "../toys/Icosahedron";
import Spiral from "../toys/Spiral";
import DiatonicChordExplorer from "../toys/DiatonicChordExplorer";
import MicPitch, { WidgetConfig_MicPitch } from "../toys/MicPitch";

export type WidgetTracker<T extends WidgetConfig = WidgetConfig> = {
    type: WidgetType,
    config: T,
    initialPosition: Vector2d,
    draggedPosition?: Vector2d,
    isMaxamized?: boolean,
    // dimentions: Dimentions,
    width: number,
    height: number,
}

export interface WidgetConfig {
    type: string,
    displayName: string,
}

export const WidgetConfig_Default: WidgetConfig =
{
    type: "default",
    displayName: "",
}

export type WidgetTrackerActions = {
    killWidget: (uid: String) => boolean,
    spawnWidget: (type: WidgetType, position?: Vector2d, config?: WidgetConfig) => string,
    getWidgetTracker: (uid: String) => WidgetTracker | null,
    setWidgetTracker: (uid: String, tracker: WidgetTracker | null) => boolean,
    updateWidgetTracker: (uid: String, callback: (currentTracker: WidgetTracker) => WidgetTracker) => boolean,
}

type WidgetDescriptor = {
    component: React.ElementType;
    displayName: string;
    lockAspectRatio?: boolean;
    contextMenuOffset: Vector2d;
    previewYOffset: number;
    componentProps: Record<string, any>;
};


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
    MicPitch,
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
        case WidgetType.MicPitch:
            return "Tuner";
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
    const [previewWidgetInfo, setPreviewWidgetInfo] = React.useState<{ type: WidgetType, config?: WidgetConfig } | null>(null);

    const [trackedWidgets, setTrackedWidgets] = React.useState<Map<String, WidgetTracker>>(
        new Map<String, WidgetTracker>(limitingAxisIsHeight ?
            // Landscape mode
            [
                ['1', {
                    type: WidgetType.Analyzer,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) },
                    width: props.width / (8 / 3),
                    height: 0,
                    config: WidgetConfig_Default,
                }],
                ['2', {
                    type: WidgetType.Piano,
                    initialPosition: { x: props.width / 2, y: props.height - pianoHeight - 19 },
                    width: pianoWidth,
                    height: pianoHeight,
                    config: WidgetConfig_Default,
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
                    config: WidgetConfig_Default,
                }],
                // ['3', {
                //     type: WidgetType.Tonnetz,
                //     initialPosition: { x: 3 * props.width / 4, y: 75 },
                //     width: wheelRadius,
                //     height: wheelRadius,
                // config: WidgetConfig_Default,
                // }],
                ['4', {
                    type: WidgetType.Wheel,
                    initialPosition: { x: props.width / 4, y: 75 },
                    width: wheelDiameter,
                    height: wheelRadius,
                    config: WidgetConfig_Default,
                }],
                ['5', {
                    type: WidgetType.Oscilloscope,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) + wheelRadius - 120 },
                    width: props.width / (8 / 3),
                    height: wheelRadius / 2,
                    config: WidgetConfig_Default,
                }],
                // ['6', {
                //     type: WidgetType.Icosahedron,
                //     initialPosition: { x: props.width / 2, y: 75 },
                //     width: wheelRadius,
                //     height: wheelRadius,
                // }],
            ]
            // Portrait mode
            : [
                ['1', {
                    type: WidgetType.Analyzer,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) + (wheelRadius * 2 / 3) },
                    width: props.width / (8 / 3),
                    height: 0,
                    config: WidgetConfig_Default,
                }],
                ['2', {
                    type: WidgetType.Piano,
                    initialPosition: { x: props.width / 2, y: props.height - pianoHeight - 19 },
                    width: props.width,
                    height: pianoHeight,
                    config: WidgetConfig_Default,
                }],
                ['4', {
                    type: WidgetType.Wheel,
                    initialPosition: { x: props.width / 2, y: 125 },
                    width: wheelRadius * 2,
                    height: wheelRadius * 2,
                    config: WidgetConfig_Default,
                }],
                ['5', {
                    type: WidgetType.Oscilloscope,
                    initialPosition: { x: (props.width / 2), y: (props.height / 2) + (3 * wheelRadius / 4) },
                    width: props.width / (8 / 3),
                    height: wheelRadius / 2,
                    config: WidgetConfig_Default,
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

    const spawnWidget = React.useCallback((type: WidgetType, position?: Vector2d, config?: WidgetConfig) => {
        console.log("Spawning widget of type:", type, config);
        (window as any).gtag?.('event', 'spawn_widget', { widget_type: widgetNameByType(type) });
        if (config === undefined) {
            config = type === WidgetType.MicPitch ? WidgetConfig_MicPitch : WidgetConfig_Default;
        }
        const newUid = genUID();
        const newWidget: WidgetTracker = {
            type: type,
            initialPosition: position ?? { x: props.width / 2, y: props.height / 2 },
            isMaxamized: true,
            width: 50,//TODO CHANGE THIS
            height: 50,
            config,
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

    const widgetDescriptors = React.useMemo((): Record<WidgetType, WidgetDescriptor> => ({
        [WidgetType.Piano]: {
            component: Piano,
            displayName: "Piano",
            contextMenuOffset: { x: pianoWidth / 2, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: pianoWidth,
                height: pianoHeight,
                octaveCount: pianoOctaveCount,
                octaveOffset: limitingAxisIsHeight ? -2 : 0,
            },
        },
        [WidgetType.Wheel]: {
            component: Wheel,
            displayName: "Wheel",
            lockAspectRatio: true,
            contextMenuOffset: { x: wheelRadius, y: -40 },
            previewYOffset: 40,
            componentProps: {
                width: wheelRadius * 2,
                height: wheelRadius * 2,
                subdivisionCount: 12,
            },
        },
        [WidgetType.Guitar]: {
            component: StringInstrument,
            displayName: "Guitar",
            contextMenuOffset: { x: wheelRadius / 2, y: -guitarHeight / 13 },
            previewYOffset: guitarHeight / 13,
            componentProps: {
                width: wheelRadius,
                height: guitarHeight,
                fretCount: 13,
            },
        },
        [WidgetType.Analyzer]: {
            component: HarmonyAnalyzer,
            displayName: "Harmony Analyzer",
            contextMenuOffset: { x: props.width / (16 / 3), y: 0 },
            previewYOffset: 0,
            componentProps: {
                width: props.width / (8 / 3),
                subdivisionCount: 12,
            },
        },
        [WidgetType.Tonnetz]: {
            component: Tonnetz,
            displayName: "Tonnetz Diagram",
            lockAspectRatio: true,
            contextMenuOffset: { x: wheelRadius, y: -40 },
            previewYOffset: 40,
            componentProps: {
                width: wheelRadius * 2,
                height: wheelRadius * 2,
            },
        },
        [WidgetType.PlayShapeGame]: {
            component: PlayTheShapeGame,
            displayName: "Chord Game",
            contextMenuOffset: { x: wheelRadius * 0.6, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: wheelRadius * 1.2,
                height: wheelRadius / 2,
            },
        },
        [WidgetType.Oscilloscope]: {
            component: Oscilloscope,
            displayName: "Oscilloscope",
            contextMenuOffset: { x: wheelRadius * 0.6, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: wheelRadius * 1.2,
                height: wheelRadius / 2,
            },
        },
        [WidgetType.FrequencyVis]: {
            component: FrequencyVisualizer,
            displayName: "Frequency Visualizer",
            contextMenuOffset: { x: wheelRadius * 0.6, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: wheelRadius * 1.2,
                height: wheelRadius / 2,
            },
        },
        [WidgetType.Icosahedron]: {
            component: Icosahedron,
            displayName: "Icosahedron",
            lockAspectRatio: true,
            contextMenuOffset: { x: wheelRadius / 4, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: wheelRadius / 2,
                height: wheelRadius / 2,
            },
        },
        [WidgetType.Spiral]: {
            component: Spiral,
            displayName: "Spiral",
            lockAspectRatio: true,
            contextMenuOffset: { x: wheelRadius, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: wheelRadius * 2,
                height: wheelRadius * 2,
            },
        },
        [WidgetType.DiatonicExplorer]: {
            component: DiatonicChordExplorer,
            displayName: "DiatonicChordExplorer",
            contextMenuOffset: { x: wheelRadius, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: wheelRadius * 2,
                height: wheelRadius * 2,
            },
        },
        [WidgetType.MicPitch]: {
            component: MicPitch,
            displayName: "Tuner",
            contextMenuOffset: { x: 100, y: -20 },
            previewYOffset: 20,
            componentProps: {
                width: 200,
                height: 150,
            },
        },
    }), [pianoWidth, pianoHeight, pianoOctaveCount, limitingAxisIsHeight, wheelRadius, guitarHeight, props.width]);

    const renderWidgetFromTracker = React.useCallback((uid: String, widget: WidgetTracker) => {
        const desc = widgetDescriptors[widget.type];
        if (!desc) return null;
        return <Widget of={desc.component}
            layout={{ displayName: desc.displayName }}
            uid={uid}
            actions={trackerActions}
            tracker={widget}
            key={`${uid}`}
            isPeaceModeEnabled={isPeaceModeEnabled}
            isMaxamized={widget.isMaxamized ?? true}
            initialPosition={widget.initialPosition}
            draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
            setDraggedPosition={setDraggedPosition(uid)}
            contextMenuOffset={desc.contextMenuOffset}
            lockAspectRatio={desc.lockAspectRatio}
            {...desc.componentProps}
        />;
    }, [widgetDescriptors, isPeaceModeEnabled, setDraggedPosition, trackerActions])

    const widgetElements = React.useMemo(() => {
        return Array.from(trackedWidgets).map(([uid, widget]) => renderWidgetFromTracker(uid, widget));
    }, [renderWidgetFromTracker, trackedWidgets]);

    const previewFromWidget = React.useMemo(() => ({
        isOverlayVisible: false,
        setIsOverlayVisible: (() => { }) as React.Dispatch<React.SetStateAction<boolean>>,
        position: { x: 0, y: 0 },
        positionOffset: { x: 0, y: 0 },
        containerPosition: { x: 0, y: 0 },
        widgetConfig: previewWidgetInfo?.config ?? WidgetConfig_Default,
        isPreview: true,
    }), [previewWidgetInfo?.config]);

    const renderPreviewWidget = React.useCallback(() => {
        if (!previewWidgetInfo) return null;
        const desc = widgetDescriptors[previewWidgetInfo.type];
        if (!desc) return null;
        const Component = desc.component;
        const spawnX = 0.5 * props.width;
        const spawnY = 0.25 * props.height;
        const w = desc.componentProps.width ?? 0;
        return <Group x={spawnX - w / 2} y={spawnY + desc.previewYOffset}>
            <Component fromWidget={previewFromWidget} {...desc.componentProps} />
        </Group>;
    }, [previewWidgetInfo, widgetDescriptors, previewFromWidget, props.width, props.height]);

    const previewSpring = useSpring_web({ opacity: previewWidgetInfo ? 1 : 0 });

    const stageRef = React.useRef<Konva.Stage>(null);

    const onContainerFocus: React.FocusEventHandler<HTMLDivElement> = React.useCallback((event) => {
        event.currentTarget.blur();
    }, []);

    return (
        <div className="container-div" onFocus={onContainerFocus}>
            <ToolBar widgetTrackerActions={trackerActions} stageRef={stageRef} setIsHeartModalOpen={setIsHeartModalOpen} onWidgetHover={setPreviewWidgetInfo} />
            {previewWidgetInfo && (
                <animated_web.div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 1299,
                        pointerEvents: 'auto',
                        backdropFilter: 'blur(16px)',
                        backgroundColor: '#7c7c7c37',
                        ...previewSpring,
                    }}
                    onClick={() => setPreviewWidgetInfo(null)}
                >
                    <Stage width={props.width} height={props.height} style={{ pointerEvents: 'none' }}>
                        <Layer listening={false}>
                            {renderPreviewWidget()}
                        </Layer>
                    </Stage>
                </animated_web.div>
            )}
            <Stage
                ref={stageRef}
                width={props.width}
                height={props.height}
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
    );
}

export function genUID() {
    return `UID-${Math.floor(Math.random() * 10000000000000000)}`;
}

export default ViewManager;