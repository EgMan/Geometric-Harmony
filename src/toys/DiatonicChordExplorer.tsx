import React from 'react';
import { Group, Rect, Text } from 'react-konva';
import { WidgetComponentProps } from '../view/Widget';
import { KonvaEventObject } from 'konva/lib/Node';
import { useGetActiveNotesInCommonWithModulation, useModulateActiveNotes } from '../sound/HarmonicModulation';
import { useActiveNoteNames } from '../utils/Utils';
import { NoteChannel, NoteSet, normalizeToSingleOctave, useChannelDisplays, useGetCombinedModdedEmphasis, useHomeNote, useNoteDisplays, useNoteSet, useSetHomeNote, useUpdateNoteSet } from '../sound/NoteProvider';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { useSettings } from '../view/SettingsProvider';
import { useAppTheme } from '../view/ThemeManager';
import { useChannelDisplaysExactFits, useDiatonicRomanNumerals, useGetActiveShapeScaleDegreeFromNote, useGetDiatonicFits } from './HarmonyAnalyzer';
type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

function DiatonicChordExplorer(props: Props) {
    const radius = Math.min(props.width, props.height) / 2;
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const inputNotes = useNoteSet(NoteSet.PlayingInput, true).notes;

    const emphasizedNotes = useGetCombinedModdedEmphasis();
    const updateNotes = useUpdateNoteSet();
    const getNotesInCommon = useGetActiveNotesInCommonWithModulation();
    const homeNote = useHomeNote();
    const setHomeNote = useSetHomeNote();
    const channelDisplays = useChannelDisplays();
    const noteDisplays = useNoteDisplays();
    const getNoteName = useActiveNoteNames();


    const modulateActiveNotes = useModulateActiveNotes();

    const [highlightedNotes, setHighlightedNotes] = React.useState(new Set<number>());

    const getScaleDegree = useGetActiveShapeScaleDegreeFromNote();

    const channelDisplaysExactFits = useChannelDisplaysExactFits();

    // Settings Storage

    const [displayInterval, setDisplayIntervals] = React.useState([true, true, true, true, true, true]);
    const setDisplayInterval = (index: number, value: boolean) => {
        const newDisplayInterval = displayInterval.slice();
        newDisplayInterval[index] = value;
        setDisplayIntervals(newDisplayInterval);
    }


    const [showNoteNames, setShowNoteNames] = React.useState(true);

    const settings = useSettings();
    const { colorPalette } = useAppTheme()!;

    const diatonicData = useGetDiatonicFits();
    const diatonicFits = diatonicData.exactFits;
    const colCount = diatonicData.maxChordsPerNote + 1;
    //todo replace
    const rowCount = diatonicData.noteCount;

    const tilePadding = 1;

    const horrizontalElemOffset = props.width / colCount;
    const tileWidth = horrizontalElemOffset - tilePadding;

    const verticalElemOffset = props.height / rowCount;
    const tileHeight = verticalElemOffset - tilePadding;
    // const tileHeight = tileWidth;
    // const verticalElemOffset = tileHeight + tilePadding;
    const fitChannelMap = React.useMemo(() => {
        // const map = new Map<String, NoteChannel[]>();
        const obj: { [key: string]: NoteChannel[] } = {}
        //todo memoize
        channelDisplaysExactFits.forEach((channelDisplay, idx) => {
            channelDisplay.exactFits.forEach((fit) => {
                // console.log("fit", fit.shape.name, map.get(fit.shape.name))
                // if (map.get(fit.shape.name) === undefined) {
                //     console.log("what", fit.shape.name, [channelDisplay.channel])
                //     map.set(fit.shape.name, []);
                // }
                // else {
                //     console.log("aaaahhhhh", map.get(fit.shape.name)!.concat([channelDisplay.channel]))
                //     map.set(fit.shape.name, map.get(fit.shape.name)!.concat([channelDisplay.channel]));
                // }

                const key = fit.rootNote + ":" + fit.shape.name;
                if (obj[key] === undefined) {
                    // console.log("what", fit.shape.name, [channelDisplay.channel])
                    obj[key] = [];
                    // map.set(fit.shape.name, []);
                }
                // console.log("aaaahhhhh", map.get(fit.shape.name)!.concat([channelDisplay.channel]))
                // .set(fit.shape.name, map.get(fit.shape.name)!.concat([channelDisplay.channel]));
                obj[key].push(channelDisplay.channel);
            });
        });
        return obj;
    }, [channelDisplaysExactFits]);

    const romanNumerals = useDiatonicRomanNumerals();

    const chordDisplay = React.useMemo(() => {
        const elems: JSX.Element[] = [];

        for (let i = 0; i < romanNumerals.length; i++) {
            elems.push(
                <Text key={i} text={romanNumerals[i]} x={0} y={i * verticalElemOffset} fill={colorPalette.Widget_Primary}
                    width={tileWidth} height={tileHeight} align='center' verticalAlign='middle' />
            );
        }

        diatonicFits.forEach((fitsByNote, noteIdx) => {
            fitsByNote.forEach((fit, fitIdx) => {
                const chordNotes: number[] = fit.shape.notes.map((note, idx) => {
                    if (note[0] === false) return -1;
                    return normalizeToSingleOctave(idx + fit.rootNote);
                })
                    .filter(note => note !== -1);

                // Voicing (currently closed aescending from root)
                // TODO configurable voicings
                for (let i = 1; i < chordNotes.length; i++) {
                    while (chordNotes[i] <= chordNotes[i - 1]) {
                        chordNotes[i] += 12;
                    }
                }

                // Open up voicing a bit for tetratic+ chords
                // Move extensions up an octave
                if (chordNotes.length > 3) {
                    for (let i = 1; i < chordNotes.length; i++) {
                        const interval = chordNotes[i] - chordNotes[0];
                        // ♭9, 9, 11, #11, ♭13, 13
                        if ([1, 2, 5, 6, 8, 9].includes(interval) && chordNotes[i] <= chordNotes[i - 1] + 2) {
                            chordNotes[i] += 12;
                        }
                    }
                }

                // TODO multiple channels
                const key = fit.rootNote + ":" + fit.shape.name;
                const tileColor = fitChannelMap[key] ? fitChannelMap[key]![0]?.color : colorPalette.UI_Background;

                elems.push(
                    <Group key={`${noteIdx} - ${fitIdx}`} x={(fitIdx + 1) * horrizontalElemOffset}
                        y={(getScaleDegree(noteIdx) - 1) * verticalElemOffset}>
                        <Rect
                            width={tileWidth}
                            height={tileHeight}
                            fill={tileColor}
                            cornerRadius={5}
                            onMouseEnter={(e: KonvaEventObject<MouseEvent>) => {
                                // fit.shape.notes.filter(note => note[0]).
                                updateNotes(NoteSet.Emphasized_OctaveGnostic, chordNotes, true)
                                console.log("eg " + chordNotes);
                            }}
                            onMouseLeave={(e: KonvaEventObject<MouseEvent>) => {
                                updateNotes(NoteSet.Emphasized_OctaveGnostic, chordNotes, false);
                            }}
                        >
                        </Rect>
                        <Text text={`${getNoteName(fit.rootNote)} ${fit.shape.name}`} fill={colorPalette.Widget_Primary} width={tileWidth} height={tileHeight} verticalAlign='middle' padding={5} listening={false} fontSize={10} />

                        {/* {fitsByNote.map((fit, fitIdx) => {
                        const angle = (idx + fitIdx) * Math.PI * 2 / 12;
                        const x = radius * Math.cos(angle);
                        const y = radius * Math.sin(angle);
                        return (
                            <Group>
                                <Circle x={x} y={y} radius={radius / 12} fill={colorPalette.Widget_Primary} />
                                <Text x={x} y={y} text={fit} fill={colorPalette.UI_Primary} />
                            </Group>
                        );
                    })} */}
                    </Group>
                );
            });
        });
        return elems;
    }, [diatonicFits, romanNumerals, verticalElemOffset, colorPalette.Widget_Primary, colorPalette.UI_Background, tileWidth, tileHeight, fitChannelMap, horrizontalElemOffset, getScaleDegree, getNoteName, updateNotes]);


    ///////////////////

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group x={radius} y={radius}>
                {chordDisplay}
            </Group>
        );
    }, [chordDisplay, radius]);

    return (
        <Group>
            <Group x={-props.width / 2} y={-props.height / 2}>
                {fullRender}
            </Group>
            <SettingsMenuOverlay settingsRows={[]} fromWidget={props.fromWidget}>
                <Group x={-props.width / 2} y={-props.height / 2}>
                    {fullRender}
                </Group>
            </SettingsMenuOverlay>
        </Group>
    );
}

function getRomanNumeralFromScaleDegree(scaleDegree: number) {
    switch (scaleDegree + 1) {
        case 1: return "I";
        case 2: return "ii";
        case 3: return "iii";
        case 4: return "IV";
        case 5: return "V";
        case 6: return "vi";
        case 7: return "vii°";
        default: return "";
    }
}

export default DiatonicChordExplorer;