
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
            notes: [[true, "1"], [false], [false], [true, "♭3"], [false], [false], [false], [true, "5"]],
        },
        {
            name: "Major Triad",
            notes: [[true, "1"], [false], [false], [false], [true, "3"], [false], [false], [true, "5"]],
        },
        {
            name: "Diminished Triad",
            notes: [[true, "1"], [false], [false], [true, "♭3"], [false], [false], [true, "♭5"]],
        },
        {
            name: "Augmented Triad",
            notes: [[true, "1"], [false], [false], [false], [true, "3"], [false], [false], [false], [true, "#5"]],
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
            name: "Melodic Mode Family",
            notes: [[true, "Melodic Minor"], [false], [true, "Phrygidorian (Phrygian ♯6, Dorian ♭2)"], [true, "Lydian Augmented (Lydian #5)"], [false], [true, "Lydian dominant"], [false], [true, "Melodic Major (Mixolydian ♭6)"], [false], [true, "Half-Diminished (Locrian ♯2)"], [false], [true, "Super Locrian"]],
        },
        {
            name: "Harmonic Mode Family",
            notes: [[true, "Augmented Major (Ionian ♯5)"], [false], [true, "Ukranian Dorian"], [false], [true, "Phrygian Dominant"], [true, "Lydian ♯2"], [false], [false], [true, "Super Locrian ♭♭7"], [true, "Harmonic minor (Aeolian ♯7)"], [false], [true, "Locrian ♮6"]],
        },
        {
            name: "Double Harmonic Mode Family",
            notes: [[true, "Ionian ♯2 ♯5"], [false], [false], [true, "Locrian ♭♭3 ♭♭7"], [true, "Double Harmonic Major"], [true, "Lydian ♯2 ♯6"], [false], [false], [true, "Ultraphrygian"], [true, "Hungarian/Gypsy Minor"], [false], [true, "Oriental"]],
        }
    ],

    // octatonics
    [],
];