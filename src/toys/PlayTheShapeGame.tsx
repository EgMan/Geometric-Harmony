
import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import { Group } from 'react-konva';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { Html } from 'react-konva-utils';
import { HarmonicShape, knownShapes } from '../utils/KnownHarmonicShapes';
import { NoteSet, normalizeToSingleOctave, useGetCombinedModdedEmphasis, useNoteSet } from '../sound/NoteProvider';
import { useGetAllExactFits } from './HarmonyAnalyzer';
import { useActiveNoteNames } from '../utils/Utils';

const quizShapes = knownShapes[3].concat(knownShapes[4]);

type Question = {
    shape: HarmonicShape,
    keyCenter: number,
};

type Props =
    {
        width: number
        height: number
    } & WidgetComponentProps

function PlayTheShapeGame(props: Props) {

    // const settingsMenuItems = [
    //     (<tr key={"tr1"}>
    //         <td>Show Minor Seconds (Major Sevenths)</td>
    //         <td style={{ color: getIntervalColor(1), textAlign: "center" }}>■</td>
    //         <td><Switch color={"primary"} checked={displayInterval[0]} onChange={e => setDisplayInterval(0, e.target.checked)} /></td>
    //     </tr>),
    // ];

    const pickNewShape = React.useCallback(() => {
        return { shape: quizShapes[Math.floor(Math.random() * quizShapes.length)], keyCenter: Math.floor(Math.random() * 12) }
    }, []);

    const [question, setQuestion] = React.useState<Question>(pickNewShape());
    const [nextQuestion, setNextQuestion] = React.useState<Question>(pickNewShape());

    const inputNotes = useNoteSet(NoteSet.PlayingInput, true).notes;
    const emphasizedNotes = useGetCombinedModdedEmphasis();
    const consideredNotes = new Set(Array.from(inputNotes).concat(Array.from(emphasizedNotes)));

    const exactFits = useGetAllExactFits(consideredNotes);
    const exactFit = exactFits[0];
    const getNoteName = useActiveNoteNames();

    React.useEffect(() => {
        if (exactFit.shape === question.shape && exactFit.rootNote % 12 === normalizeToSingleOctave(question.keyCenter)) {
            setQuestion(nextQuestion);
            setNextQuestion(pickNewShape());
        }
    }, [exactFit, nextQuestion, pickNewShape, question.keyCenter, question.shape]);
    const fullRender = React.useMemo((
    ) => {
        return (
            <Group>
                <Html divProps={{ id: "playTheShapeGame" }} >
                    <div style={{ width: `${props.width}px`, height: `${props.height}px` }}>
                        <table style={{ width: `${props.width}px`, height: `${props.height}px` }}>
                            <tr>
                                <td colSpan={1} style={{ textAlign: "center", fontWeight: "bolder" }}>Play</td>
                                <td colSpan={1} style={{ textAlign: "center", fontWeight: "bolder" }}>Up next</td>
                            </tr>
                            <tr>
                                <td colSpan={1} style={{ color: "lightgreen", textAlign: "left" }}>{`${getNoteName(question.keyCenter)} ${question.shape.name}`}</td>
                                <td colSpan={1} style={{ textAlign: "left" }}>{`${getNoteName(nextQuestion.keyCenter)} ${question.shape.name}`}</td>
                            </tr>
                        </table>
                    </div>
                </Html>
            </Group>
        );
    }, [getNoteName, nextQuestion.keyCenter, props.height, props.width, question.keyCenter, question.shape.name]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={[]} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export default PlayTheShapeGame;