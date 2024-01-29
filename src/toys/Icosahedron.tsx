import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import { blendColors, getIntervalColor, getIntervalDistance, smallGold } from '../utils/Utils';
import Wireframe, { WireframeLine, WireframePoint } from './Wireframe';
import { NoteSet, normalizeToSingleOctave, useHomeNote, useNoteDisplays, useNoteSet } from '../sound/NoteProvider';
import { useAppTheme } from '../view/ThemeManager';

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

function Icosahedron(props: Props) {
    const homeNote = useHomeNote();
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const noteDisplays = useNoteDisplays();
    const { colorPalette } = useAppTheme()!;

    const idxToNote = React.useMemo(() => {
        return [0, 1, 6, 7, 3, 5, 9, 11, 4, 8, 10, 2].map(idx => normalizeToSingleOctave(idx + (homeNote ?? 0)));
    }, [homeNote]);

    const points: WireframePoint[] = React.useMemo(() => {
        const out: WireframePoint[] = [
            { x: 1, y: smallGold, z: 0 },
            { x: 1, y: -smallGold, z: 0 },
            { x: -1, y: -smallGold, z: 0 },
            { x: -1, y: smallGold, z: 0 },

            { x: smallGold, y: 0, z: 1 },
            { x: -smallGold, y: 0, z: 1 },
            { x: -smallGold, y: 0, z: -1 },
            { x: smallGold, y: 0, z: -1 },

            { x: 0, y: 1, z: smallGold },
            { x: 0, y: 1, z: -smallGold },
            { x: 0, y: -1, z: -smallGold },
            { x: 0, y: -1, z: smallGold },
        ].map((p, i) => {
            const note = idxToNote[i];
            const channelDisplay = noteDisplays.normalized[note]?.map((noteDisplay) => noteDisplay.color!);
            const isActiveNote = activeNotes.has(normalizeToSingleOctave(note))
            const isBeingChannelDisplayed = (channelDisplay?.length ?? 0) > 0;
            let color = colorPalette.Widget_Primary;
            let circleRadius = 2.5;
            let outlineColor = undefined;
            let opacity = 1;
            // let moreText = "";
            if (isBeingChannelDisplayed) {
                circleRadius = 5;
                color = blendColors(channelDisplay ?? []) ?? "rgba(0,0,0,0)";
            }
            else if (homeNote === normalizeToSingleOctave(note)) {
                circleRadius = 3;
                color = colorPalette.Note_Home;
            }
            else if (isActiveNote) {
                circleRadius = 2.5;
                color = colorPalette.Note_Active;
            } else {
                color = colorPalette.Main_Background;
                circleRadius = 2.5;
                outlineColor = colorPalette.Widget_Primary;
            }
            return {
                color,
                opacity,
                outlineColor,
                location3D: p,
                // text: "" + note,
                // text: `${moreText}${note}${isActiveNote ? "A" : ""}${isBeingChannelDisplayed ? "C" : ""}`,
                radius: circleRadius,
            }
        });
        return out;
    }, [activeNotes, colorPalette.Main_Background, colorPalette.Note_Active, colorPalette.Note_Home, colorPalette.Widget_Primary, homeNote, idxToNote, noteDisplays.normalized]);


    const lines = React.useMemo(() => {
        let out: WireframeLine[] = [];

        const hullConnectivity = [
            [1, 4, 7, 8, 9],
            [4, 7, 10, 11],
            [3, 5, 6, 10, 11],
            [5, 6, 8, 9],
            [5, 8, 11],
            [8, 11],
            [7, 9, 10],
            [9, 10],
            [9],
            [],
            [11],
        ];

        for (let start = 0; start < 12; start++) {
            for (let end = start + 1; end < 12; end++) {
                const startNote = idxToNote[start];
                const endNote = idxToNote[end];
                const startNotechannelDisplay = noteDisplays.normalized[startNote]?.length > 0;
                const endNoteChannelDisplay = noteDisplays.normalized[endNote]?.length > 0;
                let color = colorPalette.Widget_Primary;

                // const isOtherNoteBeingChannelDisplayed = (endNoteChannelDisplay?.length ?? 0) > 0;
                if (startNotechannelDisplay && endNoteChannelDisplay) {
                    color = getIntervalColor(getIntervalDistance(normalizeToSingleOctave(startNote), normalizeToSingleOctave(endNote), 12), colorPalette);
                    out.push({
                        start: start,
                        end: end,
                        color: color,
                        lineProps: {
                            strokeWidth: 2,
                        }
                    });
                }
                else if (hullConnectivity[startNote]?.includes(endNote)) {
                    out.push({
                        start: startNote,
                        end: endNote,
                        color: colorPalette.Widget_Primary,
                        lineProps: {
                            opacity: 0.1,
                        }
                    });
                }
            }
        }
        return out;
    }, [colorPalette, idxToNote, noteDisplays.normalized]);

    return (
        <Wireframe
            points={points}
            lines={lines}
            autoRotateVector={{ x: smallGold / 2, y: 0.5, z: 0.25 }}
            center={{ x: 0, y: 0, z: 0 }}
            isOrthographic={false}
            {...props}
        />
    );
}

export default Icosahedron;