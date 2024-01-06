import LinAlg from 'vectorious';

export type Point3D = {x: number, y: number, z: number};
export type Point2D = {x: number, y: number};

export function orthographicProjection(point: Point3D): Point2D {
    return {x: point.x, y: point.y};
}

export function orthographicProjectionFlat(point: Point3D, distance: number): [number, number] {
    return [point.x, point.y];
}

export function perspectiveProjection(point: Point3D, distance: number): Point2D {
    return {x: point.x * distance / point.z, y: point.y * distance / point.z};
}

export function perspectiveProjectionFlat(point: Point3D, distance: number): [number, number] {
    return [point.x * distance / point.z, point.y * distance / point.z];
}

export function scale3D(point: Point3D, scale: number): Point3D {
    return {x: point.x * scale, y: point.y * scale, z: point.z * scale};
}   

export function scale2Dflat(point: Point2D, scale: number): number[] {
    return [point.x * scale, point.y * scale];
}   

export function scale2D(point: Point2D, scale: number): Point2D {
    return {x: point.x * scale, y: point.y * scale};
}   


// export function rotateX(point: Point3D, angle: number): Point3D {
//     const sin = Math.sin(angle);
//     const cos = Math.cos(angle);
//     return {
//         x: point.x,
//         y: point.y * cos - point.z * sin,
//         z: point.y * sin + point.z * cos
//     };
// }

export function rotateX(point: Point3D, angle: number, center: Point3D = {x: 0, y:0, z:0}): Point3D {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const y = point.y - center.y;
    const z = point.z - center.z;
    return {
        x: point.x,
        y: y * cos - z * sin + center.y,
        z: y * sin + z * cos + center.z
    };
}

export function rotateY(point: Point3D, angle: number, center: Point3D = {x: 0, y:0, z:0}): Point3D {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const x = point.x - center.x;
    const z = point.z - center.z;
    return {
        x: x * cos - z * sin + center.x,
        y: point.y,
        z: x * sin + z * cos + center.z
    };
}

export function rotateZ(point: Point3D, angle: number, center: Point3D = {x: 0, y:0, z:0}): Point3D {
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);
    const x = point.x - center.x;
    const y = point.y - center.y;
    return {
        x: x * cos - y * sin + center.x,
        y: x * sin + y * cos + center.y,
        z: point.z
    };
}