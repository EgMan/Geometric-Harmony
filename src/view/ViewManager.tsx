import { Layer, Stage } from "react-konva";
import BackPlate from "./BackPlate";
import HarmonyAnalyzer from "../toys/HarmonyAnalyzer";
import Wheel from "../toys/Wheel";
import Piano from "../toys/Piano";
import StringInstrument from "../toys/StringInstrument";
import NewWidgetDropdown from "./NewWidgetDropdown";
import React from "react";
import Widget, { WidgetManagerActions } from "./Widget";
import { Vector2d } from "konva/lib/types";
import Konva from "konva";
import { Shape } from "konva/lib/Shape";

type WidgetTracker = {
    type: WidgetType,
    initialPosition: Vector2d,
    draggedPosition?: Vector2d,
    isMaxamized?: boolean,
    isTrayWidget?: boolean,
    // width: number,
    // height: number,
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
    }
}

type Props = {
    width: number,
    height: number,
}

function ViewManager(props: Props) {
    const limitingAxisIsHeight = props.width > props.height;
    const limitingAxisSize = limitingAxisIsHeight ? props.height : props.width;
    const padding = limitingAxisSize / 5;
    const wheelRadius = limitingAxisSize / 2 - padding;
    const pianoOctaveCount = limitingAxisIsHeight ? 4 : 2;
    const pianoHeight = ((props.height / 2) - wheelRadius) * 2 / 3;
    const guitarHeight = props.height - 200;
    const pianoWidth = (props.width / pianoOctaveCount) - .5;

    const [trackedWidgets, setTrackedWidgets] = React.useState<Map<String, WidgetTracker>>(
        new Map<String, WidgetTracker>([
            ['1', {
                type: WidgetType.Analyzer,
                initialPosition: { x: (props.width / 2) + (-(props.width / (2 * 8 / 3)) - 20), y: 30 },
            }],
            ['2', {
                type: WidgetType.Piano,
                initialPosition: { x: props.width / 2, y: props.height - pianoHeight - 21 },
            }],
            ['3', {
                type: WidgetType.Guitar,
                initialPosition: { x: (4 * props.width / 5) - 50 + (wheelRadius / 2), y: (props.height / 8) - (guitarHeight / 13) },
            }],
            ['4', {
                type: WidgetType.Wheel,
                initialPosition: { x: props.width / 4, y: (props.height / 2) - wheelRadius - 40 },
            }],
        ])
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
        const newUid = genUID();
        const newWidget: WidgetTracker = {
            type: type,
            initialPosition: position ?? { x: props.width / 2, y: props.height / 2 },
            isMaxamized: false,
            isTrayWidget: true,
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

    const trackerActions: WidgetTrackerActions = {
        killWidget: killWidget,
        spawnWidget: spawnWidget,
        getWidgetTracker: getWidgetTracker,
        setWidgetTracker: setWidgetTracker,
        updateWidgetTracker: updateWidgetTracker,
    }

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

    const onWidgetDragComplete = React.useCallback((uid: String, position: Vector2d) => {
        updateWidgetTracker(uid, (widget) => {
            if (widget.isMaxamized) {
                //todo move logic into widget
                return { ...widget, isTrayWidget: false, initialPosition: position, draggedPosition: undefined };
            }
            return null;
        });
    }, [updateWidgetTracker]);

    // TODO remove all constant functions to improve performance
    const renderWidgetFromTracker = React.useCallback((uid: String, widget: WidgetTracker) => {
        const actions: WidgetManagerActions = {
            killSelf: () => killWidget(uid),
            setIsMaxamized: (isMaxamized: boolean) => setIsMaxamized(uid, isMaxamized),
        }
        const setDraggedPosition = (val: Vector2d) => { onWidgetDrag(uid, val) };
        const setDragComplete = (val: Vector2d) => {
            onWidgetDragComplete(uid, val);
        };
        switch (widget.type) {
            case WidgetType.Piano:
                return <Widget of={Piano}
                    actions={actions}
                    key={`${uid}`}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    // setDraggedPosition={setPointerPos}
                    setDraggedPosition={setDraggedPosition}
                    setDragComplete={setDragComplete}
                    contextMenuOffset={{ x: 0, y: -pianoHeight - 20 }}
                    height={pianoHeight}
                    width={pianoWidth}
                    octaveCount={pianoOctaveCount}
                />
            case WidgetType.Wheel:
                return <Widget of={Wheel}
                    actions={actions}
                    key={`${uid}`}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition}
                    setDragComplete={setDragComplete}
                    contextMenuOffset={{ x: 0, y: -40 - wheelRadius }}
                    subdivisionCount={12}
                    radius={wheelRadius}
                    isCircleOfFifths={false} />
            case WidgetType.Guitar:
                const fretCount = 13;
                return <Widget of={StringInstrument}
                    actions={actions}
                    key={`${uid}`}
                    isMaxamized={widget.isMaxamized ?? true}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition}
                    setDragComplete={setDragComplete}
                    contextMenuOffset={{ x: wheelRadius / 2, y: - guitarHeight / fretCount }}
                    height={guitarHeight}
                    width={wheelRadius}
                    fretCount={fretCount}
                    tuning={[4, 9, 14, 19, 23, 28]}
                />
            case WidgetType.Analyzer:
                return <Widget of={HarmonyAnalyzer}
                    actions={actions}
                    key={`${uid}`}
                    isMaxamized={widget.isMaxamized ?? true}
                    contextMenuOffset={{ x: (-(props.width / (2 * 8 / 3)) - 20), y: 20 }}
                    initialPosition={widget.initialPosition}
                    draggedPosition={widget.draggedPosition ?? { x: 0, y: 0 }}
                    setDraggedPosition={setDraggedPosition}
                    setDragComplete={setDragComplete}
                    subdivisionCount={12}
                    width={props.width / (8 / 3)}
                />
        }
    }, [guitarHeight, killWidget, onWidgetDrag, onWidgetDragComplete, pianoHeight, pianoOctaveCount, pianoWidth, props.width, setIsMaxamized, wheelRadius])

    const widgetElements = React.useMemo(() => {
        const widgetArray = Array.from(trackedWidgets);
        return {
            tray: widgetArray
                .filter(([uid, widget]) => (widget.isTrayWidget ?? false))
                .map(([uid, widget]) => {
                    return renderWidgetFromTracker(uid, widget);
                }),
            real: widgetArray
                .filter(([uid, widget]) => !(widget.isTrayWidget ?? false))
                .map(([uid, widget]) => {
                    return renderWidgetFromTracker(uid, widget);
                }),
        };
    }, [renderWidgetFromTracker, trackedWidgets]);

    return (
        <Stage
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
                {widgetElements.real}
                <NewWidgetDropdown
                    x={30}
                    y={30}
                    width={100}
                    icon={'+'}
                    widgetTrackerActions={trackerActions}
                    pointerPosition={pointerPos} />
                {widgetElements.tray}
            </Layer>
        </Stage>
    );
}

export function genUID() {
    return `UID-${Math.floor(Math.random() * 10000000000000000)}`;
}

export default ViewManager;