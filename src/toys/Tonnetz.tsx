import React from 'react';
import { Circle, Group, Line, Shape, Text } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { Switch } from '@mui/material';
import { getIntervalColor, getIntervalDistance, getNoteName } from '../utils/Utils';
import { NoteSet, normalizeToSingleOctave, useChannelDisplays, useGetCombinedModdedEmphasis, useHomeNote, useNoteDisplays, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
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
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const noteDisplays = useNoteDisplays();
    const channelDisplays = useChannelDisplays();

    // TODO
    // const updateNotes = useUpdateNoteSet();

    // TODO
    // const getNotesInCommon = useGetActiveNotesInCommonWithModulation();

    const homeNote = useHomeNote();
    const updateNotes = useUpdateNoteSet();

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

    const intervalEmphasis = React.useCallback((noteA: number, noteB: number, channelName: string) => {
        if (channelName === NoteSet.Active) {
            return {
                isEmphasized: true,
                opacity: 0.25,
                strokeWidth: 1.5,
                strokeColor: "grey",
            }
        }
        return {
            isEmphasized: true,
            opacity: 1,
            strokeWidth: 3,
            strokeColor: getIntervalColor(getIntervalDistance(noteA, noteB, 12)),
        }
    }, [])

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
        const noteEmphasis: JSX.Element[] = [];
        const triads: JSX.Element[] = [];
        const dragListeners: JSX.Element[] = [];
        const noteListeners: JSX.Element[] = [];

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

        const renderIntervalLines = (notes: Set<number>, x: number, y: number, channelName: string) => {
            const cord = { x: x, y: y };
            const { x: xPos, y: yPos } = cordsToPosition(cord);
            const note = cordsToNote(cord);
            const normalizedNote = normalizeToSingleOctave(note);
            const hoverEmphasizeProps = { onTouchStart: () => emphasize([note]), onTouchEnd: () => unemphasize([note]), onMouseOver: () => emphasize([note]), onMouseOut: () => unemphasize([note]) }

            if (!notes.has(normalizedNote)) { return }

            // Right, up one fifth
            const rightNoteCord = { x: x + 1, y: y };
            const rightNote = cordsToNote(rightNoteCord);
            // Up-Right, up one minor third
            const upRightNoteCord = { x: x, y: y - 1 };
            const upRightNote = cordsToNote(upRightNoteCord);
            // Down-Right, up one major third
            const downRightCord = { x: x + 1, y: y + 1 };
            const downRightNote = cordsToNote(downRightCord);
            // Up-Right2, down one major second
            const upRight2Cord = { x: x + 1, y: y - 1 };
            const upRight2Note = cordsToNote(upRight2Cord);
            // Down-Right2, down one minor second
            const downRight2Cord = { x: x + 2, y: y + 1 };
            const downRight2Note = cordsToNote(downRight2Cord);
            // Down-Right3, down one tritone (straight line)
            const downRight3Cord = { x: x + 3, y: y + 1 };
            const downRight3Note = cordsToNote(downRight3Cord);
            // Up2, up one tritone (curved line)
            const up2Cord = { x: x, y: y - 2 };
            const up2Note = cordsToNote(up2Cord);


            // Right, up one fifth
            if (displayInterval[4]) {
                // if (noteDisplays.octaveGnostic[rightNote]?.some(chan => channel.name === chan.name)) {
                if (notes.has(normalizeToSingleOctave(rightNote))) {
                    const { opacity, strokeWidth, strokeColor } = intervalEmphasis(note, rightNote, channelName);
                    const rightNotePos = cordsToPosition(rightNoteCord);
                    intervals.push(<Line key={`right-${x}-${y}-${channelName}`} stroke={strokeColor} strokeWidth={strokeWidth} points={[xPos, yPos, rightNotePos.x, rightNotePos.y]} opacity={opacity} {...getEmphasizeProps([note, rightNote])} />);
                }
            }

            // Up-Right, up one minor third
            if (displayInterval[2]) {
                // if (noteDisplays.octaveGnostic[upRightNote]?.some(chan => channel.name === chan.name)) {
                if (notes.has(normalizeToSingleOctave(upRightNote))) {
                    const { opacity, strokeWidth, strokeColor } = intervalEmphasis(note, upRightNote, channelName);
                    const upRightNotePos = cordsToPosition(upRightNoteCord);
                    intervals.push(<Line key={`upright-${x}-${y}-${channelName}`} stroke={strokeColor} strokeWidth={strokeWidth} points={[xPos, yPos, upRightNotePos.x, upRightNotePos.y]} opacity={opacity} {...getEmphasizeProps([note, upRightNote])} />);
                }
            }

            // Down-Right, up one major third
            if (displayInterval[3]) {
                // if (noteDisplays.octaveGnostic[downRightNote]?.some(chan => channel.name === chan.name)) {
                if (notes.has(normalizeToSingleOctave(downRightNote))) {
                    const { opacity, strokeWidth, strokeColor } = intervalEmphasis(note, downRightNote, channelName);
                    const downRightNotePos = cordsToPosition(downRightCord);
                    intervals.push(<Line key={`downright-${x}-${y}-${channelName}`} stroke={strokeColor} strokeWidth={strokeWidth} points={[xPos, yPos, downRightNotePos.x, downRightNotePos.y]} opacity={opacity} {...getEmphasizeProps([note, downRightNote])} />);
                }
            }

            // Up-Right2, down one major second
            if (displayInterval[1]) {
                // if (noteDisplays.octaveGnostic[upRight2Note]?.some(chan => channel.name === chan.name)) {
                if (notes.has(normalizeToSingleOctave(upRight2Note))) {
                    const { opacity, strokeWidth, strokeColor } = intervalEmphasis(note, upRight2Note, channelName);
                    const downRight2NotePos = cordsToPosition(upRight2Cord);
                    intervals.push(<Line key={`upright2-${x}-${y}-${channelName}`} stroke={strokeColor} strokeWidth={strokeWidth} points={[xPos, yPos, downRight2NotePos.x, downRight2NotePos.y]} opacity={opacity} {...getEmphasizeProps([note, upRight2Note])} />);
                }
            }

            // Down-Right2, down one minor second
            if (displayInterval[0]) {
                // if (noteDisplays.octaveGnostic[downRight2Note]?.some(chan => channel.name === chan.name)) {
                if (notes.has(normalizeToSingleOctave(downRight2Note))) {
                    const { opacity, strokeWidth, strokeColor } = intervalEmphasis(note, downRight2Note, channelName);
                    const downRight2NotePos = cordsToPosition(downRight2Cord);
                    intervals.push(<Line key={`downright2-${x}-${y}-${channelName}`} stroke={strokeColor} strokeWidth={strokeWidth} points={[xPos, yPos, downRight2NotePos.x, downRight2NotePos.y]} opacity={opacity} {...getEmphasizeProps([note, downRight2Note])} />);
                }
            }

            // Down-Right3, down one tritone (straight line)
            if (displayInterval[5]) {
                // if (noteDisplays.octaveGnostic[downRight3Note]?.some(chan => channel.name === chan.name)) {
                if (notes.has(normalizeToSingleOctave(downRight3Note))) {
                    const { opacity, strokeWidth, strokeColor } = intervalEmphasis(note, downRight3Note, channelName);
                    const downRight3NotePos = cordsToPosition(downRight3Cord);
                    intervals.push(<Line key={`downright3-${x}-${y}-${channelName}`} stroke={strokeColor} strokeWidth={strokeWidth} points={[xPos, yPos, downRight3NotePos.x, downRight3NotePos.y]} opacity={opacity} />);
                }
            }

            // Up2, up one tritone (curved line)
            if (displayInterval[5]) {
                // if (noteDisplays.octaveGnostic[up2Note]?.some(chan => channel.name === chan.name)) {
                if (notes.has(normalizeToSingleOctave(up2Note))) {
                    const { opacity, strokeWidth, strokeColor } = intervalEmphasis(note, up2Note, channelName);
                    const up2NotePos = cordsToPosition(up2Cord);
                    const c = 2;
                    intervals.push(
                        // <Line key={`up2-${x}-${y}`} stroke={getIntervalColor(6)} strokeWidth={strokeWidth} points={[xPos, yPos, up2NotePos.x, up2NotePos.y]} opacity={opacity} />
                        <Shape
                            key={`downright3-bezier-${x}-${y}-${channelName}`}
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
                            stroke={strokeColor}
                            opacity={opacity}
                            strokeWidth={strokeWidth}
                            {...getEmphasizeProps([note, up2Note])}
                        />
                    );
                }
            }
        };


        for (let y = -distFromCenter + yDraggedOffset; y <= distFromCenter + yDraggedOffset; y++) {
            for (let x = -distFromCenter + xDraggedOffset; x <= distFromCenter + xDraggedOffset; x++) {
                // const rowOffset = (y % 2 === 0) ? 0 : spacing / 2;
                // const xPos = (x * spacing) + rowOffset;
                // const yPos = y * spacing * sqrt3over2;
                const cord = { x: x, y: y };
                const { x: xPos, y: yPos } = cordsToPosition(cord);
                const note = cordsToNote(cord);

                const normalizedNote = normalizeToSingleOctave(note);
                const hoverEmphasizeProps = { onTouchStart: () => emphasize([note]), onTouchEnd: () => unemphasize([note]), onMouseOver: () => emphasize([note]), onMouseOut: () => unemphasize([note]) }

                // Right, up one fifth
                const rightNoteCord = { x: x + 1, y: y };
                const rightNote = cordsToNote(rightNoteCord);
                // Up-Right, up one minor third
                const upRightNoteCord = { x: x, y: y - 1 };
                const upRightNote = cordsToNote(upRightNoteCord);
                // Down-Right, up one major third
                const downRightCord = { x: x + 1, y: y + 1 };
                const downRightNote = cordsToNote(downRightCord);
                // Up-Right2, down one major second
                const upRight2Cord = { x: x + 1, y: y - 1 };
                const upRight2Note = cordsToNote(upRight2Cord);
                // Down-Right2, down one minor second
                const downRight2Cord = { x: x + 2, y: y + 1 };
                const downRight2Note = cordsToNote(downRight2Cord);
                // Down-Right3, down one tritone (straight line)
                const downRight3Cord = { x: x + 3, y: y + 1 };
                const downRight3Note = cordsToNote(downRight3Cord);
                // Up2, up one tritone (curved line)
                const up2Cord = { x: x, y: y - 2 };
                const up2Note = cordsToNote(up2Cord);

                channelDisplays.forEach((channel, idx) => {
                    // TODO normalize in noteprovider instead
                    const normalizedNotes = new Set(Array.from(channel.notes).map(note => normalizeToSingleOctave(note)));
                    renderIntervalLines(normalizedNotes, x, y, channel.name);
                });

                renderIntervalLines(activeNotes, x, y, NoteSet.Active);

                if (activeNotes.has(normalizedNote)) {
                    const minorTriadEmphasizeProps = getEmphasizeProps([note, upRightNote, rightNote]);
                    const majorTriadEmphasizeProps = getEmphasizeProps([note, downRightNote, rightNote]);

                    // Note
                    const color = (homeNote === normalizedNote ? "yellow" : "white");
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
                }
                // Note listener
                // }

                noteDisplays.normalized[normalizedNote]?.forEach((channel, idx) => {
                    // notes.push(<Circle key={`${channel.name}-${i}-${idx}`} opacity={1 / (idx + 1)} x={noteLoc.x} y={noteLoc.y} fill={channel.color ?? "white"} radius={20} />);
                    noteEmphasis.push(<Circle key={`${x}-${y}-${channel.name}-${idx}`} x={xPos} y={yPos} fill={channel.color} radius={20} />);
                });
                noteListeners.push(<Circle key={`listener${x}-${y}`} x={xPos} y={yPos} radius={20} {...hoverEmphasizeProps} />);

                dragListeners.push(<Line key={`majorDragListener${x}-${y}`} closed={true} x={xPos} y={yPos} points={[0, 0, spacing * 0.5, spacing * sqrt3over2, spacing, 0]} />);
                dragListeners.push(<Line key={`minorTriadListener${x}-${y}`} closed={true} x={xPos} y={yPos} points={[0, 0, spacing * 0.5, -spacing * sqrt3over2, spacing, 0]} />);

                notes.push(<Text key={`noteName${x}-${y}`} width={40} height={40} x={xPos - 20} y={yPos - 20} text={getNoteName(normalizedNote, activeNotes)} fontSize={14} fontFamily='monospace' fill={activeNotes.has(note) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" listening={false} />);
                // notes.push(<Text key={`noteName${x}-${y}`} width={40} height={40} x={xPos - 20} y={yPos - 20} text={"" + note} fontSize={14} fontFamily='monospace' fill={activeNotes.has(note) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" />);
                notes.push(<Circle key={`halo${x}-${y}`} x={xPos} y={yPos} stroke="rgba(255,255,255,0.1)" radius={20} listening={false} />);
            }
        }
        return {
            notes, intervals, triads, dragListeners, noteListeners, noteEmphasis
        }
    }, [activeNotes, channelDisplays, cordsToNote, cordsToPosition, displayInterval, distFromCenter, homeNote, intervalEmphasis, noteDisplays.normalized, updateNotes, xDraggedOffset, yDraggedOffset]);

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
                    {elements.noteEmphasis}
                    {elements.notes}
                    {elements.noteListeners}
                </Group>
            </Group >
        );

    }, [draggedPosition.x, draggedPosition.y, elements.dragListeners, elements.intervals, elements.noteEmphasis, elements.noteListeners, elements.notes, elements.triads, onDrag, radius]);

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
