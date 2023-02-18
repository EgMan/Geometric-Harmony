import React from 'react';
import { Circle, Rect, Line, Text } from 'react-konva';
import Widget from './Widget';
import { MenuItem, Select, Switch } from '@mui/material';
import { getNoteName } from './Utils';
import { NoteSet, useNoteSet, useUpdateNoteSet } from './NoteProvider';

type Props = {
    x: number
    y: number
    height: number
    width: number
    fretCount: number
    tuning: number[]
}

function StringInstrument(props: Props) {
    const stringSpacing = props.width / (props.tuning.length - 1);
    const fretSpacing = props.height / props.fretCount;
    const fretElemYOffset = -fretSpacing / 2;
    const circleElemRadius = stringSpacing / 5;

    const activeNotes = useNoteSet()(NoteSet.Active);
    const emphasizedNotes = useNoteSet()(NoteSet.Emphasized);
    const updateNotes = useUpdateNoteSet();

    enum NoteLabling {
        None = 1,
        NoteNames,
        ActiveNoteNames,
      }
    const [noteLabeling, setNoteLabeling] = React.useState(NoteLabling.ActiveNoteNames);

    const settingsMenuItems = [
        (<tr>
            <td>Note labeling</td>
            {/* <td><FormControlLabel control={<Switch checked={isCircleOfFifths} onChange={e => setIsCircleOfFiths(e.target.checked)}/>} label={isCircleOfFifths ? "" : 1} /></td> */}
            <td colSpan={2}>  <Select
                id="menu-dropdown"
                value={noteLabeling}
                label="Note labeling"
                onChange={e => { setNoteLabeling(e.target.value as NoteLabling) }}
            >
                <MenuItem value={NoteLabling.None}>None</MenuItem>
                <MenuItem value={NoteLabling.NoteNames}>Note Names (all notes)</MenuItem>
                <MenuItem value={NoteLabling.ActiveNoteNames}>Note Names (only active notes)</MenuItem>
            </Select></td>
        </tr>),
    ];
    const elems = React.useMemo(() => {
        let stringElements: JSX.Element[] = [];
        let fretElements: JSX.Element[] = [];
        let noteNames: JSX.Element[] = [];
        let activeNoteIndicators: JSX.Element[] = [];
        let emphasized: JSX.Element[] = [];
        let clickListeners: JSX.Element[] = [];

        for (let fretNum = 0; fretNum < props.fretCount; fretNum++) {
            const posY = (fretSpacing * fretNum);
            fretElements.push(
                <Line stroke={"grey"} strokeWidth={3} points={[0, posY, props.width, posY]} />
            );
            if ([3, 5, 7, 9,].includes(fretNum % 12)) {
                fretElements.push(
                    <Circle x={props.width / 2} y={posY + fretElemYOffset} radius={stringSpacing / 6} fill={"grey"} />
                );
            }
            if (fretNum % 12 === 0 && fretNum > 0) {
                fretElements.push(
                    <Circle x={3 * props.width / 10} y={posY + fretElemYOffset} radius={stringSpacing / 6} fill={"grey"} />
                );
                fretElements.push(
                    <Circle x={7 * props.width / 10} y={posY + fretElemYOffset} radius={stringSpacing / 6} fill={"grey"} />
                );
            }
            props.tuning.forEach((openNote, stringNum) => {
                const posX = (stringSpacing * stringNum);
                const note = (openNote + fretNum) % 12;
                // <Line x={props.x} y={props.y} stroke={discColor} strokeWidth={lineWidth} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />

                if (fretNum !== props.fretCount - 1) {
                    stringElements.push(
                        <Line stroke={"grey"} strokeWidth={1} points={[posX, posY, posX, posY + fretSpacing]} />
                    );

                }
                if (emphasizedNotes.has(note)) {
                    emphasized.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={"red"}></Circle>)
                    noteNames.push(
                        <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={"black"} align="center" verticalAlign="middle" />
                    )
                }
                else if (activeNotes.has(note)) {
                    activeNoteIndicators.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={"white"}></Circle>)
                    if ([NoteLabling.ActiveNoteNames, NoteLabling.NoteNames].includes(noteLabeling)) {
                        noteNames.push(
                            <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={"black"} align="center" verticalAlign="middle" />
                        )
                    }
                } else if (noteLabeling === NoteLabling.NoteNames) {
                    activeNoteIndicators.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={"rgb(55,55,55)"}></Circle>)
                    noteNames.push(
                        <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={"grey"} align="center" verticalAlign="middle" />
                    )
                }

                clickListeners.push(<Rect key={`keyHitbox${fretNum}-${stringNum}`} x={posX - (stringSpacing / 2)} y={posY + fretElemYOffset - (fretSpacing / 2)} width={stringSpacing} height={fretSpacing} onClick={() => updateNotes(NoteSet.Active, [note], !activeNotes.has(note))} onTap={() => updateNotes(NoteSet.Active, [note], !activeNotes.has(note))} onMouseOver={() => updateNotes(NoteSet.Emphasized, [note], true, true)} onMouseOut={() => updateNotes(NoteSet.Emphasized, [note], false)}></Rect>)
            });
        }
        return {
            strings: stringElements,
            frets: fretElements,
            noteNames: noteNames,
            noteIndicators: activeNoteIndicators,
            emphasized,
            clickListeners,
        }
    }, [NoteLabling.ActiveNoteNames, NoteLabling.NoteNames, activeNotes, circleElemRadius, emphasizedNotes, fretElemYOffset, fretSpacing, noteLabeling, props.fretCount, props.tuning, props.width, stringSpacing, updateNotes]);

    return (
        <Widget x={props.x - (props.width / 2)} y={props.y} contextMenuX={props.width / 2} contextMenuY={-fretSpacing} settingsRows={settingsMenuItems}>
            {/* <Circle radius={100} fill={"green"} /> */}
            {elems.frets}
            {elems.strings}
            {elems.noteIndicators}
            {elems.emphasized}
            {elems.noteNames}
            {elems.clickListeners}
        </Widget>
    );
}

export default StringInstrument;