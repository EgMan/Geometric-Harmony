import React from 'react';
import { Circle, Line, Rect } from 'react-konva';
import { useActiveNotes, useEmphasizedNotes, useSetAreNotesActive, useSetAreNotesEmphasized } from './NoteProvider';

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

    const activeNotes = useActiveNotes();
    const setAreNotesActive = useSetAreNotesActive();

    const emphasizedNotes = useEmphasizedNotes();
    const setAreNotesEmphasized = useSetAreNotesEmphasized();

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
            if(activeNotes.has(1))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(1))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([1], !activeNotes.has(1))}  onTap={()=>setAreNotesActive([1], !activeNotes.has(1))} onMouseEnter={()=>setAreNotesEmphasized([1], true, true)} onMouseLeave={()=>setAreNotesEmphasized([1], false)}></Rect>)

            // D#
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(activeNotes.has(3))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(3))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([3], !activeNotes.has(3))} onTap={()=>setAreNotesActive([3], !activeNotes.has(3))} onMouseEnter={()=>setAreNotesEmphasized([3], true, true)} onMouseLeave={()=>setAreNotesEmphasized([3], false)}></Rect>)

            // F#
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(activeNotes.has(6))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(6))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([6], !activeNotes.has(6))} onTap={()=>setAreNotesActive([6], !activeNotes.has(6))} onMouseEnter={()=>setAreNotesEmphasized([6], true, true)} onMouseLeave={()=>setAreNotesEmphasized([6], false)}></Rect>)

            // G#
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(activeNotes.has(8))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(8))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([8], !activeNotes.has(8))} onTap={()=>setAreNotesActive([8], !activeNotes.has(8))} onMouseEnter={()=>setAreNotesEmphasized([8], true, true)} onMouseLeave={()=>setAreNotesEmphasized([8], false)}></Rect>)

            // A#
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} fill={keyColor}></Rect>)
            if(activeNotes.has(10))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(10))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([10], !activeNotes.has(10))} onTap={()=>setAreNotesActive([10], !activeNotes.has(10))} onMouseEnter={()=>setAreNotesEmphasized([10], true, true)} onMouseLeave={()=>setAreNotesEmphasized([10], false)}></Rect>)
        }
        return keys;
    }, [props.octaveCount, props.width, props.height, props.x, props.y, activeNotes]);
    
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
            if(activeNotes.has(0))keys.push(<Circle x={individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(0))keys.push(<Circle x={individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([0], !activeNotes.has(0))} onMouseEnter={()=>setAreNotesEmphasized([0], true, true)} onTap={()=>setAreNotesActive([0], !activeNotes.has(0))} onMouseLeave={()=>setAreNotesEmphasized([0], false)}></Rect>)

            // D
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(activeNotes.has(2))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(2))keys.push(<Circle x={props.width/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([2], !activeNotes.has(2))} onMouseEnter={()=>setAreNotesEmphasized([2], true, true)} onTap={()=>setAreNotesActive([2], !activeNotes.has(2))} onMouseLeave={()=>setAreNotesEmphasized([2], false)}></Rect>)

            // E
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(activeNotes.has(4))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(4))keys.push(<Circle x={props.width*2/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*2/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([4], !activeNotes.has(4))} onMouseEnter={()=>setAreNotesEmphasized([4], true, true)} onTap={()=>setAreNotesActive([4], !activeNotes.has(4))} onMouseLeave={()=>setAreNotesEmphasized([4], false)}></Rect>)

            // F
            keys.push(<Rect x={props.width*3/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(activeNotes.has(5))keys.push(<Circle x={props.width*3/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(5))keys.push(<Circle x={props.width*3/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*3/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([5], !activeNotes.has(5))} onMouseEnter={()=>setAreNotesEmphasized([5], true, true)} onTap={()=>setAreNotesActive([5], !activeNotes.has(5))} onMouseLeave={()=>setAreNotesEmphasized([5], false)}></Rect>)

            // G
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(activeNotes.has(7))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(7))keys.push(<Circle x={props.width*4/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*4/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([7], !activeNotes.has(7))} onMouseEnter={()=>setAreNotesEmphasized([7], true, true)} onTap={()=>setAreNotesActive([7], !activeNotes.has(7))} onMouseLeave={()=>setAreNotesEmphasized([7], false)}></Rect>)

            // A
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(activeNotes.has(9))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(9))keys.push(<Circle x={props.width*5/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*5/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([9], !activeNotes.has(9))} onMouseEnter={()=>setAreNotesEmphasized([9], true, true)} onTap={()=>setAreNotesActive([9], !activeNotes.has(9))} onMouseLeave={()=>setAreNotesEmphasized([9], false)}></Rect>)

            // B
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} stroke={keyColor} strokeWidth={outlineThickness}></Rect>)
            if(activeNotes.has(11))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"white"}></Circle>)
            if(emphasizedNotes.has(11))keys.push(<Circle x={props.width*6/7 + individualActiveIndicaterOffset} y={activeIndicatorY} width={activeIndicatorWidth} height={activeIndicatorWidth} fill={"red"}></Circle>)
            keys.push(<Rect x={props.width*6/7 + individualKeyOffset} y={YglobalKeyOffset} width={keyWidth} height={keyHeight} onClick={()=>setAreNotesActive([11], !activeNotes.has(11))} onMouseEnter={()=>setAreNotesEmphasized([11], true, true)} onTap={()=>setAreNotesActive([11], !activeNotes.has(11))} onMouseLeave={()=>setAreNotesEmphasized([11], false)}></Rect>)
        }
        return keys;
    }, [props.octaveCount, props.width, props.height, props.x, props.y, activeNotes]);
    return (
        <div>
            {whiteKeys}
            {blackKeys}
        </div>
    )
}

export default Piano;