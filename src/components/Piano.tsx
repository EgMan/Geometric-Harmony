import React from 'react';
import { Circle, Rect } from 'react-konva';
import { useActiveNotes, useEmphasizedNotes, useSetAreNotesActive, useSetAreNotesEmphasized } from './NoteProvider';
import Widget from './Widget';
import { MenuItem, Select } from '@mui/material';

const keyColor = "grey";
const noteToXOffsetFactor = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];
const blackKeyNums = [1, 3, 6, 8, 10];
const whiteKeyNums = [0, 2, 4, 5, 7, 9, 11];

type Props = {
    x: number
    y: number
    height: number
    width: number
    octaveCount: number
}

function Piano(props: Props) {

    const [octaveCount, setOctaveCount] = React.useState(props.octaveCount);

    const settingsMenuItems = [
        (<tr>
            <td>OctaveCount</td>
            <td>  <Select
                id="menu-dropdown"
                value={octaveCount}
                label="Octave Count"
                labelId="demo-simple-select-filled-label"
                onChange={e => { setOctaveCount(e.target.value as number) }}
            >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>

            </Select></td>
        </tr>),
    ];

    // offsets to make x, y in props dictate location of bottom center of full piano
    const XglobalKeyOffset = (props.width * octaveCount / -2);
    const YglobalKeyOffset = -props.height;

    const activeNotes = useActiveNotes();
    const setAreNotesActive = useSetAreNotesActive();

    const emphasizedNotes = useEmphasizedNotes();
    const setAreNotesEmphasized = useSetAreNotesEmphasized();

    type NoteProps = {
        keyWidth: number
        keyHeight: number
        individualKeyOffset: number
        individualActiveIndicaterOffset: number
        activeIndicatorWidth: number
        activeIndicatorY: number
        xpos: number
        extraProps: Object
    }

    const getPropsForWhiteNote: (note: number, octave: number) => NoteProps = React.useCallback((note: number, octave: number) => {
        const individualKeyOffset = XglobalKeyOffset + (octave * props.width);
        const keyWidth = props.width / 7;
        const keyHeight = props.height;
        const individualActiveIndicaterOffset = individualKeyOffset + (keyWidth / 2);
        const activeIndicatorWidth = keyWidth / 3;
        const activeIndicatorY = YglobalKeyOffset + 5 * keyHeight / 6;
        const xpos = (noteToXOffsetFactor[note] * props.width / 7);
        const extraProps = {stroke: keyColor, strokeWidth: 2}
        return {
            keyWidth,
            keyHeight,
            individualKeyOffset,
            individualActiveIndicaterOffset,
            activeIndicatorWidth,
            activeIndicatorY,
            xpos,
            extraProps,
        }
    }, [XglobalKeyOffset, YglobalKeyOffset, props.height, props.width]);

    const getPropsForBlackNote: (note: number, octave: number) => NoteProps = React.useCallback((note: number, octave: number) => {
        const individualKeyOffset = XglobalKeyOffset + (octave * props.width) - props.width / 24 + 1;
        const keyWidth = props.width / 14;
        const keyHeight = props.height * 2 / 3;
        const individualActiveIndicaterOffset = individualKeyOffset + (keyWidth / 2);
        const activeIndicatorWidth = keyWidth * 2 / 3;
        const activeIndicatorY = YglobalKeyOffset + 3 * keyHeight / 4;
        const xpos = noteToXOffsetFactor[note] * props.width / 7;
        const extraProps = {fill: keyColor}
        return {
            keyWidth,
            keyHeight,
            individualKeyOffset,
            individualActiveIndicaterOffset,
            activeIndicatorWidth,
            activeIndicatorY,
            xpos,
            extraProps,
        }
    }, [XglobalKeyOffset, YglobalKeyOffset, props.height, props.width]);

    const getPropsForNote: (note: number, octave: number) => NoteProps = React.useCallback((note: number, octave: number) => {
        if (blackKeyNums.includes(note)) {
            return getPropsForBlackNote(note, octave);
        }
        return getPropsForWhiteNote(note, octave);
    }, [getPropsForBlackNote, getPropsForWhiteNote]);

    const keys: JSX.Element[] = React.useMemo(() => {
        var keys: JSX.Element[] = [];
        const keyNumsInOrder = [...whiteKeyNums, ...blackKeyNums];
        for (var i = 0; i < octaveCount; i++) {
            for (let note of keyNumsInOrder) {
                const noteprops = getPropsForNote(note, i);
                keys.push(<Rect key={`key${i}-${note}`} x={noteprops.xpos + noteprops.individualKeyOffset} y={YglobalKeyOffset} width={noteprops.keyWidth} height={noteprops.keyHeight} {...noteprops.extraProps}></Rect>)
                if (activeNotes.has(note)) keys.push(<Circle key={`activeInd${i}-${note}`} x={noteprops.xpos + noteprops.individualActiveIndicaterOffset} y={noteprops.activeIndicatorY} width={noteprops.activeIndicatorWidth} height={noteprops.activeIndicatorWidth} fill={"white"}></Circle>)
                if (emphasizedNotes.has(note)) keys.push(<Circle key={`emphaInd${i}-${note}`} x={noteprops.xpos + noteprops.individualActiveIndicaterOffset} y={noteprops.activeIndicatorY} width={noteprops.activeIndicatorWidth} height={noteprops.activeIndicatorWidth} fill={"red"}></Circle>)
                keys.push(<Rect key={`keyHitbox${i}-${note}`} x={noteprops.xpos + noteprops.individualKeyOffset} y={YglobalKeyOffset} width={noteprops.keyWidth} height={noteprops.keyHeight} onClick={() => setAreNotesActive([note], !activeNotes.has(note))} onTap={() => setAreNotesActive([note], !activeNotes.has(note))} onMouseOver={() => setAreNotesEmphasized([note], true, true)} onMouseOut={() => setAreNotesEmphasized([note], false)}></Rect>)
            }
        }
        return keys;
    }, [YglobalKeyOffset, activeNotes, emphasizedNotes, getPropsForNote, octaveCount, setAreNotesActive, setAreNotesEmphasized]);

    return (
        <Widget x={props.x} y={props.y} contextMenuX={0} contextMenuY={-props.height - 20} settingsRows={settingsMenuItems}>
            {keys}
        </Widget>
    )
}

export default Piano;