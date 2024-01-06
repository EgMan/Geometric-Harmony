import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import { Point3D } from '../graphics3D/Engine3D';
import { smallGold } from '../utils/Utils';
import Wireframe, { WireframeLine, WireframePoint } from './Wireframe';

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

function Icosahedron(props: Props) {
    const [points, setPoints] = React.useState<WireframePoint[]>([
        { location3D: { x: 1, y: smallGold, z: 0 } },
        { location3D: { x: 1, y: -smallGold, z: 0 } },
        { location3D: { x: -1, y: -smallGold, z: 0 } },
        { location3D: { x: -1, y: smallGold, z: 0 } },

        { location3D: { x: smallGold, y: 0, z: 1 } },
        { location3D: { x: -smallGold, y: 0, z: 1 } },
        { location3D: { x: -smallGold, y: 0, z: -1 } },
        { location3D: { x: smallGold, y: 0, z: -1 } },

        { location3D: { x: 0, y: 1, z: smallGold } },
        { location3D: { x: 0, y: 1, z: -smallGold } },
        { location3D: { x: 0, y: -1, z: -smallGold } },
        { location3D: { x: 0, y: -1, z: smallGold } },
    ]);

    const [lines, setLines] = React.useState<WireframeLine[]>([
        { start: 0, end: 1 },
        { start: 1, end: 4 },
        { start: 4, end: 0 },
        { start: 0, end: 7 },
        { start: 1, end: 7 },
        { start: 2, end: 5 },
        { start: 2, end: 3 },
        { start: 2, end: 6 },
        { start: 3, end: 5 },
        { start: 3, end: 6 },
        { start: 8, end: 9 },
        { start: 8, end: 3 },
        { start: 3, end: 9 },
        { start: 8, end: 4 },
        { start: 8, end: 0 },
        { start: 10, end: 11 },
        { start: 10, end: 1 },
        { start: 10, end: 7 },
        { start: 11, end: 1 },
        { start: 4, end: 11 },
        { start: 8, end: 5 },
        { start: 9, end: 0 },
        { start: 10, end: 6 },
        { start: 6, end: 7 },
        { start: 2, end: 10 },
        { start: 2, end: 11 },
        { start: 5, end: 11 },
        { start: 4, end: 5 },
        { start: 7, end: 9 },
        { start: 6, end: 9 },
    ]);

    // setPoints(oldPoints => oldPoints.map(p => (rotateZ(rotateY(rotateX(p, deltaT / (bigGold * 2), centerpoint), deltaT / 2, centerpoint), deltaT / 4, centerpoint))));
    return (
        <Wireframe
            points={points}
            setPoints={setPoints}
            lines={lines}
            setLines={setLines}
            autoRotateVector={{ x: smallGold / 2, y: 0.5, z: 0.25 }}
            {...props}
        />
    );
}

export default Icosahedron;