import React from "react";
import { WidgetComponentProps } from "../view/Widget";
import { Circle, Group, Line, Rect, Text } from "react-konva";
import SettingsMenuOverlay from "../view/SettingsMenuOverlay";
import { Point3D, orthographicProjection, perspectiveProjection, rotateX, rotateY, rotateZ, scale2D, scale2Dflat } from "../graphics3D/Engine3D";
import { useAppTheme } from "../view/ThemeManager";
import { Height } from "@mui/icons-material";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import angle from "vectorious/dist/core/angle";
import { isNumber } from "tone";
import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import { bigGold, blendColors, fadeColors, smallGold } from "../utils/Utils";
import Konva from "konva";
import zIndex from "@mui/material/styles/zIndex";

const LINE_WIDTH = 1;
const zDist = 9;

export type WireframeLine = {
    start: Point3D | number,
    end: Point3D | number,
    color?: string,
    lineProps?: React.ComponentProps<typeof Line>
}

export type WireframePoint = {
    location3D: Point3D,
    color?: string,
    circleProps?: React.ComponentProps<typeof Circle>
}

type Props = {
    width: number,
    height: number,
    points: WireframePoint[],
    containBoundaries?: boolean | undefined,
    autoRotateVector?: Point3D | undefined,
    setPoints: React.Dispatch<React.SetStateAction<WireframePoint[]>>,
    lines: WireframeLine[],
    setLines: React.Dispatch<React.SetStateAction<WireframeLine[]>>,
} & WidgetComponentProps

