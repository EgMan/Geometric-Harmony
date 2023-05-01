import React, { createContext, useState } from 'react';
import { Stage } from 'react-konva';
import Konva from 'konva';

interface StageWithIntersectionProvider {
    intersectedShape: Konva.Shape | null;
}
const defaultValue: StageWithIntersectionProvider = { intersectedShape: null };

const mouseIntersectionContext = createContext<StageWithIntersectionProvider>(
    defaultValue
);

type Props = React.ComponentProps<typeof Stage> & {
    children: JSX.Element
};

// export const MouseIntersectionProvider: React.FC = ({ children }) => {
function StageWithIntersectionProvider({ children, ...stageProps }: Props) {
    const [intersectedShape, setIntersectedShape] = useState<Konva.Shape | null>(null);

    const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
        // const shapes = e.target.getStage()?.find('.intersectable');
        // const intersected = shapes?.filter(
        //     shape =>
        //         shape.getAttr('checkIntersection') && shape.intersects(e.evt)
        // ) as Konva.Shape[];
        // setIntersectedShapes(intersected);

        // const stage = e.target.getStage();
        // if (!stage) return;
        // const pointerPos = stage.getPointerPosition();
        // if (pointerPos) {
        //     const shapes = stage.find('.intersectable');
        //     const intersected = shapes.filter(
        //         shape =>
        //             shape.getAttr('checkIntersection') &&
        //             shape.intersects(pointerPos)
        //     ) as Konva.Shape[];
        //     setIntersectedShapes(intersected);
        // }

        if (stageProps.onMouseMove) stageProps.onMouseMove(e);
        const stage = e.target.getStage();
        if (!stage) return;
        const pointerPos = stage.getPointerPosition();
        if (pointerPos) {
            const shape = stage.getIntersection(pointerPos);
            if (shape && shape.getAttr('checkIntersection')) {
                setIntersectedShape(shape);
            } else {
                setIntersectedShape(null);
            }
        }
    };

    return (
        <mouseIntersectionContext.Provider value={{ intersectedShape }}>
            <Stage {...stageProps} onMouseMove={handleMouseMove}>
                {children}
            </Stage>
        </mouseIntersectionContext.Provider>
    );
};

export default StageWithIntersectionProvider;

export function useMouseIntersection() {
    return React.useContext(mouseIntersectionContext);
}