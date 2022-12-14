import React from 'react';
import { Circle, Line, Rect } from 'react-konva';

const keyColor = "grey";

type Props = {
    x: number
    y: number
    height: number
    width: number
    octaveCount: number
}

function Piano(props: Props) {
    // offsets to make x, y in props dictate location of bottom center of full piano
    const XglobalKeyOffset = props.x + (props.width * props.octaveCount / -2);
    const YglobalKeyOffset = props.y - props.height;

    const blackKeys: JSX.Element[] = React.useMemo(() => {
        var keys = [];
        for (var i = 0; i < props.octaveCount; i++)
        {
            const individualKeyOffset = XglobalKeyOffset + i*props.width - props.width/24 + 1;
            const keyWidth = props.width/14;
            const keyHeight = props.height*2/3;
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
        }
        return keys;
    }, [props.octaveCount, props.width, props.height, props.x, props.y]);
    
    const whiteKeys: JSX.Element[] = React.useMemo(() => {
        var keys = [];
        for (var i = 0; i < props.octaveCount; i++)
        {
            const individualKeyOffset = XglobalKeyOffset + i*props.width;
            const keyWidth = props.width/7;
            const keyHeight = props.height;
            const outlineThickness = 2;
            keys.push(<Rect x={individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor}></Rect>)
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            keys.push(<Rect x={props.width*3/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
        }
        return keys;
    }, [props.octaveCount, props.width, props.height, props.x, props.y]);
    return (
        <div>
            {blackKeys}
            {whiteKeys}
        </div>
    )
}

export default Piano;