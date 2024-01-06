import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import { Point3D } from '../graphics3D/Engine3D';
import { blendColors, getRandomColor, smallGold } from '../utils/Utils';
import Wireframe, { WireframeLine, WireframePoint } from './Wireframe';
import { NoteSet, normalizeToSingleOctave, useNoteDisplays, useNoteSet } from '../sound/NoteProvider';
import { useAppTheme } from '../view/ThemeManager';

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

const radius = 1;
const octaveCount = 7;

function Spiral(props: Props) {
    const rungSpacing = smallGold / 2;
    const noteDisplays = useNoteDisplays();
    const activeNotes = useNoteSet(NoteSet.Active).notes;
    const { colorPalette } = useAppTheme()!;


    const initialPoints = React.useMemo(() => {
        let outPoints: WireframePoint[] = [];
        for (let i = 0; i < 12 * octaveCount; i++) {
            // const a = noteDisplays.octaveGnostic[i]?.map((noteDisplay) => noteDisplay.color!);
            // const color = blendColors(a ?? []) ?? undefined;
            const color = noteDisplays.octaveGnostic[i] ? "green" : "red";
            const radians = -i * 2 * Math.PI / 12;
            outPoints.push({
                location3D: {
                    x: Math.sin(radians) * radius,
                    y: -Math.cos(radians) * radius,
                    z: i * rungSpacing,
                },
                // color: getRandomColor(),
                color,
                // circleProps: { radius: 3 },
            });
        }
        return outPoints;
    }, [noteDisplays.octaveGnostic, rungSpacing]);

    const [points, setPoints] = React.useState<WireframePoint[]>(initialPoints);

    React.useEffect(() => {
        setPoints(prevPoints => {
            return prevPoints.map((point, idx) => {
                const channelDisplay = noteDisplays.octaveGnostic[idx - 24]?.map((noteDisplay) => noteDisplay.color!);
                const isActiveNote = activeNotes.has(normalizeToSingleOctave(idx))
                const isBeingChannelDisplayed = (channelDisplay?.length ?? 0) > 0;
                const color = blendColors(channelDisplay ?? []) ?? (activeNotes.has(normalizeToSingleOctave(idx)) ? colorPalette.Note_Active : "rgba(0,0,0,0)");
                console.log(blendColors(channelDisplay ?? []), color);

                return {
                    ...point,
                    color,
                    pointProps: {
                        // opacity: isActiveNote || isBeingChannelDisplayed ? 1 : 0,
                        opacity: 0,
                        radius: isBeingChannelDisplayed ? 6 : 3,
                    }
                };
            });
        });
    }, [activeNotes, colorPalette.Note_Active, noteDisplays]);

    const initialLines = React.useMemo(() => {
        let outPoints: WireframeLine[] = [];
        for (let i = 0; i < (12 * octaveCount) - 1; i++) {
            // outPoints.push({ start: i, end: (i + 1), color: getRandomColor(), lineProps: { strokeWidth: 1 } });
        }
        return outPoints;
    }, []);

    const [lines, setLines] = React.useState<WireframeLine[]>(initialLines);

    return (
        <Wireframe
            points={points}
            setPoints={setPoints}
            lines={lines}
            setLines={setLines}
            autoRotateVector={{ x: 0.05, y: 0, z: 0 }}
            {...props}
        />
    );
}

export default Spiral;