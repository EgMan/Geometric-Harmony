import React from 'react';
import { Circle, Rect, Line, Text } from 'react-konva';
import { useActiveNotes, useEmphasizedNotes, useSetAreNotesActive, useSetAreNotesEmphasized } from './NoteProvider';
import Widget from './Widget';
import { Switch } from '@mui/material';
import { getNoteName } from './Utils';

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

    const activeNotes = useActiveNotes();
    const setAreNotesActive = useSetAreNotesActive();

    const emphasizedNotes = useEmphasizedNotes();
    const setAreNotesEmphasized = useSetAreNotesEmphasized();

    const [showNoteNames, setShowNoteNames] = React.useState(true);

    const settingsMenuItems = [
        (<tr>
            <td>Show note names</td>
            <td style={{ textAlign: "center" }}>♯</td>
            <td><Switch checked={showNoteNames} onChange={e => setShowNoteNames(e.target.checked)} /></td>
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
                    if (showNoteNames) {
                        noteNames.push(
                            <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={"black"} align="center" verticalAlign="middle" />
                        )
                    }
                } else if (showNoteNames) {
                    activeNoteIndicators.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={"rgb(55,55,55)"}></Circle>)
                    noteNames.push(
                        <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={"grey"} align="center" verticalAlign="middle" />
                    )
                }

                clickListeners.push(<Rect key={`keyHitbox${fretNum}-${stringNum}`} x={posX - (stringSpacing / 2)} y={posY + fretElemYOffset - (fretSpacing / 2)} width={stringSpacing} height={fretSpacing} onClick={() => setAreNotesActive([note], !activeNotes.has(note))} onTap={() => setAreNotesActive([note], !activeNotes.has(note))} onMouseOver={() => setAreNotesEmphasized([note], true, true)} onMouseOut={() => setAreNotesEmphasized([note], false)}></Rect>)
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
    }, [activeNotes, circleElemRadius, emphasizedNotes, fretElemYOffset, fretSpacing, props.fretCount, props.tuning, props.width, setAreNotesActive, setAreNotesEmphasized, showNoteNames, stringSpacing]);

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