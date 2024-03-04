import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import { Point3D } from '../utils/Utils3D';
import { bigGold, blendColors, changeAlpha, fadeColors, getIntervalColor, getIntervalDistance, getRandomColor, smallGold } from '../utils/Utils';
import Wireframe, { WireframeLine, WireframePoint } from './Wireframe';
import { NoteSet, normalizeToSingleOctave, useHomeNote, useNoteDisplays, useNoteSet } from '../sound/NoteProvider';
import { useAppTheme } from '../view/ThemeManager';
import Quaternion from "quaternion";

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

const radius = 1;
const octaveCount = 8;

function Spiral(props: Props) {
    const rungSpacing = bigGold / (12 * octaveCount);
    const noteDisplays = useNoteDisplays();
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const { colorPalette } = useAppTheme()!;
    const homeNote = useHomeNote();


    const frameElems = React.useMemo(() => {
        let outPoints: WireframePoint[] = [];
        let outLines: WireframeLine[] = [];
        for (let noteIdx = 0; noteIdx < 12 * octaveCount; noteIdx++) {
            // const a = noteDisplays.octaveGnostic[i]?.map((noteDisplay) => noteDisplay.color!);
            // const color = blendColors(a ?? []) ?? undefined;
            // const color = noteDisplays.octaveGnostic[i] ? "green" : "red";
            const noteOffset = 24;
            const note = noteIdx - noteOffset;
            const radians = -note * 2 * Math.PI / 12;
            const channelDisplay = noteDisplays.octaveGnostic[note]?.map((noteDisplay) => noteDisplay.color!);
            const isActiveNote = activeNotes.has(normalizeToSingleOctave(note))
            const isBeingChannelDisplayed = (channelDisplay?.length ?? 0) > 0;
            let color = colorPalette.Widget_Primary;
            let circleRadius = 2.5;
            let outlineColor = undefined;
            let opacity = 1;
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

            outPoints.push({
                location3D: {
                    x: Math.sin(radians) * radius,
                    y: Math.cos(radians) * radius,
                    z: note * rungSpacing,
                },
                // color: getRandomColor(),
                color,
                outlineColor,
                // circleProps: { radius: 3 },
                circleProps: {

                    // opacity: isActiveNote || isBeingChannelDisplayed ? 1 : 0,
                    radius: circleRadius,
                },
            });

            if (isBeingChannelDisplayed) {
                for (let otherNote = note + 1; otherNote < Math.min(note + (12 * 3) + 1, 12 * octaveCount - noteOffset); otherNote++) {
                    const otherNoteChannelDisplay = noteDisplays.octaveGnostic[otherNote]?.map((noteDisplay) => noteDisplay.color!);
                    const isOtherNoteBeingChannelDisplayed = (otherNoteChannelDisplay?.length ?? 0) > 0;

                    if (isOtherNoteBeingChannelDisplayed) {
                        var intervalColor = getIntervalColor(getIntervalDistance(normalizeToSingleOctave(otherNote), normalizeToSingleOctave(note), 12), colorPalette);
                        const octavesApart = Math.floor((otherNote - note) / 12);
                        // intervalColor = changeAlpha(intervalColor, 1 / octavesApart);
                        outLines.push({
                            start: note + noteOffset,
                            end: otherNote + noteOffset,
                            color: intervalColor,
                            lineProps: {
                                strokeWidth: 2,
                            }
                        });
                    }
                }
            }
        }
        return { points: outPoints, lines: outLines };
    }, [activeNotes, colorPalette, homeNote, noteDisplays.octaveGnostic, rungSpacing]);

    return (
        <Wireframe
            points={frameElems.points}
            lines={frameElems.lines}
            autoRotateVector={{ x: 0.02, y: 0, z: 0 }}
            isOrthographic={false}
            initialOrientation={Quaternion.fromEuler(3.14, 0, -.75)}
            {...props}
        />
    );
}

export default Spiral;