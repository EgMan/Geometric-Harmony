import React from "react";
import { useActiveNotes } from "./NoteProvider";
import { Text } from 'react-konva';
import { HarmonicShape, knownShapes } from "./KnownHarmonicShapes";


type Props =
    {
        x: number
        y: number
        width: number
        subdivisionCount: number
    }


function HarmonyAnalyzer(props: Props) {
    const activeNotes = useActiveNotes();

    const doesShapeFit = React.useCallback((shape: HarmonicShape, notes: Set<number>) => {
        const noteArr = Array.from(notes);

        const findNextNoteInShape = (startingIdx: number) => {
            for (var i = startingIdx + 1; i < shape.notes.length; i++) {
                if (shape.notes[i][0]) return i;
            }
            return -1;
        }

        const doesShapeFitStartingHere = (noteStart: number) => {
            var idx = findNextNoteInShape(-1);
            while (idx !== -1) {
                if (!notes.has((noteStart + idx) % props.subdivisionCount)) {
                    return false;
                }
                idx = findNextNoteInShape(idx);
            }
            return true;
        }

        for (const note of noteArr) {
            if (doesShapeFitStartingHere(note)) {
                return true;
            }
        }

        return false;
    }, [props.subdivisionCount])

    const getAllExactFits = React.useCallback(() => {
        const shapesOfCorrectSize = knownShapes[activeNotes.size] ?? [];

        return shapesOfCorrectSize.filter((shape) => {
            return doesShapeFit(shape, activeNotes);
        });
    }, [activeNotes, doesShapeFit])

    const exactFits = getAllExactFits();
    const exactFit = exactFits[0] ? exactFits[0].name : "";

    React.useEffect(() => {
        exactFits.forEach((shape) => {
            console.log(shape.name);
        })
    }, [activeNotes, exactFits])
    return (<Text text={exactFit} x={props.x} y={props.y} fontSize={30} fontFamily='Calibri' fill="white" align="center" width={props.width}></Text>);
}

export default HarmonyAnalyzer;