import React from 'react';
import { Circle, Group, Rect, Shape, Text } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { MenuItem, Select, Switch } from '@mui/material';
import { getIntervalColor, getIntervalDistance, getNoteName } from '../utils/Utils';
import { NoteSet, useCheckNoteEmphasis, useGetCombinedModdedEmphasis, useHomeNote, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import { KonvaEventObject } from 'konva/lib/Node';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';

const keyColor = "grey";
const noteToXOffsetFactor = [0, 1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6];
const blackKeyNums = [1, 3, 6, 8, 10];
const whiteKeyNums = [0, 2, 4, 5, 7, 9, 11];

type Props = {
    height: number
    width: number
    octaveCount: number
} & WidgetComponentProps;

function Piano(props: Props) {
    // Settings Storage

    const [octaveCount, setOctaveCount] = React.useState(props.octaveCount);

    const [displayInterval, setDisplayIntervals] = React.useState([true, true, true, true, true, true]);
    const setDisplayInterval = (index: number, value: boolean) => {
        const newDisplayInterval = displayInterval.slice();
        newDisplayInterval[index] = value;
        setDisplayIntervals(newDisplayInterval);
    }

    const [showNoteNames, setShowNoteNames] = React.useState(true);

    const [onlyShowIntervalsOnHover, setOnlyShowIntervalsOnHover] = React.useState(true);

    const [showInverseIntervals, setShowInverseIntervals] = React.useState(false);

    ///////////////////

    const settingsMenuItems = [
        (<tr>
            <td>OctaveCount</td>
            <td colSpan={2}>  <Select
                id="menu-dropdown"
                value={octaveCount}
                label="Octave Count"
                labelId="demo-simple-select-filled-label"
                onChange={e => { if (e.target.value === 1) { setShowInverseIntervals(true) } setOctaveCount(e.target.value as number) }}
            >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5</MenuItem>

            </Select></td>
        </tr>),
        (<tr>
            <td>Show Minor Seconds (Major Sevenths)</td>
            <td style={{ color: getIntervalColor(1), textAlign: "center" }}>■</td>
            <td><Switch color={"primary"} checked={displayInterval[0]} onChange={e => setDisplayInterval(0, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Major Seconds (Minor Sevenths)</td>
            <td style={{ color: getIntervalColor(2), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[1]} onChange={e => setDisplayInterval(1, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Minor Thirds (Major Sixths)</td>
            <td style={{ color: getIntervalColor(3), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[2]} onChange={e => setDisplayInterval(2, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Major Thirds (Minor Sixths)</td>
            <td style={{ color: getIntervalColor(4), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[3]} onChange={e => setDisplayInterval(3, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Perfect Fourths (Perfect Fifths)</td>
            <td style={{ color: getIntervalColor(5), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[4]} onChange={e => setDisplayInterval(4, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show Tritones</td>
            <td style={{ color: getIntervalColor(6), textAlign: "center" }}>■</td>
            <td><Switch checked={displayInterval[5]} onChange={e => setDisplayInterval(5, e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Only show intervals on <span style={{ color: "red" }}>emmphasized</span> notes</td>
            <td style={{ textAlign: "center" }}></td>
            <td><Switch checked={onlyShowIntervalsOnHover} onChange={e => setOnlyShowIntervalsOnHover(e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show inverse intervals</td>
            <td style={{ textAlign: "center" }}>⤡</td>
            <td><Switch checked={showInverseIntervals} onChange={e => setShowInverseIntervals(e.target.checked)} /></td>
        </tr>),
        (<tr>
            <td>Show note names</td>
            <td style={{ textAlign: "center" }}>♯</td>
            <td><Switch checked={showNoteNames} onChange={e => setShowNoteNames(e.target.checked)} /></td>
        </tr>),
    ];

    // offsets to make x, y in props dictate location of bottom center of full piano
    const XglobalKeyOffset = (props.width * octaveCount / -2);
    const YglobalKeyOffset = -props.height;

    const activeNotes = useNoteSet()(NoteSet.Active);
    const combinedEmphasis = useGetCombinedModdedEmphasis()();
    const emphasizedNotesOctaveGnostic = useNoteSet()(NoteSet.Emphasized_OctaveGnostic);
    const checkEmphasis = useCheckNoteEmphasis();
    const updateNotes = useUpdateNoteSet();

    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();

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
        const extraProps = { stroke: keyColor, strokeWidth: 2 }
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
        const extraProps = { fill: keyColor }
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

    const getAbsoluteNoteNum = React.useCallback((note: number, octave: number) => {
        return note + (octave * 12);
    }, []);

    const keys = React.useMemo(() => {
        var keys: JSX.Element[] = [];
        let activeNoteIndicators: JSX.Element[] = [];
        let emphasized: JSX.Element[] = [];
        let clickListenersArr: JSX.Element[] = [];
        let noteNames: JSX.Element[] = [];
        const keyNumsInOrder = [...whiteKeyNums, ...blackKeyNums];
        for (let i = 0; i < octaveCount; i++) {
            for (let note of keyNumsInOrder) {
                const noteprops = getPropsForNote(note, i);
                const absoluteNoteNum = getAbsoluteNoteNum(note, i);

                // TODO unify this across components
                const toggleActive = (evt: KonvaEventObject<MouseEvent>) => {
                    if (evt.evt.button === 2) {
                        setHomeNote((note === homeNote) ? null : note);
                    }
                    else {
                        updateNotes(NoteSet.Active, [note], !activeNotes.has(note));
                    }
                };
                keys.push(
                    <Rect
                        key={`key${i}-${note}`}
                        x={noteprops.xpos + noteprops.individualKeyOffset}
                        y={YglobalKeyOffset}
                        width={noteprops.keyWidth}
                        height={noteprops.keyHeight}
                        {...noteprops.extraProps} />
                );
                if (activeNotes.has(note)) {
                    const noteColor = note === homeNote ? "yellow" : "white";
                    activeNoteIndicators.push(
                        <Circle
                            key={`activeInd${i}-${note}`}
                            x={noteprops.xpos + noteprops.individualActiveIndicaterOffset}
                            y={noteprops.activeIndicatorY}
                            width={noteprops.activeIndicatorWidth}
                            height={noteprops.activeIndicatorWidth}
                            fill={noteColor} />
                    );
                }
                if (checkEmphasis(absoluteNoteNum, true))
                    emphasized.push(
                        <Circle
                            key={`emphaInd${i}-${note}`}
                            x={noteprops.xpos + noteprops.individualActiveIndicaterOffset}
                            y={noteprops.activeIndicatorY}
                            width={noteprops.activeIndicatorWidth}
                            height={noteprops.activeIndicatorWidth}
                            fill={"red"} />);
                clickListenersArr.push(
                    <Rect
                        key={`keyHitbox${i}-${note}`}
                        x={noteprops.xpos + noteprops.individualKeyOffset}
                        y={YglobalKeyOffset}
                        width={noteprops.keyWidth}
                        height={noteprops.keyHeight}
                        onClick={toggleActive}
                        onTap={toggleActive}
                        onMouseOver={() => updateNotes([NoteSet.Emphasized_OctaveGnostic], [absoluteNoteNum], true, true)}
                        onMouseOut={() => updateNotes(NoteSet.Emphasized_OctaveGnostic, [absoluteNoteNum], false)} />);
                if (showNoteNames) {

                    // noteNames.push(<Text key={`noteName${i}`} width={40} height={40} x={noteLoc.x-20} y={noteLoc.y-20} text={getNoteName(i)} fontSize={14} fontFamily='monospace' fill={activeNotes.has(i) ? "black" : "grey"} align="center" verticalAlign="middle" />);
                    const nameColor = activeNotes.has(note) ? "black" : (blackKeyNums.includes(note) ? "rgb(37,37,37)" : "grey");
                    noteNames.push(
                        <Text
                            key={`noteName${note}${i}`}
                            width={40}
                            height={40}
                            x={noteprops.xpos + noteprops.individualActiveIndicaterOffset - 20}
                            y={noteprops.activeIndicatorY - 20}
                            text={getNoteName(note, activeNotes)}
                            fontSize={12}
                            fontFamily='monospace'
                            fill={nameColor}
                            align="center"
                            verticalAlign="middle" />
                    );
                }
            }
        }
        return {
            keys,
            noteNames,
            activeNoteIndicators,
            emphasized,
            clickListenersArr,
        };
    }, [YglobalKeyOffset, activeNotes, checkEmphasis, getAbsoluteNoteNum, getPropsForNote, homeNote, octaveCount, setHomeNote, showNoteNames, updateNotes]);

    const intervals = React.useMemo(() => {
        var intervalLines: JSX.Element[] = [];
        var emphasized: JSX.Element[] = [];
        var touchListeners: JSX.Element[] = [];
        const activeNoteArr = Array.from(activeNotes);

        for (let octaveA = 0; octaveA < octaveCount; octaveA++) {
            for (let octaveB = octaveA; octaveB <= Math.min(octaveA + 1, octaveCount - 1); octaveB++) {
                for (let a = 0; a < activeNoteArr.length; a++) {
                    for (let b = 0; b < activeNoteArr.length; b++) {
                        const noteA = activeNoteArr[a];
                        const noteB = activeNoteArr[b];

                        const absoluteNoteA = getAbsoluteNoteNum(noteA, octaveA);
                        const absoluteNoteB = getAbsoluteNoteNum(noteB, octaveB);
                        const absoluteInverval = [absoluteNoteA, absoluteNoteB];

                        const propsA = getPropsForNote(noteA, octaveA);
                        const propsB = getPropsForNote(noteB, octaveB);

                        const aLoc = { x: propsA.xpos + propsA.individualActiveIndicaterOffset, y: propsA.activeIndicatorY };
                        const bLoc = { x: propsB.xpos + propsB.individualActiveIndicaterOffset, y: propsB.activeIndicatorY };


                        const dist = getIntervalDistance(noteA, noteB, 12);
                        const discColor = getIntervalColor(dist);
                        const absoluteDist = Math.abs((noteA + (12 * octaveA)) - (noteB + (12 * octaveB)));

                        if (onlyShowIntervalsOnHover) {
                            if (combinedEmphasis.size === 0)
                                continue;
                            if (combinedEmphasis.size === 1)
                                continue;
                            // To instead show all intervals between the single emphasized note
                            // if (emphasizedNotes.size === 1 && !emphasizedNotes.has(noteA) && !emphasizedNotes.has(noteB))
                            //     continue;
                            if (combinedEmphasis.size >= 2 && (!combinedEmphasis.has(noteA) || !combinedEmphasis.has(noteB)))
                                continue;
                        }

                        if (!displayInterval[dist - 1]) {
                            continue;
                        }

                        if (showInverseIntervals && absoluteDist > 12 - dist) {
                            continue;
                        }
                        if (!showInverseIntervals && absoluteDist > dist) {
                            continue;
                        }

                        const emphasize = () => {
                            updateNotes([NoteSet.Emphasized_OctaveGnostic], absoluteInverval, true, true);
                        };
                        const deemphasize = () => {
                            updateNotes([NoteSet.Emphasized_OctaveGnostic], absoluteInverval, false);
                        };
                        const isIntervalEmphasized = emphasizedNotesOctaveGnostic.size > 0 ? emphasizedNotesOctaveGnostic.has(absoluteNoteA) && emphasizedNotesOctaveGnostic.has(absoluteNoteB) : combinedEmphasis.has(noteA) && combinedEmphasis.has(noteB);

                        intervalLines.push(
                            <Shape
                                sceneFunc={(context, shape) => {
                                    context.beginPath();
                                    context.moveTo(aLoc.x, aLoc.y);
                                    context.bezierCurveTo(
                                        aLoc.x,
                                        aLoc.y - (props.height * (absoluteDist + absoluteDist) / (12)),
                                        bLoc.x,
                                        bLoc.y - (props.height * (absoluteDist + absoluteDist) / (12)),
                                        bLoc.x,
                                        bLoc.y
                                    );
                                    context.strokeShape(shape);
                                }}
                                stroke={discColor}
                                strokeWidth={isIntervalEmphasized ? 3 : 1.5}
                            />
                        );
                        touchListeners.push(
                            <Shape
                                sceneFunc={(context, shape) => {
                                    context.beginPath();
                                    context.moveTo(aLoc.x, aLoc.y);
                                    context.bezierCurveTo(
                                        aLoc.x,
                                        aLoc.y - (props.height * (absoluteDist + absoluteDist) / (12)),
                                        bLoc.x,
                                        bLoc.y - (props.height * (absoluteDist + absoluteDist) / (12)),
                                        bLoc.x,
                                        bLoc.y
                                    );
                                    context.strokeShape(shape);
                                }}
                                stroke={'rgba(0,0,0,0)'}
                                strokeWidth={3}
                                onTouchStart={emphasize} onTouchEnd={deemphasize} onMouseOver={emphasize} onMouseOut={deemphasize}
                            />
                        );
                    }
                }
            }
        }
        return {
            line: intervalLines,
            emphasized: emphasized,
            listeners: touchListeners,
        }
    }, [activeNotes, combinedEmphasis, displayInterval, emphasizedNotesOctaveGnostic, getAbsoluteNoteNum, getPropsForNote, octaveCount, onlyShowIntervalsOnHover, props.height, showInverseIntervals, updateNotes]);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group>
                {keys.keys}
                {intervals.line}
                {intervals.emphasized}
                {keys.activeNoteIndicators}
                {keys.emphasized}
                {keys.noteNames}
                {keys.clickListenersArr}
                {intervals.listeners}
            </Group>
        );
    }, [intervals, keys]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={settingsMenuItems} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export default Piano;