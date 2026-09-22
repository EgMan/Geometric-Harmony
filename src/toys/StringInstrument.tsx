import React from 'react';
import { Circle, Rect, Line, Text, Shape, Group } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { Button, MenuItem, Select } from '@mui/material';
import { getIntervalColor, getIntervalDistance, useActiveNoteNames } from '../utils/Utils';
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

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const GUITAR_TUNINGS: Record<string, { label: string; tuning: number[] }> = {
    standard: { label: "Standard (EADGBE)", tuning: [4, 9, 14, 19, 23, 28] },
    allFourths: { label: "All Fourths (EADGCF)", tuning: [4, 9, 14, 19, 24, 29] },
    allFourths7: { label: "All Fourths 7 String — The Best Tuning (BEADGCF)", tuning: [-1, 4, 9, 14, 19, 24, 29] },
    newStandard: { label: "Robert Fripp's \"New Standard\" (CGDAEG)", tuning: [0, 7, 14, 21, 28, 31] },
    allFifths: { label: "All Fifths (CGDAEB)", tuning: [0, 7, 14, 21, 28, 35] },
    allFifths7: { label: "All Fifths 7 String (FCGDAEB)", tuning: [-7, 0, 7, 14, 21, 28, 35] },
    dropD: { label: "Drop D (DADGBE)", tuning: [2, 9, 14, 19, 23, 28] },
    openG: { label: "Open G (DGDGBD)", tuning: [2, 7, 14, 19, 23, 26] },
    openD: { label: "Open D (DADF#AD)", tuning: [2, 9, 14, 18, 21, 26] },
    dadgad: { label: "DADGAD (DADGAD)", tuning: [2, 9, 14, 19, 21, 26] },
    halfDown: { label: "Half Step Down (D#G#C#F#A#D#)", tuning: [3, 8, 13, 18, 22, 27] },
};

type Props = {
    height: number
    width: number
    fretCount: number
} & WidgetComponentProps

