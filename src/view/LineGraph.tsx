import React from 'react';
import { Line } from 'react-konva';
import { useAppTheme } from './ThemeManager';

type Props = {
    width: number
    height: number
    maxVal: number
    minVal: number
    values: number[]
    lineProps?: React.ComponentProps<typeof Line>
};

function LineGraph(props: Props) {
    const valRange = props.maxVal - props.minVal;
    const medVal = (props.minVal + props.maxVal) / 2;
    const { colorPalette } = useAppTheme()!;

    const points = React.useMemo(() => {
        return props.values.map((val, idx) => {
            const x = idx * props.width / props.values.length;
            const y = -((val - medVal) * props.height / valRange);
            return [x, y];
        }).reduce((prev, point) => prev.concat(point), []);
    }, [medVal, props.height, props.values, props.width, valRange]);

    return <Line
        points={points}
        stroke={colorPalette.Widget_MutedPrimary}
        opacity={1}
        strokeWidth={3}
        {...props.lineProps}
    />
}

export default LineGraph;