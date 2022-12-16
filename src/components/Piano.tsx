import React from 'react';
import { Circle, Line, Rect } from 'react-konva';
import { useIsNoteActive, useIsNoteEmphasized, useSetIsNoteActive, useSetIsNoteEmphasized } from './NoteContext';

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

    const isNoteActive = useIsNoteActive();
    const setIsNoteActive = useSetIsNoteActive();

    const isNoteEmphasized = useIsNoteEmphasized();
    const setIsNoteEmphasized = useSetIsNoteEmphasized();

    const blackKeys: JSX.Element[] = React.useMemo(() => {
        var keys = [];
        for (var i = 0; i < props.octaveCount; i++)
        {
            const individualKeyOffset = XglobalKeyOffset + i*props.width - props.width/24 + 1;
            const keyWidth = props.width/14;
            const keyHeight = props.height*2/3;
            const individualActiveIndicaterOffset = individualKeyOffset + (keyWidth/2);
            const activeIndicatorWidth = keyWidth * 2 / 3;
            const activeIndicatorY = YglobalKeyOffset + 3*keyHeight/4;

            // C#
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(isNoteActive(1))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(1))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(1, !isNoteActive(1))}  onTap={()=>setIsNoteActive(1, !isNoteActive(1))} onMouseEnter={()=>setIsNoteEmphasized(1, true, true)} onMouseLeave={()=>setIsNoteEmphasized(1, false)}></Rect>)

            // D#
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(isNoteActive(3))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(3))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(3, !isNoteActive(3))} onTap={()=>setIsNoteActive(3, !isNoteActive(3))} onMouseEnter={()=>setIsNoteEmphasized(3, true, true)} onMouseLeave={()=>setIsNoteEmphasized(3, false)}></Rect>)

            // F#
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(isNoteActive(6))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(6))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(6, !isNoteActive(6))} onTap={()=>setIsNoteActive(6, !isNoteActive(6))} onMouseEnter={()=>setIsNoteEmphasized(6, true, true)} onMouseLeave={()=>setIsNoteEmphasized(6, false)}></Rect>)

            // G#
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(isNoteActive(8))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(8))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(8, !isNoteActive(8))} onTap={()=>setIsNoteActive(8, !isNoteActive(8))} onMouseEnter={()=>setIsNoteEmphasized(8, true, true)} onMouseLeave={()=>setIsNoteEmphasized(8, false)}></Rect>)

            // A#
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(isNoteActive(10))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(10))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(10, !isNoteActive(10))} onTap={()=>setIsNoteActive(10, !isNoteActive(10))} onMouseEnter={()=>setIsNoteEmphasized(10, true, true)} onMouseLeave={()=>setIsNoteEmphasized(10, false)}></Rect>)
        }
        return keys;
    }, [props.octaveCount, props.width, props.height, props.x, props.y, isNoteActive]);
    
    const whiteKeys: JSX.Element[] = React.useMemo(() => {
        var keys = [];
        for (var i = 0; i < props.octaveCount; i++)
        {
            const individualKeyOffset = XglobalKeyOffset + i*props.width;
            const keyWidth = props.width/7;
            const keyHeight = props.height;
            const outlineThickness = 2;
            const individualActiveIndicaterOffset = individualKeyOffset + (keyWidth/2);
            const activeIndicatorWidth = keyWidth / 3;
            const activeIndicatorY = YglobalKeyOffset + 5*keyHeight/6;

            // C
            keys.push(<Rect x={individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor}></Rect>)
            if(isNoteActive(0))keys.push(<Circle x={individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(0))keys.push(<Circle x={individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(0, !isNoteActive(0))} onMouseEnter={()=>setIsNoteEmphasized(0, true, true)} onTap={()=>setIsNoteActive(0, !isNoteActive(0))} onMouseLeave={()=>setIsNoteEmphasized(0, false)}></Rect>)

            // D
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(isNoteActive(2))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(2))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(2, !isNoteActive(2))} onMouseEnter={()=>setIsNoteEmphasized(2, true, true)} onTap={()=>setIsNoteActive(2, !isNoteActive(2))} onMouseLeave={()=>setIsNoteEmphasized(2, false)}></Rect>)

            // E
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(isNoteActive(4))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(4))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(4, !isNoteActive(4))} onMouseEnter={()=>setIsNoteEmphasized(4, true, true)} onTap={()=>setIsNoteActive(4, !isNoteActive(4))} onMouseLeave={()=>setIsNoteEmphasized(4, false)}></Rect>)

            // F
            keys.push(<Rect x={props.width*3/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(isNoteActive(5))keys.push(<Circle x={props.width*3/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(5))keys.push(<Circle x={props.width*3/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*3/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(5, !isNoteActive(5))} onMouseEnter={()=>setIsNoteEmphasized(5, true, true)} onTap={()=>setIsNoteActive(5, !isNoteActive(5))} onMouseLeave={()=>setIsNoteEmphasized(5, false)}></Rect>)

            // G
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(isNoteActive(7))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(7))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(7, !isNoteActive(7))} onMouseEnter={()=>setIsNoteEmphasized(7, true, true)} onTap={()=>setIsNoteActive(7, !isNoteActive(7))} onMouseLeave={()=>setIsNoteEmphasized(7, false)}></Rect>)

            // A
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(isNoteActive(9))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(9))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(9, !isNoteActive(9))} onMouseEnter={()=>setIsNoteEmphasized(9, true, true)} onTap={()=>setIsNoteActive(9, !isNoteActive(9))} onMouseLeave={()=>setIsNoteEmphasized(9, false)}></Rect>)

            // B
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(isNoteActive(11))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(isNoteEmphasized(11))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setIsNoteActive(11, !isNoteActive(11))} onMouseEnter={()=>setIsNoteEmphasized(11, true, true)} onTap={()=>setIsNoteActive(11, !isNoteActive(11))} onMouseLeave={()=>setIsNoteEmphasized(11, false)}></Rect>)
        }
        return keys;
    }, [props.octaveCount, props.width, props.height, props.x, props.y, isNoteActive]);
    return (
        <div>
            {whiteKeys}
            {blackKeys}
        </div>
    )
}

export default Piano;