function Wireframe(props: Props) {
    const { colorPalette } = useAppTheme()!;

    const fogEffect = .75;

    const settingsMenuItems = [
        (<tr key={'tr0'}>
            <td></td>
            {/* <td style={{ color: getIntervalColor(1, colorPalette), textAlign: "center" }}>■</td> */}
            <td><NumberInput min={-10} max={10} /></td>
        </tr>),
    ];
    // const [points, setPoints] = React.useState<Point3D[]>([
    //     { x: -.5, y: -.5, z: -.5 },
    //     { x: -.5, y: .5, z: -.5 },
    //     { x: .5, y: .5, z: -.5 },
    //     { x: .5, y: -.5, z: -.5 },
    //     { x: -.5, y: -.5, z: .5 },
    //     { x: -.5, y: .5, z: .5 },
    //     { x: .5, y: .5, z: .5 },
    //     { x: .5, y: -.5, z: .5 },
    //     // { x: 0, y: 0, z: 0 },
    // ]);

    // const [lines, setLines] = React.useState<WireframeLine[]>([
    //     { start: 0, end: 1 },
    //     { start: 1, end: 2 },
    //     { start: 2, end: 3 },
    //     { start: 3, end: 0 },
    //     { start: 4, end: 5 },
    //     { start: 5, end: 6 },
    //     { start: 6, end: 7 },
    //     { start: 7, end: 4 },
    //     { start: 0, end: 4 },
    //     { start: 1, end: 5 },
    //     { start: 2, end: 6 },
    //     { start: 3, end: 7 },

    //     // { start: 0, end: 8 },
    //     // { start: 1, end: 8 },
    //     // { start: 2, end: 8 },
    //     // { start: 3, end: 8 },
    //     // { start: 4, end: 8 },
    //     // { start: 5, end: 8 },
    //     // { start: 6, end: 8 },
    //     // { start: 7, end: 8 },
    // ]);

    // 𝜑,1,0)
    // (𝜑,−1,0)
    // (−𝜑,−1,0)
    // (−𝜑,1,0)

    // (1,0,𝜑)
    // (−1,0,𝜑)
    // (−1,0,−𝜑)
    // (1,0,−𝜑)

    // (0,𝜑,1)
    // (0,𝜑,−1)
    // (0,−𝜑,−1)
    // (0,−𝜑,1)
    // const [points, setPoints] = React.useState<Point3D[]>([
    //     { x: 1, y: smallGold, z: 0 },
    //     { x: 1, y: -smallGold, z: 0 },
    //     { x: -1, y: -smallGold, z: 0 },
    //     { x: -1, y: smallGold, z: 0 },

    //     { x: smallGold, y: 0, z: 1 },
    //     { x: -smallGold, y: 0, z: 1 },
    //     { x: -smallGold, y: 0, z: -1 },
    //     { x: smallGold, y: 0, z: -1 },

    //     { x: 0, y: 1, z: smallGold },
    //     { x: 0, y: 1, z: -smallGold },
    //     { x: 0, y: -1, z: -smallGold },
    //     { x: 0, y: -1, z: smallGold },
    // ]);
    const { points, setPoints, lines, setLines } = props;


    // const depthSortedPoints: Point3D[] = React.useMemo(() => {
    //     const pointsCopy = [...points];
    //     pointsCopy.sort((a, b) =>
    //         b.z - a.z
    //     );
    //     return pointsCopy;
    // }, [points]);

    // const [lines, setLines] = React.useState<WireframeLine[]>([
    //     { start: 0, end: 1 },
    //     { start: 1, end: 4 },
    //     { start: 4, end: 0 },
    //     { start: 0, end: 7 },
    //     { start: 1, end: 7 },

    //     { start: 2, end: 5 },
    //     { start: 2, end: 3 },
    //     { start: 2, end: 6 },
    //     { start: 3, end: 5 },
    //     { start: 3, end: 6 },

    //     { start: 8, end: 9 },
    //     { start: 8, end: 3 },
    //     { start: 3, end: 9 },
    //     { start: 8, end: 4 },
    //     { start: 8, end: 0 },

    //     { start: 10, end: 11 },
    //     { start: 10, end: 1 },
    //     { start: 10, end: 7 },
    //     { start: 11, end: 1 },
    //     { start: 4, end: 11 },
    //     { start: 8, end: 5 },
    //     { start: 9, end: 0 },
    //     { start: 10, end: 6 },
    //     { start: 6, end: 7 },
    //     { start: 2, end: 10 },
    //     { start: 2, end: 11 },
    //     { start: 5, end: 11 },
    //     { start: 4, end: 5 },
    //     { start: 7, end: 9 },
    //     { start: 6, end: 9 },

    //     // { start: 7, end: 6 },
    //     // { start: 7, end: 11 },
    //     // { start: 11, end: 6 },
    //     // { start: 4, end: 5 },
    //     // { start: 4, end: 10 },
    //     // { start: 10, end: 5 },
    // ]);

    // const depthSortedLines: WireframeLine[] = React.useMemo(() => {
    //     const linesCopy = [...lines];
    //     linesCopy.sort((a, b) => {
    //         const aStartZ = isNumber(a.start) ?
    //             points[a.start].z :
    //             a.start.z;
    //         const aEndZ = isNumber(a.end) ?
    //             points[a.end].z :
    //             a.end.z;
    //         const bStartZ = isNumber(b.start) ?
    //             points[b.start].z :
    //             b.start.z;
    //         const bEndZ = isNumber(b.end) ?
    //             points[b.end].z :
    //             b.end.z;
    //         return (bStartZ + bEndZ) - (aStartZ + aEndZ);
    //     }
    //     );
    //     return linesCopy;
    // }, [lines, points]);

    const scaleFactor = props.width / 2;
    const isOrthographic = false;

    const getLoc2D = React.useCallback((point: Point3D) => {
        const pointRedistanced: Point3D = { x: point.x, y: point.y, z: point.z + zDist }
        return scale2D(isOrthographic ?
            orthographicProjection(pointRedistanced) :
            perspectiveProjection(pointRedistanced, zDist)
            , scaleFactor);
    }, [isOrthographic, scaleFactor]);

    const pointLocs = React.useMemo(() => {
        return points.map(point => getLoc2D(point.location3D));
    }, [getLoc2D, points]);

    const [centerpoint, farthestZ, nearestZ] = React.useMemo(() => {
        let xTotal = 0;
        let yTotal = 0;
        let zTotal = 0;
        let farthestZ = -1;
        let nearestZ = -1;
        points.forEach(point => {
            const p = point.location3D
            xTotal += p.x;
            yTotal += p.y;
            zTotal += p.z;
            if (p.z > farthestZ || farthestZ === -1) {
                farthestZ = p.z;
            }
            if (p.z < nearestZ || nearestZ === -1) {
                nearestZ = p.z;
            }
        });
        return [{ x: xTotal / points.length, y: yTotal / points.length, z: zTotal / points.length }, farthestZ, nearestZ];
    }, [points]);

    // const [dragStart, setDragStart] = React.useState<Vector2d | null>(null);
    // const [pointsWhenDragStart, setPointsWhenDragStart] = React.useState<Point3D[] | null>(null);

    const dragStart = React.useRef<Vector2d | null>(null);
    const pointsWhenDragStart = React.useRef<WireframePoint[] | null>(null);

    const onDragStart = React.useCallback((e: KonvaEventObject<DragEvent>) => {
        console.log("drag start");
        // setDragStart(e.currentTarget.position());
        // setPointsWhenDragStart(points);
        dragStart.current = e.currentTarget.position();
        pointsWhenDragStart.current = points;
        console.log("drag start done");
    }, [points]);

    const onDrag = React.useCallback((e: KonvaEventObject<DragEvent>) => {
        console.log("drag");
        setPoints(_ => pointsWhenDragStart.current!.map((p, idx) => {
            const angleX = (e.currentTarget.y() - (dragStart.current?.y ?? 0)) / props.height;
            console.log("angleX", angleX)
            const angleY = (e.currentTarget.x() - (dragStart.current?.x ?? 0)) / props.width;
            return { ...p, location3D: rotateY(rotateX(p.location3D, angleX, centerpoint), angleY, centerpoint) };
        }))
        console.log("drag end");
    }, [centerpoint, props.height, props.width, setPoints]);

    const onDragEnd = React.useCallback((e: KonvaEventObject<DragEvent>) => {
        console.log("drag complete");
        e.currentTarget.x(dragStart.current?.x ?? -props.width / 2);
        e.currentTarget.y(dragStart.current?.y ?? -props.height / 2);
        // setDragStart(null);
        // setPointsWhenDragStart(null);
        dragStart.current = null;
        pointsWhenDragStart.current = null;
        console.log("drag complete end");
    }, [props.height, props.width]);

    const dragRect = React.useMemo(() => (
        <Rect draggable opacity={0} width={props.width} height={props.height} x={-props.width / 2} y={-props.height / 2}
            onDragStart={onDragStart}
            onDragMove={onDrag}
            onDragEnd={onDragEnd}
        ></Rect>
    ), [onDrag, onDragEnd, onDragStart, props.height, props.width]);

    const lastTime = React.useRef<number>(Date.now());

    const rotateWireframe = React.useCallback(() => {
        // Only auto-rotate if not being dragged
        // console.log("eg dragstart current", dragStart.current);
        if (dragStart.current === null) {
            const deltaT = (Date.now() - lastTime.current) / 1000;
            lastTime.current = Date.now();
            // setPoints(oldPoints => oldPoints.map(p => (rotateZ(rotateY(rotateX(p, deltaT / (bigGold * 2), centerpoint), deltaT / 2, centerpoint), deltaT / 4, centerpoint))));
            setPoints(oldPoints => oldPoints.map(p => ({ ...p, location3D: rotateZ(rotateY(rotateX(p.location3D, deltaT * (props.autoRotateVector?.x ?? 0), centerpoint), deltaT * (props.autoRotateVector?.y ?? 0), centerpoint), deltaT * (props.autoRotateVector?.z ?? 0), centerpoint) })));
        }
        setTimeout(() => {
            rotateWireframe();
        }, 30);
    }, [centerpoint, props.autoRotateVector?.x, props.autoRotateVector?.y, props.autoRotateVector?.z, setPoints]);

    React.useEffect(() => {
        rotateWireframe();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    type SortableDisplayElem = {
        elem: React.JSX.Element;
        zIdx: number;
    }

    const lineElems: SortableDisplayElem[] = React.useMemo(() => {
        return lines.map((line) => {
            const start = isNumber(line.start) ?
                pointLocs[line.start] :
                getLoc2D(line.start);
            const end = isNumber(line.end) ?
                pointLocs[line.end] :
                getLoc2D(line.end);
            const start3D = isNumber(line.start) ?
                points[line.start].location3D :
                line.start;
            const end3D = isNumber(line.end) ?
                points[line.end].location3D :
                line.end;

            const startDimRatio = ((start3D.z - nearestZ) / (farthestZ - nearestZ)) * fogEffect;
            const startFadedColor = fadeColors(line.color ?? colorPalette.Widget_Primary, colorPalette.Main_Background, startDimRatio);
            const endDimRatio = ((end3D.z - nearestZ) / (farthestZ - nearestZ)) * fogEffect;
            const endFadedColor = fadeColors(line.color ?? colorPalette.Widget_Primary, colorPalette.Main_Background, endDimRatio);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            var gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            gradient.addColorStop(0, startFadedColor);
            gradient.addColorStop(1, endFadedColor);

            // console.log("line props", line.lineProps);
            return {
                elem:
                    <Line
                        points={[
                            start.x, start.y,
                            end.x, end.y,
                        ]}
                        stroke={gradient}
                        strokegradient={gradient}
                        strokeWidth={LINE_WIDTH}
                        {...line.lineProps}
                    />,
                zIdx: (start3D.z + end3D.z) / 2,
            }
        });
    }, [colorPalette.Main_Background, colorPalette.Widget_Primary, farthestZ, getLoc2D, lines, nearestZ, pointLocs, points]);

    const pointElems: SortableDisplayElem[] = React.useMemo(() => {
        return points.map((point, idx) => {
            const dimRatio = ((point.location3D.z - nearestZ) / (farthestZ - nearestZ)) * fogEffect;
            const fadedColor = fadeColors(point.color ?? colorPalette.Note_Active, colorPalette.Main_Background, dimRatio);
            const pointLoc = getLoc2D(point.location3D);
            // console.log("point props", point.circleProps);
            const returnElem: SortableDisplayElem = {
                elem:
                    <Group>
                        <Circle
                            x={pointLoc.x}
                            y={pointLoc.y}
                            // stroke={colorPalette.Widget_Primary}
                            strokeWidth={LINE_WIDTH}
                            // radius={props.width / 2}
                            radius={5}
                            fill={fadedColor}
                            // fill={colorPalette.Widget_Primary}
                            opacity={1}
                            // filters={[Konva.Filters.Blur]}
                            // filterBlurRadius={5}
                            // fill={"yellow"}
                            {...point.circleProps}
                        />
                        <Text
                            x={pointLoc.x}
                            y={pointLoc.y}
                            // text={`${Math.trunc(point.z * 100)}`}
                            stroke={"white"}
                            strokeWidth={LINE_WIDTH}
                            // radius={props.width / 2}
                            radius={5}
                        // fill={"yellow"}
                        />
                    </Group>,
                zIdx: point.location3D.z - 0.75,
            };
            return returnElem;
        })
    }, [colorPalette.Main_Background, colorPalette.Note_Active, farthestZ, getLoc2D, nearestZ, points]);

    const sortedElems = React.useMemo(() => {
        const elems = [...lineElems, ...pointElems];
        elems.sort((a, b) => b.zIdx - a.zIdx);
        return elems.map(elem => elem.elem);
    }, [lineElems, pointElems]);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group y={props.height / 2} x={props.width / 2}
                clipFunc={props.containBoundaries ? (ctx) => ctx.rect(-props.width / 2, -props.height / 2, props.width, props.height) : undefined
                }
            >
                {/* {lineElems}
                {pointElems.map((elem) => elem.elem)} */}
                {sortedElems}
                {dragRect}
            </Group >
        );
    }, [dragRect, props.containBoundaries, props.height, props.width, sortedElems]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={settingsMenuItems} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export default Wireframe;