function StringInstrument(props: Props) {
    const config = props.fromWidget.widgetConfig as StringWidgetConfig;
    const { colorPalette } = useAppTheme()!;

    const [tuning, setTuning] = React.useState(config.tuning);

    const tuningPreset = React.useMemo(() => {
        return Object.entries(GUITAR_TUNINGS).find(
            ([, preset]) => preset.tuning.length === tuning.length &&
                preset.tuning.every((val, i) => val === tuning[i])
        )?.[0] ?? "custom";
    }, [tuning]);

    const addString = React.useCallback(() => {
        setTuning(prev => {
            if (config.type === "harpejji") {
                return [...prev, prev[prev.length - 1] + 2];
            }
            return [prev[0] - 5, ...prev];
        });
    }, [config.type]);

    const removeStringAt = React.useCallback((index: number) => {
        setTuning(prev => prev.length <= 2 ? prev : prev.filter((_, i) => i !== index));
    }, []);

    const updateStringNote = React.useCallback((index: number, note: number) => {
        setTuning(prev => {
            const next = [...prev];
            next[index] = Math.floor(prev[index] / 12) * 12 + note;
            return next;
        });
    }, []);

    const updateStringOctave = React.useCallback((index: number, octave: number) => {
        setTuning(prev => {
            const next = [...prev];
            next[index] = octave * 12 + ((prev[index] % 12) + 12) % 12;
            return next;
        });
    }, []);

    const stringSpacing = props.width / (tuning.length - 1);

    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const checkEmphasis = useCheckNoteEmphasis();
    const combinedEmphasis = useGetCombinedModdedEmphasis();
    const emphasizedNotesOctaveGnostic = useNoteSet(NoteSet.Emphasized_OctaveGnostic).notes;
    const updateNotes = useUpdateNoteSet();
    const getNoteName = useActiveNoteNames();

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
    const [noteLabeling, setNoteLabeling] = React.useState(NoteLabling.ActiveNoteNames);
    const [fretCount, setFretCount] = React.useState(24);
    const fretSpacing = props.height / fretCount;
    const fretElemYOffset = -fretSpacing / 2;
    const circleElemRadius = Math.min(fretSpacing / 2, stringSpacing) / 2;

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
        (<tr key="fretcount">
            <td>Fret count</td>
            <td colSpan={2}>
                <Select
                    id="menu-dropdown"
                    value={fretCount}
                    onChange={e => setFretCount(e.target.value as number)}
                >
                    {[12, 18, 24, 36, 48].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                </Select>
            </td>
        </tr>),
        ...(config.type === "guitar" ? [(
            <tr key="tuning-preset">
                <td>Preset</td>
                <td colSpan={2}>
                    <Select
                        id="menu-dropdown"
                        value={tuningPreset}
                        onChange={e => {
                            const preset = GUITAR_TUNINGS[e.target.value as string];
                            if (preset) setTuning(preset.tuning);
                        }}
                    >
                        {Object.entries(GUITAR_TUNINGS).map(([key, { label }]) => (
                            <MenuItem key={key} value={key}>{label}</MenuItem>
                        ))}
                        {tuningPreset === "custom" && (
                            <MenuItem value="custom">Custom</MenuItem>
                        )}
                    </Select>
                </td>
            </tr>
        )] : []),
        (<tr key="tuning-strings">
            <td style={{ verticalAlign: 'top' }}>Strings</td>
            <td colSpan={2}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {tuning.map((semitone, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 11, width: 16, opacity: 0.5 }}>{i + 1}</span>
                            <Select
                                id="menu-dropdown"
                                value={((semitone % 12) + 12) % 12}
                                onChange={e => updateStringNote(i, e.target.value as number)}
                            >
                                {NOTE_NAMES.map((name, n) => <MenuItem key={n} value={n}>{name}</MenuItem>)}
                            </Select>
                            <Select
                                id="menu-dropdown"
                                value={Math.floor(semitone / 12)}
                                onChange={e => updateStringOctave(i, e.target.value as number)}
                            >
                                {[-1, 0, 1, 2, 3, 4].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                            </Select>
                            <Button size="small" onClick={() => removeStringAt(i)} disabled={tuning.length <= 2}>×</Button>
                        </div>
                    ))}
                    <Button size="small" onClick={addString}>+ Add String</Button>
                </div>
            </td>
        </tr>),
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

        for (let fretNum = 0; fretNum < fretCount; fretNum++) {
            const posY = getYPos(fretNum);
            fretElements.push(
                <Line key={`l1-${fretNum}`} stroke={colorPalette.Widget_Primary} strokeWidth={fretNum % 12 === 0 ? 6 : 3} points={[-circleElemRadius * 2, posY, props.width + circleElemRadius * 2, posY]} />
            );
            if (props.fromWidget.widgetConfig.type === "guitar" && [3, 5, 7, 9,].includes(fretNum % 12)) {
                const markerW = props.width * 0.309;
                const markerH = fretSpacing * 0.309;
                fretElements.push(
                    <Rect key={`c1-${fretNum}`} x={props.width / 2 - markerW / 2} y={posY - fretSpacing / 2 - markerH / 2} width={markerW} height={markerH} cornerRadius={5} fill={colorPalette.Widget_MutedPrimary} />
                );
            }
            if (fretNum % 12 === 0 && fretNum > 0) {
                const markerW = props.width * 0.309;
                const markerH = fretSpacing * 0.309;
                fretElements.push(
                    <Rect key={`c2-${fretNum}`} x={3 * props.width / 10 - markerW / 2} y={posY - fretSpacing / 2 - markerH / 2} width={markerW} height={markerH} cornerRadius={5} fill={colorPalette.Widget_MutedPrimary} />
                );
                fretElements.push(
                    <Rect key={`c3-${fretNum}`} x={7 * props.width / 10 - markerW / 2} y={posY - fretSpacing / 2 - markerH / 2} width={markerW} height={markerH} cornerRadius={5} fill={colorPalette.Widget_MutedPrimary} />
                );
            }
            tuning.forEach((openNote, stringNum) => {
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
                if (fretNum !== fretCount - 1) {
                    stringElements.push(
                        <Line key={`l2-${fretNum}-${stringNum}`} stroke={colorPalette.Widget_Primary} strokeWidth={1} points={[posX, posY, posX, posY + fretSpacing]} />
                    );
                }
                // if (noteDisplays.octaveGnostic[]) {
                //     emphasized.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={"red"}></Circle>)
                //     noteNames.push(
                //         <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 19} text={getNoteName(note, activeNotes)} fontSize={12} fontFamily='monospace' fill={colorPalette.Main_Background} align="center" verticalAlign="middle" />
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
                        <Text key={`playingNoteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 19} text={getNoteName(note)} fontSize={12} fontFamily='monospace' fill={colorPalette.Main_Background} align="center" verticalAlign="middle" />
                    )
                }

                if (activeNotes.has(note)) {
                    const noteColor = (note === homeNote) ? colorPalette.Note_Home : colorPalette.Note_Active;
                    activeNoteIndicators.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={noteColor}></Circle>)
                    if (!settings?.isPeaceModeEnabled && ([NoteLabling.ActiveNoteNames, NoteLabling.NoteNames].includes(noteLabeling) || fretNum === 0)) {
                        noteNames.push(
                            <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 19} text={getNoteName(note)} fontSize={12} fontFamily='monospace' fill={colorPalette.Main_Background} align="center" verticalAlign="middle" />
                        )
                    }
                } else if (!settings?.isPeaceModeEnabled && (noteLabeling === NoteLabling.NoteNames || fretNum === 0)) {
                    if (fretNum !== 0) stringElements.push(<Circle key={`activeInd${fretNum}-${stringNum}`} x={posX} y={posY + fretElemYOffset} radius={circleElemRadius} fill={colorPalette.Main_Background}></Circle>)
                    noteNames.push(
                        <Text key={`noteName${fretNum}-${stringNum}`} width={40} height={40} x={posX - 20} y={posY + fretElemYOffset - 19} text={getNoteName(note)} fontSize={12} fontFamily='monospace' fill={colorPalette.Widget_Primary} align="center" verticalAlign="middle" />
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
    }, [NoteLabling.ActiveNoteNames, NoteLabling.NoteNames, activeNotes, circleElemRadius, colorPalette.Main_Background, colorPalette.Note_Active, colorPalette.Note_Home, colorPalette.Widget_Primary, tuning, fretElemYOffset, fretSpacing, getNoteName, getXPos, getYPos, homeNote, noteDisplays.octaveGnostic, noteLabeling, fretCount, props.fromWidget.widgetConfig.type, props.width, setHomeNote, settings?.isPeaceModeEnabled, stringSpacing, updateNotes]);

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
            tuning.forEach((openNoteA, stringA) => {
                tuning.forEach((openNoteB, stringB) => {
                    for (let fretA = 0; fretA < fretCount; fretA++) {
                        for (let fretB = 0; fretB < fretCount; fretB++) {
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
    }, [channelDisplays.length, colorPalette, tuning, fretElemYOffset, fretSpacing, getXPos, getYPos, noteDisplays.octaveGnostic, fretCount, props.fromWidget.widgetConfig.type, props.height, stringSpacing, updateNotes]);

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