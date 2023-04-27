import { Layer, Stage } from "react-konva";
import BackPlate from "./BackPlate";
import HarmonyAnalyzer from "../toys/HarmonyAnalyzer";
import Wheel from "../toys/Wheel";
import Piano from "../toys/Piano";
import StringInstrument from "../toys/StringInstrument";
import QuickSettingDropdown from "./QuickSettingDropdown";
import React from "react";
import Widget from "./Widget";
import { Vector2d } from "konva/lib/types";

type WidgetTracker = {
    type: WidgetType,
    initialPosition: Vector2d,
    // width: number,
    // height: number,
}
enum WidgetType {
    Piano,
    Wheel,
    Guitar,
    Analyzer,
}

type Props = {
    width: number,
    height: number,
}

function ViewManager(props: Props) {
    const [trackedWidgets, setTrackedWidgets] = React.useState<Map<String, WidgetTracker>>(
        new Map<String, WidgetTracker>([
            ['1', {
                type: WidgetType.Analyzer,
                initialPosition: { x: props.width / 2, y: 10 },
            }],
            ['2', {
                type: WidgetType.Piano,
                initialPosition: { x: props.width / 2, y: props.height - 1 },
            }],
            ['3', {
                type: WidgetType.Guitar,
                initialPosition: { x: (4 * props.width / 5) - 50, y: props.height / 8 },
            }],
            ['4', {
                type: WidgetType.Wheel,
                initialPosition: { x: props.width / 4, y: props.height / 2 },
            }],
        ])
    );

    const limitingAxisIsHeight = props.width > props.height;
    const limitingAxisSize = limitingAxisIsHeight ? props.height : props.width;
    const padding = limitingAxisSize / 5;
    const wheelRadius = limitingAxisSize / 2 - padding;
    const pianoOctaveCount = limitingAxisIsHeight ? 4 : 2;
    const pianoHeight = ((props.height / 2) - wheelRadius) * 2 / 3;
    const guitarHeight = props.height - 200;
    const pianoWidth = (props.width / pianoOctaveCount) - .5;

    const widgetElements = React.useMemo(() => {
        return Array.from(trackedWidgets).map(([uid, widget]) => {
            switch (widget.type) {
                case WidgetType.Piano:
                    return <Widget of={Piano}
                        key={`${uid}`}
                        initialPosition={widget.initialPosition}
                        contextMenuOffset={{ x: 0, y: -pianoHeight - 20 }}
                        height={pianoHeight}
                        width={pianoWidth}
                        octaveCount={pianoOctaveCount}
                    />
                case WidgetType.Wheel:
                    return <Widget of={Wheel}
                        key={`${uid}`}
                        initialPosition={widget.initialPosition}
                        contextMenuOffset={{ x: 0, y: -40 - wheelRadius }}
                        subdivisionCount={12}
                        radius={wheelRadius}
                        isCircleOfFifths={false} />
                case WidgetType.Guitar:
                    const fretCount = 13;
                    return <Widget of={StringInstrument}
                        key={`${uid}`}
                        initialPosition={widget.initialPosition}
                        contextMenuOffset={{ x: wheelRadius / 2, y: - guitarHeight / fretCount }}
                        height={guitarHeight}
                        width={wheelRadius}
                        fretCount={fretCount}
                        tuning={[4, 9, 14, 19, 23, 28]}
                    />
                case WidgetType.Analyzer:
                    // return <Group x={props.width / 2} y={10}>
                    //     <HarmonyAnalyzer
                    //         subdivisionCount={12}
                    //         width={props.width} />
                    // </Group>
                    return <Widget of={HarmonyAnalyzer}
                        key={`${uid}`}
                        contextMenuOffset={{ x: (-(props.width / (2 * 8 / 3)) - 20), y: 20 }}
                        initialPosition={widget.initialPosition}
                        subdivisionCount={12}
                        width={props.width / (8 / 3)}
                    />
            }
            return <div />;
        })
    }, [guitarHeight, pianoHeight, pianoOctaveCount, pianoWidth, props.width, trackedWidgets, wheelRadius]);

    return (
        <Stage
            width={props.width}
            height={props.height}
            onContextMenu={(e) => { e.evt.preventDefault() }}
        >
            <Layer>
                <BackPlate width={props.width} height={props.height} />
                {widgetElements}
                {/* <QuickSettingDropdown x={25} y={25} icon={'+'} /> */}
            </Layer>
        </Stage>
    );
}

export default ViewManager;