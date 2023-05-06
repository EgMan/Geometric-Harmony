import React from 'react';
import { Circle, Group, Line, Text } from 'react-konva';
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

    // const emphasizedNotes = useGetCombinedModdedEmphasis()();
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

    const notes = React.useMemo(() => {
        const notes: JSX.Element[] = [];

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
                        const rightNotePos = cordsToPosition(rightNoteCord);
                        notes.push(<Line key={`right-${x}-${y}`} stroke={getIntervalColor(5)} strokeWidth={1.5} points={[xPos, yPos, rightNotePos.x, rightNotePos.y]} opacity={0.25} />);
                    }

                    // Up-Right, up one minor third
                    const upRightNoteCord = { x: x, y: y - 1 };
                    const upRightNote = cordsToNote(upRightNoteCord);
                    if (activeNotes.has(normalizeToSingleOctave(upRightNote))) {
                        const upRightNotePos = cordsToPosition(upRightNoteCord);
                        notes.push(<Line key={`upright-${x}-${y}`} stroke={getIntervalColor(3)} strokeWidth={1.5} points={[xPos, yPos, upRightNotePos.x, upRightNotePos.y]} opacity={0.25} />);
                    }

                    // Down-Right, up one major third
                    const downRightCord = { x: x + 1, y: y + 1 };
                    const downRightNote = cordsToNote(downRightCord);
                    if (activeNotes.has(normalizeToSingleOctave(downRightNote))) {
                        const downRightNotePos = cordsToPosition(downRightCord);
                        notes.push(<Line key={`downright-${x}-${y}`} stroke={getIntervalColor(4)} strokeWidth={1.5} points={[xPos, yPos, downRightNotePos.x, downRightNotePos.y]} opacity={0.25} />);
                    }

                    // Note
                    notes.push(<Circle key={`${x}-${y}`} x={xPos} y={yPos} fill={"white"} radius={10} />);
                }
                notes.push(<Text key={`noteName${x}-${y}`} width={40} height={40} x={xPos - 20} y={yPos - 20} text={getNoteName(normalizedNote, activeNotes)} fontSize={14} fontFamily='monospace' fill={activeNotes.has(note) ? "rgb(37,37,37)" : "grey"} align="center" verticalAlign="middle" />);
                notes.push(<Circle key={`halo${x}-${y}`} x={xPos} y={yPos} stroke="rgba(255,255,255,0.1)" radius={20} />);

                // notes.push(<Line key={`3-${noteA}-${noteB}`} stroke={discColor} strokeWidth={1.5} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} opacity={0.25} />);
                // for (let i = 0; i < 6; i++) {

                // }

            }
        }

        const centerpoint = (<Circle radius={1} fill="white"></Circle>);

        return notes;
    }, [activeNotes, cordsToNote, cordsToPosition]);

    const fullRender = React.useMemo((
    ) => {
        const centerpoint = (<Circle radius={1} fill="white"></Circle>);


        return (
            <Group clipFunc={(ctx) => {
                ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
            }}>
                {/* <Circle radius={radius} stroke="rgba(255,255,255,0.1)"></Circle> */}
                {notes}
            </Group>
        );

    }, [notes, radius]);

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
