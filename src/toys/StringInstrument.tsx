import React from 'react';
import { Circle, Rect, Line, Text, Shape, Group } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { MenuItem, Select } from '@mui/material';
import { getIntervalColor, getIntervalDistance, getNoteName } from '../utils/Utils';
import { NoteSet, normalizeToSingleOctave, useChannelDisplays, useCheckNoteEmphasis, useGetCombinedModdedEmphasis, useHomeNote, useNoteDisplays, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import { KonvaEventObject } from 'konva/lib/Node';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { useSettings } from '../view/SettingsProvider';
import { useAppTheme } from '../view/ThemeManager';
import { WidgetConfig } from '../view/ViewManager';

interface StringWidgetConfig extends WidgetConfig {
    tuning: number[],
}

export const WidgetConfig_String_Guitar: StringWidgetConfig = {
    type: "guitar",
    displayName: "Guitar",
    tuning: [4, 9, 14, 19, 23, 28],
}

export const WidgetConfig_String_Harpejji: StringWidgetConfig = {
    type: "harpejji",
    displayName: "Harpejji",
    tuning: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24]
}

type Props = {
    height: number
    width: number
    fretCount: number
} & WidgetComponentProps

function StringInstrument(props: Props) {
    const config = props.fromWidget.widgetConfig as StringWidgetConfig;
    const { colorPalette } = useAppTheme()!;
    const stringSpacing = props.width / (config.tuning.length - 1);
    const fretSpacing = props.height / props.fretCount;
    const fretElemYOffset = -fretSpacing / 2;
    const circleElemRadius = stringSpacing / 5;

    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const checkEmphasis = useCheckNoteEmphasis();
    const combinedEmphasis = useGetCombinedModdedEmphasis();
    const emphasizedNotesOctaveGnostic = useNoteSet(NoteSet.Emphasized_OctaveGnostic).notes;
    const updateNotes = useUpdateNoteSet();

    const channelDisplays = useChannelDisplays();
    const noteDisplays = useNoteDisplays();

    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();

    const settings = useSettings();

    enum NoteLabling {
        None = 1,
        NoteNames,
        ActiveNoteNames,
    }
    const [noteLabeling, setNoteLabeling] = React.useState(NoteLabling.None);

    // TODO add this back in
    // enum IntervalDisplayType {
    //     Active_No_Inverse,
    //     Active_With_Inverse,
    //     Playing,
    // }

    // const [intervalDisplay, setIntervalDisplay] = React.useState(IntervalDisplayType.Active_No_Inverse);

    const settingsMenuItems = [
        (<tr key="tr0">
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
        // (<tr>
        //     <td>Display Intervals For</td>
        //     <td colSpan={2}><Select
        //         id="menu-dropdown"
        //         value={intervalDisplay}
        //         label="Interval Display Type"
        //         labelId="demo-simple-select-filled-label"
        //         onChange={e => { setIntervalDisplay(e.target.value as number) }}
        //     >
        //         <MenuItem value={IntervalDisplayType.Active_No_Inverse}>Active Notes</MenuItem>
        //         <MenuItem value={IntervalDisplayType.Playing}>Playing Notes</MenuItem>
        //     </Select></td>
        // </tr>),
    ];

    const getXPos = React.useCallback((stringNum: number): number => { return (stringSpacing * stringNum) }, [stringSpacing])
    const getYPos = React.useCallback((fretNum: number): number => { return (fretSpacing * fretNum) }, [fretSpacing])

    const elems = React.useMemo(() => {
        let stringElements: JSX.Element[] = [];
        let fretElements: JSX.Element[] = [];
        let noteNames: JSX.Element[] = [];
        let activeNoteIndicators: JSX.Element[] = [];
        let emphasized: JSX.Element[] = [];
        let clickListeners: JSX.Element[] = [];

        for (let fretNum = 0; fretNum < props.fretCount; fretNum++) {
            const posY = getYPos(fretNum);
            fretElements.push(
                <Line key={`l1-${fretNum}`} stroke={colorPalette.Widget_Primary} strokeWidth={3} points={[0, posY, props.width, posY]} />
            );
            if (props.fromWidget.widgetConfig.type === "guitar" && [3, 5, 7, 9,].includes(fretNum % 12)) {
                fretElements.push(
                    <Circle key={`c1-${fretNum}`} x={props.width / 2} y={posY + fretElemYOffset} radius={stringSpacing / 6} fill={colorPalette.Widget_Primary} />
                );
            }
            if (fretNum % 12 === 0 && fretNum > 0) {
                fretElements.push(
                    <Circle key={`c2-${fretNum}`} x={3 * props.width / 10} y={posY + fretElemYOffset} radius={stringSpacing / 6} fill={colorPalette.Widget_Primary} />
                );
                fretElements.push(
                    <Circle key={`c3-${fretNum}`} x={7 * props.width / 10} y={posY + fretElemYOffset} radius={stringSpacing / 6} fill={colorPalette.Widget_Primary} />
                );
            }
            config.tuning.forEach((openNote, stringNum) => {
                const posX = getXPos(stringNum);
                if (props.fromWidget.widgetConfig.type === "harpejji") {

                }

                const absoluteNote = props.fromWidget.widgetConfig.type === "guitar" ? (openNote + fretNum) : (openNote - fretNum);
                const note = (absoluteNote + (12 * 12)) % 12;
                // <Line x={props.x} y={props.y} stroke={discColor} strokeWidth={lineWidth} points={[aLoc.x, aLoc.y, bLoc.x, bLoc.y]} />

                if (props.fromWidget.widgetConfig.type === "harpejji" && fretNum !== 0) {
                    const markingWidth = Math.min(stringSpacing / 3, fretSpacing / 3)
                    switch (note) {
                        case 0:
                            const cNoteStrokeWidth = 3;
                            fretElements.push(
                                <Circle
                                    key={`harpejjinotemarking-${absoluteNote}-${stringNum}`}
                                    // x={7 * props.width / 10} 
                                    // y={posY + fretElemYOffset} 
                                    x={posX}
                                    y={posY + fretElemYOffset}
                                    radius={markingWidth - (cNoteStrokeWidth / 2)}
                                    strokeWidth={cNoteStrokeWidth}
                                    stroke={colorPalette.Widget_Primary} />
                            );
                            break;
                        case 2:
                        case 4:
                        case 5:
                        case 9:
                        case 11:
                            fretElements.push(
                                <Circle
                                    key={`harpejjinotemarking-${absoluteNote}-${stringNum}`}
                                    // x={7 * props.width / 10} 
                                    // y={posY + fretElemYOffset} 
                                    x={posX}
                                    y={posY + fretElemYOffset}
                                    radius={markingWidth}
                                    fill={colorPalette.Widget_Primary} />
                            );
                            break;
                        case 7:
                            fretElements.push(
                                <Circle
                                    key={`harpejjinotemarking-${absoluteNote}-${stringNum}`}
                                    // x={7 * props.width / 10} 
                                    // y={posY + fretElemYOffset} 
                                    x={posX}
                                    y={posY + fretElemYOffset}
                                    radius={markingWidth}
                                    fill={colorPalette.Widget_Primary} />
                            );
                            fretElements.push(
                                <Line
                                    stroke={colorPalette.Widget_Primary}
                                    strokeWidth={3}
                                    points={[posX - (stringSpacing / 2.5), posY + fretElemYOffset, posX + (stringSpacing / 2.5), posY + fretElemYOffset]
                                    }
                                />
                            );
                            break;
                        case 1:
                        case 3:
                        case 6:
                        case 8:
                        case 10:
                            // fretElements.push(
                            //     <Circle
                            //         key={`harpejjinotemarking-${absoluteNote}-${stringNum}`}
                            //         // x={7 * props.width / 10} 
                            //         // y={posY + fretElemYOffset} 
                            //         x={posX}
                            //         y={posY + fretElemYOffset}
                            //         radius={stringSpacing / 3}
                            //         fill={colorPalette.Widget_MutedPrimary} />
                            // );
                            break;
                        default:
                            break;
                    }
                }

                const toggleActive = (evt: KonvaEventObject<MouseEvent>) => {
                    if (evt.evt.button === 2) {
                        setHomeNote((note === homeNote) ? null : note);
                    }
                    else {
                        updateNotes(NoteSet.Active, [note], !activeNotes.has(note));
                    }
                };
                if (fretNum !== props.fretCount - 1) {
                    stringElements.push(
                        <Line key={`l2-${fretNum}-${stringNum}`} stroke={colorPalette.Widget_Primary} strokeWidth={1} points={[posX, posY, posX, posY + fretSpacing]} />
                    );
                }
                // if (noteDisplays.octaveGnostic[]) {
                //     emphasized.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={"red"}></Circle>)
                //     noteNames.push(
                //         <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={colorPalette.Main_Background} align="center" verticalAlign="middle" />
                //     )
                // }

                noteDisplays.octaveGnostic[absoluteNote]?.forEach((channel, idx) => {
                    emphasized.push(
                        <Circle key={`activeInd${fretNum}-${stringNum}-${channel.name}`}
                            x={posX}
                            y={posY + fretElemYOffset}
                            radius={circleElemRadius}
                            opacity={1 / (idx + 1)}
                            fill={channel.color ?? "green"}
                        />);
                    emphasized.push(
                        <Rect key={`activeIndrect${fretNum}-${stringNum}-${channel.name}`}
                            x={posX - (stringSpacing / 2)}
                            y={posY + fretElemYOffset - (fretSpacing / 2)}
                            radius={circleElemRadius}
                            opacity={1 / (idx + 1)}
                            fill={channel.color ?? "green"}
                            width={stringSpacing}
                            height={fretSpacing}
                            cornerRadius={9}
                        />);

                });

                if (noteDisplays.octaveGnostic[absoluteNote]?.length > 0) {
                    noteNames.push(
                        <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={colorPalette.Main_Background} align="center" verticalAlign="middle" />
                    )
                }
                if (activeNotes.has(note)) {
                    const noteColor = (note === homeNote) ? colorPalette.Note_Home : colorPalette.Note_Active;
                    activeNoteIndicators.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={noteColor}></Circle>)
                    if (!settings?.isPeaceModeEnabled && ([NoteLabling.ActiveNoteNames, NoteLabling.NoteNames].includes(noteLabeling) || fretNum === 0)) {
                        noteNames.push(
                            <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={colorPalette.Main_Background} align="center" verticalAlign="middle" />
                        )
                    }
                } else if (!settings?.isPeaceModeEnabled && (noteLabeling === NoteLabling.NoteNames || fretNum === 0)) {
                    if (fretNum !== 0) stringElements.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={colorPalette.Main_Background}></Circle>)
                    noteNames.push(
                        <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 20} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={colorPalette.Widget_Primary} align="center" verticalAlign="middle" />
                    )
                }

                clickListeners.push(<Rect key={`keyHitbox${fretNum}-${stringNum}`} x={posX - (stringSpacing / 2)} y={posY + fretElemYOffset - (fretSpacing / 2)} width={stringSpacing} height={fretSpacing} onClick={toggleActive} onTap={toggleActive} onMouseOver={() => updateNotes(NoteSet.Emphasized_OctaveGnostic, [absoluteNote], true, true)} onMouseOut={() => updateNotes(NoteSet.Emphasized_OctaveGnostic, [absoluteNote], false)}></Rect>)
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
    }, [NoteLabling.ActiveNoteNames, NoteLabling.NoteNames, activeNotes, circleElemRadius, colorPalette.Main_Background, colorPalette.Note_Active, colorPalette.Note_Home, colorPalette.Widget_Primary, config.tuning, fretElemYOffset, fretSpacing, getXPos, getYPos, homeNote, noteDisplays.octaveGnostic, noteLabeling, props.fretCount, props.fromWidget.widgetConfig.type, props.width, setHomeNote, settings?.isPeaceModeEnabled, stringSpacing, updateNotes]);

    const getOrgnogonalUnitVect = (x: number, y: number) => {
        const mag = Math.sqrt(x * x + y * y);
        return { x: -y / mag, y: x / mag }
    }

    const intervals = React.useMemo(() => {
        var intervalLines: JSX.Element[] = [];
        var emphasized: JSX.Element[] = [];
        var touchListeners: JSX.Element[] = [];
        // for (let stringA = 0; stringA < props.tuning.length; stringA++) {
        //     for (let stringB = 0; stringB <= props.tuning.length; stringB++) {

        // Todo also check if note displays size is greater than one
        if (channelDisplays.length > 0)
            config.tuning.forEach((openNoteA, stringA) => {
                config.tuning.forEach((openNoteB, stringB) => {
                    for (let fretA = 0; fretA < props.fretCount; fretA++) {
                        for (let fretB = 0; fretB < props.fretCount; fretB++) {
                            if (stringA === stringB) continue;

                            const fretDist = Math.abs(fretA - fretB);
                            const stringDist = Math.abs(stringA - stringB);
                            if (fretDist + stringDist > 12 / 2) continue;

                            // const noteA = activeNoteArr[a];
                            // const noteB = activeNoteArr[b];
                            const absoluteNoteA = props.fromWidget.widgetConfig.type === "guitar" ? (openNoteA + fretA) : (openNoteA - fretA);
                            const absoluteNoteB = props.fromWidget.widgetConfig.type === "guitar" ? (openNoteB + fretB) : (openNoteB - fretB);

                            if (absoluteNoteA > absoluteNoteB) continue;

                            const noteA = normalizeToSingleOctave(absoluteNoteA);
                            const noteB = normalizeToSingleOctave(absoluteNoteB);
                            const absoluteInverval = [absoluteNoteA, absoluteNoteB];

                            // const propsA = getPropsForNote(noteA, octaveA);
                            // const propsB = getPropsForNote(noteB, octaveB);

                            const aLoc = { x: getXPos(stringA), y: getYPos(fretA) + fretElemYOffset };
                            const bLoc = { x: getXPos(stringB), y: getYPos(fretB) + fretElemYOffset };


                            const dist = getIntervalDistance(noteA, noteB, 12);
                            const discColor = getIntervalColor(dist, colorPalette);
                            const absoluteDist = Math.abs(absoluteNoteA - absoluteNoteB);
                            if (dist === 0) continue;

                            // todo add this in
                            // if (onlyShowIntervalsOnHover) {
                            // if (combinedEmphasis.size === 0)
                            //     continue;
                            // if (combinedEmphasis.size === 1)
                            //     continue;

                            // if (noteDisplays.octaveGnostic.)
                            //     continue;

                            // To instead show all intervals between the single emphasized note
                            // if (emphasizedNotes.size === 1 && !emphasizedNotes.has(noteA) && !emphasizedNotes.has(noteB))
                            //     continue;

                            // if (combinedEmphasis.size >= 2 && (!combinedEmphasis.has(noteA) || !combinedEmphasis.has(noteB))) {
                            if ((noteDisplays.octaveGnostic[absoluteNoteA]?.length ?? 0) === 0 || (noteDisplays.octaveGnostic[absoluteNoteB]?.length ?? 0) === 0 || !noteDisplays.octaveGnostic[absoluteNoteA]?.some(someNoteA => noteDisplays.octaveGnostic[absoluteNoteB]?.some(someNoteB => someNoteA.name === someNoteB.name))) {
                                continue;
                            }
                            // }

                            // if (!displayInterval[dist - 1]) {
                            //     continue;
                            // }

                            const showInverseIntervals = true;//todo remove this

                            // if (showInverseIntervals && absoluteDist > 12 - dist) {
                            //     continue;
                            // }
                            if (!showInverseIntervals && absoluteDist > dist) {
                                continue;
                            }

                            const emphasize = () => {
                                updateNotes([NoteSet.Emphasized_OctaveGnostic], absoluteInverval, true, true);
                            };
                            const deemphasize = () => {
                                updateNotes([NoteSet.Emphasized_OctaveGnostic], absoluteInverval, false);
                            };
                            // const isIntervalEmphasized = emphasizedNotesOctaveGnostic.size > 0 ? emphasizedNotesOctaveGnostic.has(absoluteNoteA) && emphasizedNotesOctaveGnostic.has(absoluteNoteB) : combinedEmphasis.has(noteA) && combinedEmphasis.has(noteB);
                            // if (emphasizedNotesOctaveGnostic.size > 0 && !isIntervalEmphasized) continue;

                            const orthoVect = getOrgnogonalUnitVect(aLoc.x - bLoc.x, aLoc.y - bLoc.y);
                            intervalLines.push(
                                <Shape
                                    key={`interval${fretA}-${fretB}-${stringA}-${stringB}`}
                                    sceneFunc={(context, shape) => {
                                        context.beginPath();
                                        context.moveTo(aLoc.x, aLoc.y);
                                        context.bezierCurveTo(
                                            aLoc.x + 2 * (fretSpacing + stringSpacing) * (orthoVect.x / 12),
                                            aLoc.y + 2 * (fretSpacing + stringSpacing) * (orthoVect.y / 12),
                                            bLoc.x + 2 * (fretSpacing + stringSpacing) * (orthoVect.x / 12),
                                            bLoc.y + 2 * (fretSpacing + stringSpacing) * (orthoVect.y / 12),
                                            bLoc.x,
                                            bLoc.y
                                        );
                                        context.strokeShape(shape);
                                    }}
                                    stroke={discColor}
                                    // strokeWidth={isIntervalEmphasized ? 3 : 1.5}
                                    strokeWidth={5}
                                    opacity={0.225}
                                    shadowEnabled={true}
                                    shadowColor={'white'}
                                    shadowOpacity={0.5}
                                    shadowBlur={5}
                                />
                            );
                            touchListeners.push(
                                <Shape
                                    key={`touchlisten${fretA}-${fretB}-${stringA}-${stringB}`}
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
                });
            });
        return {
            line: intervalLines,
            emphasized: emphasized,
            listeners: touchListeners,
        }
    }, [channelDisplays.length, colorPalette, config.tuning, fretElemYOffset, fretSpacing, getXPos, getYPos, noteDisplays.octaveGnostic, props.fretCount, props.fromWidget.widgetConfig.type, props.height, stringSpacing, updateNotes]);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group>
                {elems.frets}
                {elems.strings}
                {elems.emphasized}
                {intervals.line}
                {intervals.emphasized}
                {elems.noteIndicators}
                {elems.noteNames}
                {elems.clickListeners}
            </Group>
        );
    }, [elems.clickListeners, elems.emphasized, elems.frets, elems.noteIndicators, elems.noteNames, elems.strings, intervals.emphasized, intervals.line]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={settingsMenuItems} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export default StringInstrument;