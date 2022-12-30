import React from "react";
import { useActiveNotes, useEmphasizedNotes } from "./NoteProvider";
import { Text } from 'react-konva';
import { HarmonicShape, knownShapes } from "./KnownHarmonicShapes";
import { getNoteName } from "./SoundEngine";


type Props =
    {
        x: number
        y: number
        width: number
        subdivisionCount: number
    }


function HarmonyAnalyzer(props: Props) {
    const activeNotes = useActiveNotes();
    const emphasizedNotes = useEmphasizedNotes();

    const tryToFitShape = React.useCallback((shape: HarmonicShape, notes: Set<number>) => {
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
                return {
                    shape,
                    doesFit: true,
                    noteToFirstNoteInShapeIdxOffset: findNextNoteInShape(-1) - note,
                };
            }
        }

        return {
            shape,
            doesFit: false,
            noteToFirstNoteInShapeIdxOffset: 0,
        };
    }, [props.subdivisionCount])

    const getAllExactFits = React.useCallback(() => {
        const shapesOfCorrectSize = knownShapes[activeNotes.size] ?? [];

        return shapesOfCorrectSize.map(shape => tryToFitShape(shape, activeNotes)).filter(shapeFit => shapeFit.doesFit);
    }, [activeNotes, tryToFitShape])

    const exactFits = getAllExactFits();
    const exactFit = exactFits[0];
    const exactFitName = exactFit ? exactFit.shape.name : "";

    React.useEffect(() => {
        exactFits.forEach((shapeFit) => {
            console.log(shapeFit.shape.name);
        })
    }, [activeNotes, exactFits])

    const emphasizedNoteInfo = Array.from(emphasizedNotes).map(note => {
        if (exactFit === null || exactFit === undefined) return getNoteName(note);
        let shapeIdx = (note + exactFit.noteToFirstNoteInShapeIdxOffset) % props.subdivisionCount;
        if (shapeIdx < 0) shapeIdx += props.subdivisionCount;
        if (shapeIdx >= exactFit.shape.notes.length || shapeIdx < 0) return getNoteName(note);
        return `${getNoteName(note)} ${exactFit.shape.notes[shapeIdx][1] ? ' - ' + exactFit.shape.notes[shapeIdx][1] : ''}`
    }).filter(info => info !== '');

    const textelemoffset = 35;
    const emphasizedInfoTextElems = emphasizedNoteInfo.map((infoText, idx) => {
        return (<Text text={infoText} x={props.x} y={props.y + textelemoffset*(idx+1)} fontSize={30} fontFamily='Calibri' fill="red" align="center" width={props.width} />);
    });

    return (
        <div>
            <Text text={exactFitName} x={props.x} y={props.y} fontSize={30} fontFamily='Calibri' fill="white" align="center" width={props.width} />
            {emphasizedInfoTextElems}
        </div>
    );
}

export default HarmonyAnalyzer;