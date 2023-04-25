import { Layer, Stage } from "react-konva";
import BackPlate from "./BackPlate";
import HarmonyAnalyzer, { explorerWidth } from "./HarmonyAnalyzer";
import Wheel from "./Wheel";
import Piano from "./Piano";
import StringInstrument from "./StringInstrument";
import QuickSettingDropdown from "./QuickSettingDropdown";
import React from "react";
import Widget from "./Widget";

type WidgetTracker = {
    type: WidgetType,
    // width: number,
    // height: number,
}
enum WidgetType {
    Piano,
    Wheel,
    Guitar,
    Analyzer,
}

// const startingScene: WidgetTracker[] = [{ type: WidgetType.Piano, width: 0, height: 0 }, { type: WidgetType.Wheel, width: 0, height: 0 }, { type: WidgetType.Guitar, width: 0, height: 0 }, { type: WidgetType.Analyzer, width: 0, height: 0 }];
const startingScene: WidgetTracker[] = [{ type: WidgetType.Analyzer }, { type: WidgetType.Piano }, { type: WidgetType.Guitar }, { type: WidgetType.Wheel }];

type Props = {
    width: number,
    height: number,
}

function ViewManager(props: Props) {
    const [trackedWidgets, setTrackedWidgets] = React.useState<WidgetTracker[]>(startingScene);

    const limitingAxisIsHeight = props.width > props.height;
    const limitingAxisSize = limitingAxisIsHeight ? props.height : props.width;
    const padding = limitingAxisSize / 5;
    const wheelRadius = limitingAxisSize / 2 - padding;
    const pianoOctaveCount = limitingAxisIsHeight ? 4 : 2;
    const pianoHeight = ((props.height / 2) - wheelRadius) * 2 / 3;
    const guitarHeight = props.height - 200;
    const pianoWidth = (props.width / pianoOctaveCount) - .5;

    const widgetElements = React.useMemo(() => {
        return trackedWidgets.map((widget, id) => {
            switch (widget.type) {
                case WidgetType.Piano:
                    return <Widget of={Piano}
                        initialPosition={{ x: props.width / 2, y: props.height - 1 }}
                        contextMenuOffset={{ x: 0, y: -pianoHeight - 20 }}
                        height={pianoHeight}
                        width={pianoWidth}
                        octaveCount={pianoOctaveCount}
                    />
                case WidgetType.Wheel:
                    // return <Wheel subdivisionCount={12} radius={wheelRadius} x={props.width / 4} y={props.height / 2} isCircleOfFifths={false} />
                    // <Piano x={windowWidth / 2} y={windowHeight - 1} height={pianoHeight} width={pianoWidth} octaveCount={pianoOctaveCount} />
                    // <Wheel subdivisionCount={12} radius={wheelRadius} x={windowWidth / 4} y={windowHeight / 2} isCircleOfFifths={false} />
                    return <Widget of={Wheel}
                        initialPosition={{ x: props.width / 4, y: props.height / 2 }}
                        contextMenuOffset={{ x: 0, y: -40 - wheelRadius }}
                        subdivisionCount={12}
                        radius={wheelRadius}
                        isCircleOfFifths={false} />
                case WidgetType.Guitar:
                    const fretCount = 13;
                    // <Widget x={props.x - (props.width / 2)} y={props.y} contextMenuX={props.width / 2} contextMenuY={-fretSpacing} settingsRows={settingsMenuItems}>
                    return <Widget of={StringInstrument}
                        initialPosition={{ x: 4 * props.width / 5, y: props.height / 8 }}
                        contextMenuOffset={{ x: wheelRadius / 2, y: - guitarHeight / fretCount }}
                        // x={4 * props.width / 5} y={props.height / 8}
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
                        contextMenuOffset={{ x: (-explorerWidth / 2) - 20, y: 20 }}
                        initialPosition={{ x: props.width / 2, y: 10 }}
                        subdivisionCount={12}
                        width={props.width}
                    />
            }
            return <div />;
        })
    }, [guitarHeight, pianoHeight, pianoOctaveCount, pianoWidth, props.height, props.width, trackedWidgets, wheelRadius]);

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