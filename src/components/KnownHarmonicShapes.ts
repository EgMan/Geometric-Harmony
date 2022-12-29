
export type NoteInContext = [boolean] | [boolean, string];

export type HarmonicShape =
    {
        name: string,
        notes: NoteInContext[],
    }

export const knownShapes: HarmonicShape[][] = [
    [], [],

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
    ],

    // Seven chords (4 notes)
    [
        {
            name: "Diminished Seven",
            notes: [[true], [false], [false], [true], [false], [false], [true], [false], [false], [true]],
        },
        {
            name: "Half Diminished Seven",
            notes: [[true], [false], [false], [true], [false], [false], [true], [false], [false], [false], [true]],
        },
        {
            name: "Minor Seven",
            notes: [[true], [false], [false], [true], [false], [false], [false], [true], [false], [false], [true]],
        },
        {
            name: "Hitchcock Seven",
            notes: [[true], [false], [false], [true], [false], [false], [false], [true], [false], [false], [false], [true]],
        },
        {
            name: "Dominant Seven",
            notes: [[true], [false], [false], [false], [true], [false], [false], [true], [false], [false], [true]],
        },
        {
            name: "Major Seven",
            notes: [[true], [false], [false], [false], [true], [false], [false], [true], [false], [false], [false], [true]],
        },
    ],

    // Pentatonics
    [],

    // Hexatonics
    [],

    // septatonics
    [
        {
            name: "Natural Mode Family",
            notes: [[true, "Ionian (Major)"], [false], [true, "Dorian"], [false], [true, "Phrygian"], [true, "Lydian"], [false], [true, "Mixolydian"], [false], [true, "Aeolian (Minor)"], [false], [true, "Locrian"]],
        },
        {
            name: "Harmonic Mode Family",
            notes: [[true, "Ionian (Major)"], [false], [true, "Dorian"], [false], [true, "Phrygian"], [true, "Lydian"], [false], [false], [true, "Mixolydian"], [true, "Aeolian (Minor)"], [false], [true, "Locrian"]],
        }
    ],

    // octatonics
    [],
];