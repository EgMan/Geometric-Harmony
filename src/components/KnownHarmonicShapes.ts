
export type NoteInContext = [boolean] | [boolean, string];

export type HarmonicShape =
    {
        name: string,
        notes: NoteInContext[],
    }

export const knownShapes: HarmonicShape[][] = [
    [], 
    [],

    //todo replace # and @ with ♯ and ♭

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
    [
        {
            name: "Natural Pentatonic Family",
            notes: [[true, "Minor Pentatonic"], [false], [false], [true, "Major Pentatonic"], [false], [true], [false], [true], [false], [false], [true, "Yo Scale"]]
        },
        {
            name: "Kumoi Pentatonic Family",
            notes: [[true, "Kumoi Pentatonic"], [false], [true, "Modern Japanese Pentatonic"], [true], [false], [false], [false], [true], [false], [true]]
        },
        {
            name: "Hirojoshi Pentatonic Family",
            notes: [[true, "Hirojoshi Pentatonic"], [false], [true], [true], [false], [false], [false], [true], [true]]
        },
        {
            name: "This shit is mine",
            notes: [[true, "Antonio pentatonic"], [false], [true], [false], [false], [false], [true], [true], [false], [true], [false], [false]],
        },
    ], 

    // Hexatonics
    [
        {
            name: "Whole Tone Scale",
            notes: [[true, "Whole tone"], [false], [true], [false], [true], [false], [true], [false], [true], [false], [true], [false]],
        },
        {
            name: "Augmented Scales",
            notes: [[true, "Augmented scale 1"], [false], [false], [true, "Augmented scale 2"], [true], [false], [false], [true], [true], [false], [false], [true]],
        },
        {
            name: "Blues Mode Family",
            notes: [[true, "Major Blues"], [false], [true], [true], [true], [false], [false], [true], [false], [true, "Minor Blues"], [false], [false]],
        },
    ],

    // septatonics
    [
        {
            name: "Natural Mode Family",
            notes: [[true, "Major (Ionian)"], [false], [true, "Dorian"], [false], [true, "Phrygian"], [true, "Lydian"], [false], [true, "Dominant (Mixolydian)"], [false], [true, "Minor (Aeolian)"], [false], [true, "Locrian"]],
        },
        {
            name: "Melodic Mode Family",
            notes: [[true, "Melodic Minor"], [false], [true, "Phrygidorian (Phrygian ♯6, Dorian ♭2)"], [true, "Lydian Augmented (Lydian #5)"], [false], [true, "Lydian Dominant"], [false], [true, "Melodic Major (Mixolydian ♭6, Hindu)"], [false], [true, "Half-Diminished (Locrian ♯2)"], [false], [true, "Superlocrian (Locrian ♭4)"]],
        },
        {
            name: "Harmonic Minor Mode Family",
            notes: [[true, "Augmented Major (Ionian ♯5)"], [false], [true, "Ukranian Dorian (Dorian ♯4)"], [false], [true, "Phrygian Dominant (Phrygian ♯3)"], [true, "Lydian ♯2"], [false], [false], [true, "Ultralocrian (Super Locrian ♭♭7)"], [true, "Harmonic minor (Aeolian ♯7)"], [false], [true, "Locrian ♮6"]],
        },
        {
            name: "Harmonic Major Mode Family",
            notes: [[true, "Harmonic Major"], [false], [true, "Dorian ♭5"], [false], [true, "Phrygian #4"], [true, "Lydian ♭3"], [false], [true, "Dominant ♭2"], [true, "Lydian Augmented ♯2"], [false], [false], [true, "Locrian ♭♭7"]]
        },
        {
            name: "Double Harmonic Mode Family",
            notes: [[true, "Ionian Augmented ♯2"], [false], [false], [true, "Locrian ♭♭3 ♭♭7"], [true, "Double Harmonic Major"], [true, "Lydian ♯2 ♯6"], [false], [false], [true, "Ultraphrygian"], [true, "Hungarian Minor"], [false], [true, "Oriental"]],
        },
        {
            name: "Hungarian Major Mode Family",
            notes: [[true, "Hungarian Major"], [false], [false], [true, "Ultralocrian ♭♭6"], [true, "Locrian ♮2 ♮7"], [false], [true, "Superlocrian ♮6"], [true, "Melodic Minor #5"], [false], [true, "Ukrainian Dorian ♭2"], [true, "Nohkan flute scale (Lydian Augmented ♯3)"], [false]],
        },
        {
            name: "Neopolitan Minor Mode Family",
            notes: [[true, "Neopolitan Minor"], [true, "Lydian ♯6"], [false], [true, "Dominant Augmented"], [false], [true, "Hungarian Gypsy"], [false], [true, "Locrian ♮3"], [true, "Ionian ♯2"], [false], [false], [true, "Alt ♭♭3 ♭♭7"]],
        },
        {
            name: "Neopolitan Major Mode Family",
            notes: [[true, "Neopolitan Major"], [true, "Lydian Augmented ♯6"], [false], [true, "Lydian Dominant Augmented"], [false], [true, "Lydian Minor"], [false], [true, "Major Locrian (Arabic)"], [false], [true, "Alt ♮2"], [false], [true, "Alt ♭♭3"]],
        },
        {
            name: "Persian Mode Family",
            notes: [[true, "Persian"], [true], [false], [false], [true], [true], [true], [false], [true, "Chromatic Hypodorian Inverse"], [false], [false], [true]],
        },
        {
            name: "Enigmatic Minor Mode Family",
            notes: [[true, "Enigmatic Minor"], [true], [false], [true], [false], [false], [true], [true], [false], [false], [true], [true]],
        },
        {
            name: "Ascending Enigmatic Major Mode Family",
            notes: [[true, "Ascending Enigmatic Major"], [true], [false], [false], [true], [false], [true], [false], [true], [false], [true], [true]],
        },
        {
            name: "Descending Enigmatic Major Mode Family",
            notes: [[true, "Descending Enigmatic Major"], [true], [false], [false], [true], [true], [false], [false], [true], [false], [true], [true]],
        },
        {
            name: "Locrian ♮7 Mode Family",
            notes: [[true, "Locrian ♮7"], [true, "Ionian #6"], [false], [true, "Dorian #5"], [false], [true, "Phrygian #4"], [true, "Lydian #3"], [false], [true, "Dominant #2"], [false], [false], [true, "Chromatic Hypodorian Inverse ♭4"]],
        },
    ],

    // octatonics
    [
        {
            name: "Diminished Mode Family",
            notes: [[true, "Diminished Scale 1"], [true, "Diminished scale 2"], [false], [true], [true], [false], [true], [true], [false], [true], [true], [false]],
        },
        {
            name: "8 tone Spanish Mode Family",
            notes: [[true, "8 Tone Spanish"], [true], [false], [true], [true], [true], [true], [false], [true], [false], [true], [false]],
        },
        {
            name: "Dominant Beebop Mode Family",
            notes: [[true, "Dominant Beebop"], [false], [true], [false], [true], [true], [false], [true], [false], [true], [true], [true]],
        },
        {
            name: "Dorian Beebop Mode Family",
            notes: [[true, "Dorian Beebop"], [false], [true], [true], [false], [true], [false], [true], [false], [true], [true], [true]], 
        },
        {
            name: "Melodic Minor Beebop Mode Family",
            notes: [[true, "Locrian ♮2 Beebop"], [false], [true], [true, "Melodic Minor Beebop"], [false], [true], [true], [false], [true], [false], [true], [true]],
        },
        {
            name: "Major Beebop Mode Family",
            notes: [[true, "Major Beebop"], [false], [true], [false], [true, "Phrygian Beebop"], [true], [false], [true], [true], [true, "Harmonic Minor Beebop"], [false], [true]]
        },
        {
            name: "Phrygian Dominant Beebop Mode Family",
            notes: [[true, "Phrygian Dominant Beebop"], [true], [false], [false], [true], [true], [false], [true], [true], [false], [true], [true]],
        },
    ],

    // nonatonics
    [],

    // decatonics
    [],

    // undecatonics
    [],

    // dodecatonics
    [
        {
            name: "Chromatic Scale",
            notes: [[true, "Chromatic Scale"], [true], [true], [true], [true], [true], [true], [true], [true], [true], [true], [true]],
        },
    ],
];