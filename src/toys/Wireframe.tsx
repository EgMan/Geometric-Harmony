import React from "react";
import { WidgetComponentProps } from "../view/Widget";
import { Circle, Group, Line, Rect, Text } from "react-konva";
import SettingsMenuOverlay from "../view/SettingsMenuOverlay";
import { Point3D, add, invert, multiply, orthographicProjection, perspectiveProjection, rotateX, rotateY, rotateZ, scale2D, scale2Dflat } from "../utils/Utils3D";
import { useAppTheme } from "../view/ThemeManager";
import { Height } from "@mui/icons-material";
import { KonvaEventObject } from "konva/lib/Node";
import { Vector2d } from "konva/lib/types";
import { isNumber } from "tone";
import { Unstable_NumberInput as NumberInput } from '@mui/base/Unstable_NumberInput';
import { bigGold, blendColors, fadeColors, smallGold } from "../utils/Utils";
import Konva from "konva";
import zIndex from "@mui/material/styles/zIndex";
import Quaternion from "quaternion";

const LINE_WIDTH = 1;
// const zDist = 9;
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
    outlineColor?: string,
    circleProps?: React.ComponentProps<typeof Circle>
    text?: string
    textProps?: React.ComponentProps<typeof Text>
}

type Props = {
    width: number,
    height: number,
    points: WireframePoint[],
    center?: Point3D,
    containBoundaries?: boolean | undefined,
    autoRotateVector?: Point3D | undefined,
    lines: WireframeLine[],
    isOrthographic: boolean,
    initialOrientation?: Quaternion,
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

    const { lines } = props;
    const pointsRaw = props.points;

    const [orientation, setOrientation] = React.useState<Quaternion>(props.initialOrientation ?? new Quaternion());


    const scaleFactor = props.width / 2;

    const centerPoint = React.useMemo(() => props.center ?? multiply(pointsRaw.reduce((prev, point) => add(prev, point.location3D), { x: 0, y: 0, z: 0 }), 1 / pointsRaw.length), [pointsRaw, props.center]);

    const points: WireframePoint[] = React.useMemo(() =>
        pointsRaw.map(point => {
            const vect = orientation.rotateVector([point.location3D.x - centerPoint.x, point.location3D.y - centerPoint.y, point.location3D.z - centerPoint.z])
            return { ...point, location3D: { x: vect[0] + centerPoint.x, y: vect[1] + centerPoint.y, z: vect[2] + centerPoint.z } }
        })
        , [centerPoint.x, centerPoint.y, centerPoint.z, orientation, pointsRaw]);
    const [farthestZ, nearestZ] = React.useMemo(() => {
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
        return [farthestZ, nearestZ];
    }, [points]);


    const getLoc2D = React.useCallback((point: Point3D) => {
        const pointRedistanced: Point3D = { x: point.x, y: point.y, z: point.z + zDist };
        return scale2D(props.isOrthographic ?
            orthographicProjection(pointRedistanced) :
            perspectiveProjection(pointRedistanced, zDist)
            , scaleFactor);
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
    }, [props.isOrthographic, scaleFactor]);

    const pointLocs = React.useMemo(() => {
        return points.map(point => getLoc2D(point.location3D));
    }, [getLoc2D, points]);

    // const [dragStart, setDragStart] = React.useState<Vector2d | null>(null);
    // const [pointsWhenDragStart, setPointsWhenDragStart] = React.useState<Point3D[] | null>(null);

    const dragStart = React.useRef<Vector2d | null>(null);
    const orientationWhenDragStart = React.useRef<Quaternion | null>(null);

    const onDragStart = React.useCallback((e: KonvaEventObject<DragEvent>) => {
        dragStart.current = e.currentTarget.position();
        orientationWhenDragStart.current = orientation;
    }, [orientation]);

    const onDrag = React.useCallback((e: KonvaEventObject<DragEvent>) => {
        setOrientation(_ => {
            const angleX = (e.currentTarget.y() - (dragStart.current?.y ?? 0)) / props.height;
            const angleY = (e.currentTarget.x() - (dragStart.current?.x ?? 0)) / props.width;
            return Quaternion.fromEuler(
                0,
                angleX,
                -angleY,
            ).mul(orientationWhenDragStart.current!);
        });
    }, [props.height, props.width]);

    const onDragEnd = React.useCallback((e: KonvaEventObject<DragEvent>) => {
        e.currentTarget.x(dragStart.current?.x ?? -props.width / 2);
        e.currentTarget.y(dragStart.current?.y ?? -props.height / 2);
        dragStart.current = null;
        orientationWhenDragStart.current = null;
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
        if (dragStart.current === null) {
            const deltaT = (Date.now() - lastTime.current) / 1000;
            lastTime.current = Date.now();
            setOrientation(oldOrientation =>
                oldOrientation.mul(
                    Quaternion.fromEuler(
                        deltaT * (props.autoRotateVector?.x ?? 0),
                        deltaT * (props.autoRotateVector?.y ?? 0),
                        deltaT * (props.autoRotateVector?.z ?? 0)),
                )
            );
        }
        setTimeout(() => {
            rotateWireframe();
        }, 30);
    }, [props.autoRotateVector?.x, props.autoRotateVector?.y, props.autoRotateVector?.z]);

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
            const fadedOutlineColor = point.outlineColor && fadeColors(point.outlineColor, colorPalette.Main_Background, dimRatio);
            const pointLoc = getLoc2D(point.location3D);
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
                            stroke={fadedOutlineColor}
                            {...point.circleProps}
                        />
                        {point.text &&
                            <Text
                                x={pointLoc.x}
                                y={pointLoc.y}
                                // text={`${Math.trunc(point.z * 100)}`}
                                text={point.text}
                                stroke={"white"}
                                strokeWidth={LINE_WIDTH}
                                radius={5}
                                {...point.textProps}
                            />
                        }
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