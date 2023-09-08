import React from 'react';
import { Circle, Group, Line, Shape, Text } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { Switch } from '@mui/material';
import { getIntervalColor, getNoteName } from '../utils/Utils';
import { NoteSet, normalizeToSingleOctave, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { Vector2d } from 'konva/lib/types';
import { KonvaEventObject } from 'konva/lib/Node';
import useRenderingTrace from '../utils/ProfilingUtils';

const sqrt3over2 = Math.sqrt(3) / 2;

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

function Tonnetz(props: Props) {
    const radius = Math.min(props.width, props.height) / 2;
    const activeNotes = useNoteSet()(NoteSet.Active);

    const emphasizedNotes = useGetCombinedModdedEmphasis()();
    // const updateNotes = useUpdateNoteSet();
    // const getNotesInCommon = useGetActiveNotesInCommonWithModulation();
    const homeNote = useHomeNote();
    const updateNotes = useUpdateNoteSet();
    // useRenderingTrace("Tonnetz", { activeNotes, emphasizedNotes, homeNote, updateNotes });
    // const setHomeNote = useSetHomeNote();


    // const modulateActiveNotes = useModulateActiveNotes();

    // const [highlightedNotes, setHighlightedNotes] = React.useState(new Set<number>());

    // Settings Storage

    const [displayInterval, setDisplayIntervals] = React.useState([true, true, true, true, true, false]);
    const setDisplayInterval = (index: number, value: boolean) => {
        const newDisplayInterval = displayInterval.slice();
        newDisplayInterval[index] = value;
        setDisplayIntervals(newDisplayInterval);
    }

    const settingsMenuItems: JSX.Element[] = [
        (<tr key={'tr0'}>
            <td>Show Minor Seconds (Major Sevenths)</td>
            <td style={{ color: getIntervalColor(1), textAlign: "center" }}>■</td>
            <td><Switch color={"primary"} checked={displayInterval[0]} onChange={e => setDisplayInterval(0, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr1'}>
            <td>Show Major Seconds (Minor Sevenths)</td>
            <td style={{ color: getIntervalColor(2), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[1]} onChange={e => setDisplayInterval(1, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr2'}>
            <td>Show Minor Thirds (Major Sixths)</td>
            <td style={{ color: getIntervalColor(3), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[2]} onChange={e => setDisplayInterval(2, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr3'}>
            <td>Show Major Thirds (Minor Sixths)</td>
            <td style={{ color: getIntervalColor(4), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[3]} onChange={e => setDisplayInterval(3, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr4'}>
            <td>Show Perfect Fourths (Perfect Fifths)</td>
            <td style={{ color: getIntervalColor(5), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[4]} onChange={e => setDisplayInterval(4, e.target.checked)} /></td>
        </tr>),
        (<tr key={'tr5'}>
            <td>Show Tritones</td>
            <td style={{ color: getIntervalColor(6), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[5]} onChange={e => setDisplayInterval(5, e.target.checked)} /></td>
        </tr>),
    ];

    const cordsToNote = React.useCallback((cord: Vector2d) => {
        // const drift = -Math.floor(-cord.y / 2);
        // const drift = 0;
        return (homeNote ?? 0) + ((cord.x) * 7) + (-cord.y * 3);
    }, [homeNote]);

    const cordsToPosition = React.useCallback((cord: Vector2d) => {
        const rowDriftOffset = -cord.y * spacing / 2;
        const xPos = (cord.x * spacing) + rowDriftOffset;
        const yPos = cord.y * spacing * sqrt3over2;
        return { x: xPos, y: yPos };
    }, []);

    const intervalEmphasis = React.useCallback((noteA: number, noteB: number) => {
        const isIntervalEmphasized = emphasizedNotes.has(normalizeToSingleOctave(noteA)) && emphasizedNotes.has(normalizeToSingleOctave(noteB));
        return {
            isEmphasized: isIntervalEmphasized,
            opacity: isIntervalEmphasized ? 1 : 0.25,
            strokeWidth: isIntervalEmphasized ? 3 : 1.5,
        }
    }, [emphasizedNotes])

    const [draggedPosition, setDraggedPosition] = React.useState<Vector2d>({ x: 0, y: 0 });
    const onDrag = React.useCallback((event: KonvaEventObject<DragEvent>) => {
        setDraggedPosition(event.currentTarget.position());
    }, []);

    const spacing = 80;
    const distFromCenter = Math.ceil(radius / spacing) + 1;
    const xDraggedOffset = Math.floor(-(draggedPosition.x / spacing) - (draggedPosition.y * 0.5 / (sqrt3over2 * spacing)));
    const yDraggedOffset = Math.floor(-draggedPosition.y / (sqrt3over2 * spacing));

    const elements = React.useMemo(() => {
        const notes: JSX.Element[] = [];
        const intervals: JSX.Element[] = [];
        const triads: JSX.Element[] = [];
        const dragListeners: JSX.Element[] = [];

        const emphasize = (notenums: number[]) => {
            updateNotes(NoteSet.Emphasized_OctaveGnostic, notenums, true, true);
        };

        const unemphasize = (notenums: number[]) => {
            updateNotes(NoteSet.Emphasized_OctaveGnostic, notenums, false);
        };

        // TODO make a centralized utility for this
        const getEmphasizeProps = (notenums: number[]) => {
            return { onTouchStart: () => emphasize(notenums), onTouchEnd: () => unemphasize(notenums), onMouseOver: () => emphasize(notenums), onMouseOut: () => unemphasize(notenums) }
        }

        for (let y = -distFromCenter + yDraggedOffset; y <= distFromCenter + yDraggedOffset; y++) {
            for (let x = -distFromCenter + xDraggedOffset; x <= distFromCenter + xDraggedOffset; x++) {
                // const rowOffset = (y % 2 === 0) ? 0 : spacing / 2;
                // const xPos = (x * spacing) + rowOffset;
                // const yPos = y * spacing * sqrt3over2;
                const cord = { x: x, y: y };
                const { x: xPos, y: yPos } = cordsToPosition(cord);
                const note = cordsToNote(cord);

                const normalizedNote = normalizeToSingleOctave(note);
                if (activeNotes.has(normalizedNote)) {

                    // interval lines

                    // Right, up one fifth
                    const rightNoteCord = { x: x + 1, y: y };
                    const rightNote = cordsToNote(rightNoteCord);
                    if (displayInterval[4]) {
                        if (activeNotes.has(normalizeToSingleOctave(rightNote))) {
                            const { opacity, strokeWidth } = intervalEmphasis(note, rightNote);
                            const rightNotePos = cordsToPosition(rightNoteCord);
                            intervals.push(<Line key={`right-${x}-${y}`} stroke={getIntervalColor(5)} strokeWidth={strokeWidth} points={[xPos, yPos, rightNotePos.x, rightNotePos.y]} opacity={opacity} {...getEmphasizeProps([note, rightNote])} />);
                        }
                    }

                    // Up-Right, up one minor third
                    const upRightNoteCord = { x: x, y: y - 1 };
                    const upRightNote = cordsToNote(upRightNoteCord);
                    if (displayInterval[2]) {
                        if (activeNotes.has(normalizeToSingleOctave(upRightNote))) {
                            const { opacity, strokeWidth } = intervalEmphasis(note, upRightNote);
                            const upRightNotePos = cordsToPosition(upRightNoteCord);
                            intervals.push(<Line key={`upright-${x}-${y}`} stroke={getIntervalColor(3)} strokeWidth={strokeWidth} points={[xPos, yPos, upRightNotePos.x, upRightNotePos.y]} opacity={opacity} {...getEmphasizeProps([note, upRightNote])} />);
                        }
                    }

                    // Down-Right, up one major third
                    const downRightCord = { x: x + 1, y: y + 1 };
                    const downRightNote = cordsToNote(downRightCord);
                    if (displayInterval[3]) {
                        if (activeNotes.has(normalizeToSingleOctave(downRightNote))) {
                            const { opacity, strokeWidth } = intervalEmphasis(note, downRightNote);
                            const downRightNotePos = cordsToPosition(downRightCord);
                            intervals.push(<Line key={`downright-${x}-${y}`} stroke={getIntervalColor(4)} strokeWidth={strokeWidth} points={[xPos, yPos, downRightNotePos.x, downRightNotePos.y]} opacity={opacity} {...getEmphasizeProps([note, downRightNote])} />);
                        }
                    }

                    // Up-Right2, down one major second
                    if (displayInterval[1]) {
                        const upRight2Cord = { x: x + 1, y: y - 1 };
                        const upRight2Note = cordsToNote(upRight2Cord);
                        if (activeNotes.has(normalizeToSingleOctave(upRight2Note))) {
                            const { opacity, strokeWidth } = intervalEmphasis(note, upRight2Note);
                            const downRight2NotePos = cordsToPosition(upRight2Cord);
                            intervals.push(<Line key={`upright2-${x}-${y}`} stroke={getIntervalColor(2)} strokeWidth={strokeWidth} points={[xPos, yPos, downRight2NotePos.x, downRight2NotePos.y]} opacity={opacity} {...getEmphasizeProps([note, upRight2Note])} />);
                        }
                    }

                    // Down-Right2, down one minor second
                    if (displayInterval[0]) {
                        const downRight2Cord = { x: x + 2, y: y + 1 };
                        const downRight2Note = cordsToNote(downRight2Cord);
                        if (activeNotes.has(normalizeToSingleOctave(downRight2Note))) {
                            const { opacity, strokeWidth } = intervalEmphasis(note, downRight2Note);
                            const downRight2NotePos = cordsToPosition(downRight2Cord);
                            intervals.push(<Line key={`downright2-${x}-${y}`} stroke={getIntervalColor(1)} strokeWidth={strokeWidth} points={[xPos, yPos, downRight2NotePos.x, downRight2NotePos.y]} opacity={opacity} {...getEmphasizeProps([note, downRight2Note])} />);
                        }
                    }

                    // Down-Right3, down one tritone (straight line)
                    // if (displayInterval[5]) {
                    //     const downRight3Cord = { x: x + 3, y: y + 1 };
                    //     const downRight3Note = cordsToNote(downRight3Cord);
                    //     if (activeNotes.has(normalizeToSingleOctave(downRight3Note))) {
                    //         const { opacity, strokeWidth } = intervalEmphasis(note, downRight3Note);
                    //         const downRight3NotePos = cordsToPosition(downRight3Cord);
                    //         intervals.push(<Line key={`downright3-${x}-${y}`} stroke={getIntervalColor(6)} strokeWidth={strokeWidth} points={[xPos, yPos, downRight3NotePos.x, downRight3NotePos.y]} opacity={opacity} />);
                    //     }
                    // }

                    // Up2, up one tritone (curved line)
                    if (displayInterval[5]) {
                        const up2Cord = { x: x, y: y - 2 };
                        const up2Note = cordsToNote(up2Cord);
                        if (activeNotes.has(normalizeToSingleOctave(up2Note))) {
                            const { opacity, strokeWidth } = intervalEmphasis(note, up2Note);
                            const up2NotePos = cordsToPosition(up2Cord);
                            const c = 2;
                            intervals.push(
                                // <Line key={`up2-${x}-${y}`} stroke={getIntervalColor(6)} strokeWidth={strokeWidth} points={[xPos, yPos, up2NotePos.x, up2NotePos.y]} opacity={opacity} />
                                <Shape
                                    key={`downright3-bezier-${x}-${y}`}
                                    sceneFunc={(context, shape) => {
                                        context.beginPath();
                                        context.moveTo(xPos, yPos);
                                        context.bezierCurveTo(
                                            xPos - (spacing / c),
                                            yPos - (spacing * sqrt3over2 / c),
                                            up2NotePos.x - (spacing / c),
                                            up2NotePos.y - (spacing * sqrt3over2 / c),
                                            up2NotePos.x,
                                            up2NotePos.y,
                                        );
                                        context.strokeShape(shape);
                                    }}
                                    stroke={getIntervalColor(6)}
                                    opacity={opacity}
                                    strokeWidth={strokeWidth}
                                    {...getEmphasizeProps([note, up2Note])}
                                />
                            );
                        }
                    }

                    const hoverEmphasizeProps = { onTouchStart: () => emphasize([note]), onTouchEnd: () => unemphasize([note]), onMouseOver: () => emphasize([note]), onMouseOut: () => unemphasize([note]) }
                    const minorTriadEmphasizeProps = getEmphasizeProps([note, upRightNote, rightNote]);
                    const majorTriadEmphasizeProps = getEmphasizeProps([note, downRightNote, rightNote]);



                    // Note
                    const color = emphasizedNotes.has(normalizedNote) ? "red" : (homeNote === normalizedNote ? "yellow" : "white");
                    notes.push(<Circle key={`${x}-${y}`} x={xPos} y={yPos} fill={color} radius={10} />);

                    // Triad triangle listeners
                    if (activeNotes.has(normalizeToSingleOctave(rightNote))) {
                        if (activeNotes.has(normalizeToSingleOctave(downRightNote))) {
                            triads.push(<Line key={`majorTriadListener${x}-${y}`} closed={true} x={xPos} y={yPos} points={[0, 0, spacing * 0.5, spacing * sqrt3over2, spacing, 0]} {...majorTriadEmphasizeProps} />);
                        }
                        if (activeNotes.has(normalizeToSingleOctave(upRightNote))) {
                            triads.push(<Line key={`minorTriadListener${x}-${y}`} closed={true} x={xPos} y={yPos} points={[0, 0, spacing * 0.5, -spacing * sqrt3over2, spacing, 0]} {...minorTriadEmphasizeProps} />);
                        }
                    }

                    // Note listener
                    notes.push(<Circle key={`listener${x}-${y}`} x={xPos} y={yPos} radius={20} {...hoverEmphasizeProps} />);
                }

                dragListeners.push(<Line key={`majorDragListener${x}-${y}`} closed={true} x={xPos} y={yPos} points={[0, 0, spacing * 0.5, spacing * sqrt3over2, spacing, 0]} />);
                dragListeners.push(<Line key={`minorTriadListener${x}-${y}`} closed={true} x={xPos} y={yPos} points={[0, 0, spacing * 0.5, -spacing * sqrt3over2, spacing, 0]} />);

                notes.push(<Text key={`noteName${x}-${y}`} width={40} height={40} x={xPos - 20} y={yPos - 20} text={getNoteName(normalizedNote, activeNotes)} fontSize={14} fontFamily='monospace' fill={activeNotes.has(note) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" listening={false} />);
                // notes.push(<Text key={`noteName${x}-${y}`} width={40} height={40} x={xPos - 20} y={yPos - 20} text={"" + note} fontSize={14} fontFamily='monospace' fill={activeNotes.has(note) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" />);
                notes.push(<Circle key={`halo${x}-${y}`} x={xPos} y={yPos} stroke="rgba(255,255,255,0.1)" radius={20} listening={false} />);
            }
        }

        return {
            notes, intervals, triads, dragListeners
        }
    }, [activeNotes, cordsToNote, cordsToPosition, displayInterval, distFromCenter, emphasizedNotes, homeNote, intervalEmphasis, updateNotes, xDraggedOffset, yDraggedOffset]);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group
                x={radius} y={radius}
                clipFunc={(ctx) => ctx.arc(0, 0, radius, 0, Math.PI * 2, false)}
            >
                <Circle radius={radius} stroke="rgba(255,255,255,0.1)"></Circle>
                <Group draggable onDragMove={onDrag}>
                    {elements.dragListeners}
                    {elements.triads}
                </Group>
                <Group x={draggedPosition.x} y={draggedPosition.y}>
                    {elements.intervals}
                    {elements.notes}
                </Group>
            </Group>
        );

    }, [draggedPosition.x, draggedPosition.y, elements.dragListeners, elements.intervals, elements.notes, elements.triads, onDrag, radius]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={settingsMenuItems} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}
export default Tonnetz;
