import React from 'react';
import { Circle, Group, Line, Shape, Text } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { MenuItem, Select, Switch } from '@mui/material';
import { KonvaEventObject } from 'konva/lib/Node';
import { useGetActiveNotesInCommonWithModulation, useModulateActiveNotes } from '../sound/HarmonicModulation';
import { getIntervalColor, getIntervalDistance, getNoteName } from '../utils/Utils';
import { NoteSet, normalizeToSingleOctave, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { Vector2d } from 'konva/lib/types';

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
    // const setHomeNote = useSetHomeNote();


    // const modulateActiveNotes = useModulateActiveNotes();

    // const [highlightedNotes, setHighlightedNotes] = React.useState(new Set<number>());

    // Settings Storage

    // const [displayInterval, setDisplayIntervals] = React.useState([true, true, true, true, true, true]);
    // const setDisplayInterval = (index: number, value: boolean) => {
    //     const newDisplayInterval = displayInterval.slice();
    //     newDisplayInterval[index] = value;
    //     setDisplayIntervals(newDisplayInterval);
    // }

    const settingsMenuItems: JSX.Element[] = [
    ];

    const distFromCenter = 4;
    const spacing = 80;

    // const rawCordsToDriftedCords = React.useCallback((cord: Vector2d) => {
    //     const drift = Math.floor(cord.y / 2);
    //     return { x: cord.x + drift, y: cord.y };
    // }, []);

    // const cordsToNote = React.useCallback((cord: Vector2d) => {
    //     // const drift = -Math.floor(-cord.y / 2);
    //     // const drift = 0;
    //     return (homeNote ?? 0) + ((cord.x) * 7) + (-cord.y * 3);
    // }, [homeNote]);

    // const cordsToPosition = React.useCallback((cord: Vector2d) => {
    //     const rowOffset = (cord.y % 2 === 0) ? 0 : spacing / 2;
    //     const xPos = (cord.x * spacing) + rowOffset;
    //     const yPos = cord.y * spacing * sqrt3over2;
    //     return { x: xPos, y: yPos };
    // }, []);

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

    const noteEmphasis = React.useCallback((note: number) => {
        const isEmphasized = emphasizedNotes.has(normalizeToSingleOctave(note))
        return {
            color: isEmphasized ? "red" : "white"
        }
    }, [emphasizedNotes]);
    const intervalEmphasis = React.useCallback((noteA: number, noteB: number) => {
        const isIntervalEmphasized = emphasizedNotes.has(normalizeToSingleOctave(noteA)) && emphasizedNotes.has(normalizeToSingleOctave(noteB));
        return {
            isEmphasized: isIntervalEmphasized,
            opacity: isIntervalEmphasized ? 1 : 0.25,
            strokeWidth: isIntervalEmphasized ? 3 : 1.5,
        }
    }, [emphasizedNotes])

    const elements = React.useMemo(() => {
        const notes: JSX.Element[] = [];
        const intervals: JSX.Element[] = [];

        for (let y = -distFromCenter; y <= distFromCenter; y++) {
            for (let x = -distFromCenter; x <= distFromCenter; x++) {
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
                    if (activeNotes.has(normalizeToSingleOctave(rightNote))) {
                        const { opacity, strokeWidth } = intervalEmphasis(note, rightNote);
                        const rightNotePos = cordsToPosition(rightNoteCord);
                        intervals.push(<Line key={`right-${x}-${y}`} stroke={getIntervalColor(5)} strokeWidth={strokeWidth} points={[xPos, yPos, rightNotePos.x, rightNotePos.y]} opacity={opacity} />);
                    }

                    // Up-Right, up one minor third
                    const upRightNoteCord = { x: x, y: y - 1 };
                    const upRightNote = cordsToNote(upRightNoteCord);
                    if (activeNotes.has(normalizeToSingleOctave(upRightNote))) {
                        const { opacity, strokeWidth } = intervalEmphasis(note, upRightNote);
                        const upRightNotePos = cordsToPosition(upRightNoteCord);
                        intervals.push(<Line key={`upright-${x}-${y}`} stroke={getIntervalColor(3)} strokeWidth={strokeWidth} points={[xPos, yPos, upRightNotePos.x, upRightNotePos.y]} opacity={opacity} />);
                    }

                    // Down-Right, up one major third
                    const downRightCord = { x: x + 1, y: y + 1 };
                    const downRightNote = cordsToNote(downRightCord);
                    if (activeNotes.has(normalizeToSingleOctave(downRightNote))) {
                        const { opacity, strokeWidth } = intervalEmphasis(note, downRightNote);
                        const downRightNotePos = cordsToPosition(downRightCord);
                        intervals.push(<Line key={`downright-${x}-${y}`} stroke={getIntervalColor(4)} strokeWidth={strokeWidth} points={[xPos, yPos, downRightNotePos.x, downRightNotePos.y]} opacity={opacity} />);
                    }

                    // Up-Right2, down one major second
                    const upRight2Cord = { x: x + 1, y: y - 1 };
                    const upRight2Note = cordsToNote(upRight2Cord);
                    if (activeNotes.has(normalizeToSingleOctave(upRight2Note))) {
                        const { opacity, strokeWidth } = intervalEmphasis(note, upRight2Note);
                        const downRight2NotePos = cordsToPosition(upRight2Cord);
                        intervals.push(<Line key={`upright2-${x}-${y}`} stroke={getIntervalColor(2)} strokeWidth={strokeWidth} points={[xPos, yPos, downRight2NotePos.x, downRight2NotePos.y]} opacity={opacity} />);
                    }

                    // Down-Right2, down one minor second
                    const downRight2Cord = { x: x + 2, y: y + 1 };
                    const downRight2Note = cordsToNote(downRight2Cord);
                    if (activeNotes.has(normalizeToSingleOctave(downRight2Note))) {
                        const { opacity, strokeWidth } = intervalEmphasis(note, downRight2Note);
                        const downRight2NotePos = cordsToPosition(downRight2Cord);
                        intervals.push(<Line key={`downright2-${x}-${y}`} stroke={getIntervalColor(1)} strokeWidth={strokeWidth} points={[xPos, yPos, downRight2NotePos.x, downRight2NotePos.y]} opacity={opacity} />);
                    }

                    // Down-Right3, down one tritone
                    const downRight3Cord = { x: x + 3, y: y + 1 };
                    const downRight3Note = cordsToNote(downRight3Cord);
                    if (activeNotes.has(normalizeToSingleOctave(downRight3Note))) {
                        const { opacity, strokeWidth } = intervalEmphasis(note, downRight3Note);
                        const downRight3NotePos = cordsToPosition(downRight3Cord);
                        // intervals.push(<Line key={`downright3-${x}-${y}`} stroke={getIntervalColor(6)} strokeWidth={strokeWidth} points={[xPos, yPos, downRight3NotePos.x, downRight3NotePos.y]} opacity={opacity} />);
                    }

                    // Up2, up one tritone
                    const up2Cord = { x: x, y: y - 2 };
                    const up2Note = cordsToNote(downRight3Cord);
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
                            />
                        );
                    }

                    // Note
                    const color = emphasizedNotes.has(normalizedNote) ? "red" : (homeNote === normalizedNote ? "yellow" : "white");
                    notes.push(<Circle key={`${x}-${y}`} x={xPos} y={yPos} fill={color} radius={10} />);
                }
                notes.push(<Text key={`noteName${x}-${y}`} width={40} height={40} x={xPos - 20} y={yPos - 20} text={getNoteName(normalizedNote, activeNotes)} fontSize={14} fontFamily='monospace' fill={activeNotes.has(note) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" />);
                // notes.push(<Text key={`noteName${x}-${y}`} width={40} height={40} x={xPos - 20} y={yPos - 20} text={"" + note} fontSize={14} fontFamily='monospace' fill={activeNotes.has(note) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" />);
                notes.push(<Circle key={`halo${x}-${y}`} x={xPos} y={yPos} stroke="rgba(255,255,255,0.1)" radius={20} />);

                // notes.push(<Line key={`3-${noteA}-${noteB}`} stroke={discColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} opacity={0.25} />);
                // for (let i = 0; i < 6; i++) {

                // }

            }
        }

        const centerpoint = (<Circle radius={1} fill="white"></Circle>);

        return {
            notes, intervals
        }
    }, [activeNotes, cordsToNote, cordsToPosition, emphasizedNotes, homeNote, intervalEmphasis]);

    const fullRender = React.useMemo((
    ) => {
        const centerpoint = (<Circle radius={1} fill="white"></Circle>);


        return (
            <Group
                clipFunc={(ctx) => ctx.arc(0, 0, radius, 0, Math.PI * 2, false)}
            >
                {/* <Circle radius={radius} stroke="rgba(255,255,255,0.1)"></Circle> */}
                {elements.intervals}
                {elements.notes}
            </Group>
        );

    }, [elements.intervals, elements.notes, radius]);

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
