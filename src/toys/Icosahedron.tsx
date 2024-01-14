import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import { Point3D } from '../utils/Utils3D';
import { blendColors, smallGold } from '../utils/Utils';
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

    // const [points, setPoints] = React.useState<WireframePoint[]>([
    //     { location3D: { x: 1, y: smallGold, z: 0 }, text: "0:" + idxToNote[0] },
    //     { location3D: { x: 1, y: -smallGold, z: 0 }, text: "1:" + idxToNote[1] },
    //     { location3D: { x: -1, y: -smallGold, z: 0 }, text: "2:" + idxToNote[2] },
    //     { location3D: { x: -1, y: smallGold, z: 0 }, text: "3:" + idxToNote[3] },

    //     { location3D: { x: smallGold, y: 0, z: 1 }, text: "4:" + idxToNote[4] },
    //     { location3D: { x: -smallGold, y: 0, z: 1 }, text: "5:" + idxToNote[5] },
    //     { location3D: { x: -smallGold, y: 0, z: -1 }, text: "6:" + idxToNote[6] },
    //     { location3D: { x: smallGold, y: 0, z: -1 }, text: "7:" + idxToNote[7] },

    //     { location3D: { x: 0, y: 1, z: smallGold }, text: "8:" + idxToNote[8] },
    //     { location3D: { x: 0, y: 1, z: -smallGold }, text: "9:" + idxToNote[9] },
    //     { location3D: { x: 0, y: -1, z: -smallGold }, text: "10:" + idxToNote[10] },
    //     { location3D: { x: 0, y: -1, z: smallGold }, text: "11:" + idxToNote[11] },
    // ]);

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
            console.log("what", activeNotes, note, isActiveNote);
            const isBeingChannelDisplayed = (channelDisplay?.length ?? 0) > 0;
            let color = colorPalette.Widget_Primary;
            let circleRadius = 2.5;
            let outlineColor = undefined;
            let opacity = 1;
            let moreText = "";
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
                moreText += "fuck";
            }
            return {
                color,
                opacity,
                outlineColor,
                location3D: p,
                // text: i,
                // text: `${moreText}${note}${isActiveNote ? "A" : ""}${isBeingChannelDisplayed ? "C" : ""}`,
                radius: circleRadius,
            }
        });
        return out;
    }, [activeNotes, colorPalette.Main_Background, colorPalette.Note_Active, colorPalette.Note_Home, colorPalette.Widget_Primary, homeNote, idxToNote, noteDisplays.normalized]);

    const [lines, setLines] = React.useState<WireframeLine[]>([
        { start: 0, end: 1 },
        { start: 1, end: 4 },
        { start: 4, end: 0 },
        { start: 0, end: 7 },
        { start: 1, end: 7 },
        { start: 2, end: 5 },
        { start: 2, end: 3 },
        { start: 2, end: 6 },
        { start: 3, end: 5 },
        { start: 3, end: 6 },
        { start: 8, end: 9 },
        { start: 8, end: 3 },
        { start: 3, end: 9 },
        { start: 8, end: 4 },
        { start: 8, end: 0 },
        { start: 10, end: 11 },
        { start: 10, end: 1 },
        { start: 10, end: 7 },
        { start: 11, end: 1 },
        { start: 4, end: 11 },
        { start: 8, end: 5 },
        { start: 9, end: 0 },
        { start: 10, end: 6 },
        { start: 6, end: 7 },
        { start: 2, end: 10 },
        { start: 2, end: 11 },
        { start: 5, end: 11 },
        { start: 4, end: 5 },
        { start: 7, end: 9 },
        { start: 6, end: 9 },
    ]);

    // setPoints(oldPoints => oldPoints.map(p => (rotateZ(rotateY(rotateX(p, deltaT / (bigGold * 2), centerpoint), deltaT / 2, centerpoint), deltaT / 4, centerpoint))));
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