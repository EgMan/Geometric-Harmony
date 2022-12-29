import React from "react";
import { act } from "react-dom/test-utils";
import { useActiveNotes } from "./NoteProvider";


type Props = 
{
    subdivisionCount: number
}
type NoteInContext = [boolean]|[boolean, string];

// type NoteInContext = 
// {
//     isInShape: boolean
//     nameInContext: string|null,
// }

type HarmonicShape = 
{
    name: string,
    notes: NoteInContext[],
}

const knownShapes: HarmonicShape[][] = [
    [],[],

    // Intervals
    [
        {
            name: "Minor Second / Major Seventh",
            notes: [[true], [true]],
        },
        {
            name: "Major Second / Minor Seventh",
            notes: [[true], [false], [true]],
        },
        {
            name: "Minor Third / Major Sixth",
            notes: [[true], [false], [false], [true]],
        },
        {
            name: "Major Third / Minor Sixth",
            notes: [[true], [false], [false], [false], [true]],
        },
        {
            name: "Perfect Fourth / Perfect Fifth",
            notes: [[true], [false], [false], [false], [false], [true]],
        },
        {
            name: "Tritone",
            notes: [[true], [false], [false], [false], [false], [false], [true]],
        },
    ],
    
    // Triads
    [
        {
            name: "Minor Triad",
            notes: [[true], [false], [false], [true], [false], [false], [false], [true]],
        },
        {
            name: "Major Triad",
            notes: [[true], [false], [false], [false], [true], [false], [false], [true]],
        },
        {
            name: "Diminished Triad",
            notes: [[true], [false], [false], [true], [false], [false], [true]],
        },
        {
            name: "Augmented Triad",
            notes: [[true], [false], [false], [false], [true], [false], [false], [false], [true]],
        },
    ]
];


function HarmonyAnalyzer(props:Props)
{
    const activeNotes = useActiveNotes();

    const doesShapeFit = (shape: HarmonicShape, notes: Set<number>) =>
    {
        const noteArr = Array.from(notes);

        const findNextNoteInShape = (startingIdx: number) =>
        {
            for (var i = startingIdx + 1; i < shape.notes.length; i++)
            {
                if (shape.notes[i][0]) return i;
            }
            return -1;
        }

        const doesShapeFitStartingHere = (noteStart: number) =>
        {
            var idx = findNextNoteInShape(-1);
            while (idx != -1)
            {
                if (!notes.has((noteStart+idx) % props.subdivisionCount))
                {
                    return false;
                }
                idx = findNextNoteInShape(idx);
            }
            return true;
        }

        for (const note of noteArr)
        {
            if (doesShapeFitStartingHere(note))
            {
                return true;
            }
        }

        return false;
    }

    const getAllExactFits = () =>
    {
        const shapesOfCorrectSize = knownShapes[activeNotes.size] ?? [];

        return shapesOfCorrectSize.filter((shape) => {
            return doesShapeFit(shape, activeNotes);
        });
    }

    React.useEffect(() => {
        getAllExactFits().forEach((shape) => {
            console.log(shape.name);
        })
    }, [activeNotes])

    return null;
}

export default HarmonyAnalyzer;