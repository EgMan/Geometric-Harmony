
export type NoteInContext = [boolean] | [boolean, string];

export enum ShapeType {
    INTERVAL,
    CHORD,
    SCALE,
    DYNAMIC,
}

export type HarmonicShape =
    {
        name: string,
        notes: NoteInContext[],
        type: ShapeType,
        groupByOverride?: string,
    }

export const SINGLE_NOTE: HarmonicShape = {
    name: "",
    notes: [[true]],
    type: ShapeType.SCALE,
};

export const INTERVAL_MINORSECOND: HarmonicShape = {
    name: "Minor Second / Major Seventh",
    notes: [[true], [true]],
    type: ShapeType.INTERVAL,
};
export const INTERVAL_MAJORSECOND: HarmonicShape = {
    name: "Major Second / Minor Seventh",
    notes: [[true], [false], [true]],
    type: ShapeType.INTERVAL,
};
export const INTERVAL_MINORTHIRD: HarmonicShape = {
    name: "Minor Third / Major Sixth",
    notes: [[true], [false], [false], [true]],
    type: ShapeType.INTERVAL,
};
export const INTERVAL_MAJORTHIRD: HarmonicShape = {
    name: "Major Third / Minor Sixth",
    notes: [[true], [false], [false], [false], [true]],
    type: ShapeType.INTERVAL,
};
export const INTERVAL_PERFECTFOURTH: HarmonicShape = {
    name: "Perfect Fourth / Perfect Fifth",
    notes: [[true], [false], [false], [false], [false], [true]],
    type: ShapeType.INTERVAL,
};
export const INTERVAL_TRITONE: HarmonicShape = {
    name: "Tritone",
    notes: [[true], [false], [false], [false], [false], [false], [true]],
    type: ShapeType.INTERVAL,
};

export const CHORD_MINORTRIAD: HarmonicShape = {
    name: "Minor Triad",
    notes: [[true, "1"], [false], [false], [true, "♭3"], [false], [false], [false], [true, "5"]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};
export const CHORD_MAJORTRIAD: HarmonicShape = {
    name: "Major Triad",
    notes: [[true, "1"], [false], [false], [false], [true, "3"], [false], [false], [true, "5"]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};

export const CHORD_SUS4_TRIAD: HarmonicShape = {
    name: "Sus 4",
    notes: [[true], [false], [false], [false], [false], [true], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};

export const CHORD_SUS_SHARP4_TRIAD: HarmonicShape = {
    name: "Sus ♯4",
    notes: [[true], [false], [false], [false], [false], [false], [true], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};

export const CHORD_SUS2_TRIAD: HarmonicShape = {
    name: "Sus 2",
    notes: [[true], [false], [true], [false], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};

export const CHORD_DIMINISHEDTRIAD: HarmonicShape = {
    name: "Diminished Triad",
    notes: [[true, "1"], [false], [false], [true, "♭3"], [false], [false], [true, "♭5"]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};
export const CHORD_AUGMENTEDTRIAD: HarmonicShape = {
    name: "Augmented Triad",
    notes: [[true, "1"], [false], [false], [false], [true, "3"], [false], [false], [false], [true, "#5"]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};

export const CHORD_DIMINISHED7: HarmonicShape = {
    name: "Diminished Seven",
    notes: [[true], [false], [false], [true], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_HALFDIMINISHED7: HarmonicShape = {
    name: "Half Diminished Seven",
    notes: [[true], [false], [false], [true], [false], [false], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_MINOR7: HarmonicShape = {
    name: "Minor Seven",
    notes: [[true], [false], [false], [true], [false], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_MINOR7_OMIT5: HarmonicShape = {
    name: "Minor Seven (omit 5)",
    notes: [[true], [false], [false], [true], [false], [false], [false], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_HITCHCOCK7: HarmonicShape = {
    name: "Hitchcock Seven",
    notes: [[true], [false], [false], [true], [false], [false], [false], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_HITCHCOCK7_OMIT5: HarmonicShape = {
    name: "Hitchcock Seven (omit 5)",
    notes: [[true], [false], [false], [true], [false], [false], [false], [false], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};
export const CHORD_DOMINANT7: HarmonicShape = {
    name: "Dominant Seven",
    notes: [[true], [false], [false], [false], [true], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_DOMINANT7_OMIT5: HarmonicShape = {
    name: "Dominant Seven (omit 5)",
    notes: [[true], [false], [false], [false], [true], [false], [false], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};
export const CHORD_DOMINANT7_SUS4: HarmonicShape = {
    name: "Dominant Seven Sus 4",
    notes: [[true], [false], [false], [false], [false], [true], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_DOMINANT7_SUS_SHARP4: HarmonicShape = {
    name: "Dominant Seven Sus ♯4",
    notes: [[true], [false], [false], [false], [false], [false], [true], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_MAJOR7: HarmonicShape = {
    name: "Major Seven",
    notes: [[true], [false], [false], [false], [true], [false], [false], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_MAJOR7_OMIT5: HarmonicShape = {
    name: "Major Seven (omit 5)",
    notes: [[true], [false], [false], [false], [true], [false], [false], [false], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Triadic Chords",
};
export const CHORD_MAJOR7_SUS4: HarmonicShape = {
    name: "Major Seven Sus 4",
    notes: [[true], [false], [false], [false], [false], [true], [false], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};
export const CHORD_AUGMENTED7: HarmonicShape = {
    name: "Augmented Seven",
    notes: [[true], [false], [false], [false], [true], [false], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MAJOR_ADD_FLAT9: HarmonicShape = {
    name: "Major Add ♭9",
    notes: [[true], [true], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MAJOR_ADD9: HarmonicShape = {
    name: "Major Add 9",
    notes: [[true], [false], [true], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MAJOR_ADD11: HarmonicShape = {
    name: "Major Add 11",
    notes: [[true], [false], [false], [false], [true], [true], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MAJOR_ADD_SHARP11: HarmonicShape = {
    name: "Major Add ♯11",
    notes: [[true], [false], [false], [false], [true], [false], [true], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_DOMINANT9: HarmonicShape = {
    name: "Dominant 9",
    notes: [[true], [false], [true], [false], [true], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Pentadic Chords",
};

export const CHORD_DOMINANT9_SUS4: HarmonicShape = {
    name: "Dominant 9 Sus 4",
    notes: [[true], [false], [true], [false], [true], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Pentadic Chords",
};

export const CHORD_MAJOR7_SHARP11: HarmonicShape = {
    name: "Major 7 ♯11",
    notes: [[true], [false], [false], [false], [true], [false], [true], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Pentadic Chords",
};

export const CHORD_MINOR_ADD_FLAT9: HarmonicShape = {
    name: "Minor Add ♭9",
    notes: [[true], [true], [false], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MINOR_ADD9: HarmonicShape = {
    name: "Minor Add 9",
    notes: [[true], [false], [true], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MINOR_ADD_FLAT11: HarmonicShape = {
    name: "Minor Add ♭11",
    notes: [[true], [false], [false], [true], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MINOR_ADD11: HarmonicShape = {
    name: "Minor Add 11",
    notes: [[true], [false], [false], [true], [false], [true], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MINOR_ADD_SHARP11: HarmonicShape = {
    name: "Minor Add ♯11",
    notes: [[true], [false], [false], [true], [false], [false], [true], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_DIMINISHED_ADD9: HarmonicShape = {
    name: "Diminished Add 9",
    notes: [[true], [false], [true], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_DIMINISHED_ADD11: HarmonicShape = {
    name: "Diminished Add 11",
    notes: [[true], [false], [false], [true], [false], [true], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Tetradic Chords",
};

export const CHORD_MINOR_FLAT9: HarmonicShape = {
    name: "Minor ♭9",
    notes: [[true], [true], [false], [true], [false], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Pentadic Chords",
};

export const CHORD_MAJOR9: HarmonicShape = {
    name: "Major 9",
    notes: [[true], [false], [true], [false], [true], [false], [false], [true], [false], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Pentadic Chords",
};

export const CHORD_MINOR9: HarmonicShape = {
    name: "Minor 9",
    notes: [[true], [false], [true], [true], [false], [false], [false], [true], [false], [false], [true]],
    type: ShapeType.CHORD,
    groupByOverride: "Pentadic Chords",
};

export const SCALE_NATURALPENTATONIC: HarmonicShape = {
    name: "Natural Pentatonic Family",
    notes: [[true, "Minor Pentatonic"], [false], [false], [true, "Major Pentatonic"], [false], [true], [false], [true], [false], [false], [true, "Yo Scale"]],
    type: ShapeType.SCALE,
};
export const SCALE_KUMOIPENTATONIC: HarmonicShape = {
    name: "Kumoi Pentatonic Family",
    notes: [[true, "Kumoi Pentatonic"], [false], [true, "Modern Japanese Pentatonic"], [true], [false], [false], [false], [true], [false], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_HIROJOSHIPENTATONIC: HarmonicShape = {
    name: "Hirojoshi Pentatonic Family",
    notes: [[true, "Hirojoshi Pentatonic"], [false], [true], [true], [false], [false], [false], [true], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_ANTONIOPENTATONIC: HarmonicShape = {
    name: "This shit is mine",
    notes: [[true, "Antonio pentatonic"], [false], [true], [false], [false], [false], [true], [true], [false], [true], [false], [false]],
    type: ShapeType.SCALE,
};

export const SCALE_WHOLETONE: HarmonicShape = {
    name: "Whole Tone Scale",
    notes: [[true, "Whole tone"], [false], [true], [false], [true], [false], [true], [false], [true], [false], [true], [false]],
    type: ShapeType.SCALE,
};
export const SCALE_AUGMENTED: HarmonicShape = {
    name: "Augmented Scales",
    notes: [[true, "Augmented scale 1"], [false], [false], [true, "Augmented scale 2"], [true], [false], [false], [true], [true], [false], [false], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_BLUES: HarmonicShape = {
    name: "Blues Mode Family",
    notes: [[true, "Major Blues"], [false], [true], [true], [true], [false], [false], [true], [false], [true, "Minor Blues"], [false], [false]],
    type: ShapeType.SCALE,
};

export const SCALE_NATURAL: HarmonicShape = {
    name: "Natural Mode Family",
    notes: [[true, "Major (Ionian)"], [false], [true, "Dorian"], [false], [true, "Phrygian"], [true, "Lydian"], [false], [true, "Dominant (Mixolydian)"], [false], [true, "Minor (Aeolian)"], [false], [true, "Locrian"]],
    type: ShapeType.SCALE,
};
export const SCALE_MELODIC: HarmonicShape = {
    name: "Melodic Mode Family",
    notes: [[true, "Melodic Minor"], [false], [true, "Phrygidorian (Phrygian ♯6, Dorian ♭2)"], [true, "Lydian Augmented (Lydian #5)"], [false], [true, "Lydian Dominant"], [false], [true, "Melodic Major (Mixolydian ♭6, Hindu)"], [false], [true, "Half-Diminished (Locrian ♯2)"], [false], [true, "Superlocrian (Locrian ♭4)"]],
    type: ShapeType.SCALE,
};
export const SCALE_HARMONICMINOR: HarmonicShape = {
    name: "Harmonic Minor Mode Family",
    notes: [[true, "Augmented Major (Ionian ♯5)"], [false], [true, "Ukranian Dorian (Dorian ♯4)"], [false], [true, "Phrygian Dominant (Phrygian ♯3)"], [true, "Lydian ♯2"], [false], [false], [true, "Ultralocrian (Super Locrian ♭♭7)"], [true, "Harmonic minor (Aeolian ♯7)"], [false], [true, "Locrian ♮6"]],
    type: ShapeType.SCALE,
};
export const SCALE_HARMONICMAJOR: HarmonicShape = {
    name: "Harmonic Major Mode Family",
    notes: [[true, "Harmonic Major"], [false], [true, "Dorian ♭5"], [false], [true, "Phrygian #4"], [true, "Lydian ♭3"], [false], [true, "Dominant ♭2"], [true, "Lydian Augmented ♯2"], [false], [false], [true, "Locrian ♭♭7"]],
    type: ShapeType.SCALE,
};
export const SCALE_DOUBLEHARMONIC: HarmonicShape = {
    name: "Double Harmonic Mode Family",
    notes: [[true, "Ionian Augmented ♯2"], [false], [false], [true, "Locrian ♭♭3 ♭♭7"], [true, "Double Harmonic Major"], [true, "Lydian ♯2 ♯6"], [false], [false], [true, "Ultraphrygian"], [true, "Hungarian Minor"], [false], [true, "Oriental"]],
    type: ShapeType.SCALE,
};
export const SCALE_HUNGARIANMAJOR: HarmonicShape = {
    name: "Hungarian Major Mode Family",
    notes: [[true, "Hungarian Major"], [false], [false], [true, "Ultralocrian ♭♭6"], [true, "Locrian ♮2 ♮7"], [false], [true, "Superlocrian ♮6"], [true, "Melodic Minor #5"], [false], [true, "Ukrainian Dorian ♭2"], [true, "Nohkan flute scale (Lydian Augmented ♯3)"], [false]],
    type: ShapeType.SCALE,
};
export const SCALE_NEOPOLITANMINOR: HarmonicShape = {
    name: "Neopolitan Minor Mode Family",
    notes: [[true, "Neopolitan Minor"], [true, "Lydian ♯6"], [false], [true, "Dominant Augmented"], [false], [true, "Hungarian Gypsy"], [false], [true, "Locrian ♮3"], [true, "Ionian ♯2"], [false], [false], [true, "Alt ♭♭3 ♭♭7"]],
    type: ShapeType.SCALE,
};
export const SCALE_NEOPOLITANMAJOR: HarmonicShape = {
    name: "Neopolitan Major Mode Family",
    notes: [[true, "Neopolitan Major"], [true, "Lydian Augmented ♯6"], [false], [true, "Lydian Dominant Augmented"], [false], [true, "Lydian Minor"], [false], [true, "Major Locrian (Arabic)"], [false], [true, "Alt ♮2"], [false], [true, "Alt ♭♭3"]],
    type: ShapeType.SCALE,
};
export const SCALE_PERSIAN: HarmonicShape = {
    name: "Persian Mode Family",
    notes: [[true, "Persian"], [true], [false], [false], [true], [true], [true], [false], [true, "Chromatic Hypodorian Inverse"], [false], [false], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_ENIGMATICMINOR: HarmonicShape = {
    name: "Enigmatic Minor Mode Family",
    notes: [[true, "Enigmatic Minor"], [true], [false], [true], [false], [false], [true], [true], [false], [false], [true], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_ASCENDINGENIGMATICMAJOR: HarmonicShape = {
    name: "Ascending Enigmatic Major Mode Family",
    notes: [[true, "Ascending Enigmatic Major"], [true], [false], [false], [true], [false], [true], [false], [true], [false], [true], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_DESCENDINGENIGMATICMAJOR: HarmonicShape = {
    name: "Descending Enigmatic Major Mode Family",
    notes: [[true, "Descending Enigmatic Major"], [true], [false], [false], [true], [true], [false], [false], [true], [false], [true], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_LOCRIANNATURAL7: HarmonicShape = {
    name: "Locrian ♮7 Mode Family",
    notes: [[true, "Locrian ♮7"], [true, "Ionian #6"], [false], [true, "Dorian #5"], [false], [true, "Phrygian #4"], [true, "Lydian #3"], [false], [true, "Dominant #2"], [false], [false], [true, "Chromatic Hypodorian Inverse ♭4"]],
    type: ShapeType.SCALE,
};

export const SCALE_DIMINISHED: HarmonicShape = {
    name: "Diminished Mode Family",
    notes: [[true, "Diminished Scale 1"], [true, "Diminished scale 2"], [false], [true], [true], [false], [true], [true], [false], [true], [true], [false]],
    type: ShapeType.SCALE,
};
export const SCALE_8TONESPANISH: HarmonicShape = {
    name: "8 tone Spanish Mode Family",
    notes: [[true, "8 Tone Spanish"], [true], [false], [true], [true], [true], [true], [false], [true], [false], [true], [false]],
    type: ShapeType.SCALE,
};
export const SCALE_DOMINANTBEEBOP: HarmonicShape = {
    name: "Dominant Beebop Mode Family",
    notes: [[true, "Dominant Beebop"], [false], [true], [false], [true], [true], [false], [true], [false], [true], [true], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_DORIANBEEBOP: HarmonicShape = {
    name: "Dorian Beebop Mode Family",
    notes: [[true, "Dorian Beebop"], [false], [true], [true], [false], [true], [false], [true], [false], [true], [true], [true]], 
    type: ShapeType.SCALE,
};
export const SCALE_MELODICMINORBEEBOP: HarmonicShape = {
    name: "Melodic Minor Beebop Mode Family",
    notes: [[true, "Locrian ♮2 Beebop"], [false], [true], [true, "Melodic Minor Beebop"], [false], [true], [true], [false], [true], [false], [true], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_MAJORBEEBOP: HarmonicShape = {
    name: "Major Beebop Mode Family",
    notes: [[true, "Major Beebop"], [false], [true], [false], [true, "Phrygian Beebop"], [true], [false], [true], [true], [true, "Harmonic Minor Beebop"], [false], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_PHRYGIANDOMINANTBEEBOP: HarmonicShape = {
    name: "Phrygian Dominant Beebop Mode Family",
    notes: [[true, "Phrygian Dominant Beebop"], [true], [false], [false], [true], [true], [false], [true], [true], [false], [true], [true]],
    type: ShapeType.SCALE,
};
export const SCALE_CHROMATIC: HarmonicShape = {
    name: "Chromatic Scale",
    notes: [[true, "Chromatic Scale"], [true], [true], [true], [true], [true], [true], [true], [true], [true], [true], [true]],
    type: ShapeType.SCALE,
};


export const knownShapes: HarmonicShape[][] = [
    [], 
    [SINGLE_NOTE],

    //todo replace # and @ with ♯ and ♭

    // Intervals
    [
        INTERVAL_MINORSECOND,
        INTERVAL_MAJORSECOND,
        INTERVAL_MINORTHIRD,
        INTERVAL_MAJORTHIRD,
        INTERVAL_PERFECTFOURTH,
        INTERVAL_TRITONE,
    ],

    // Triads
    [
        CHORD_MAJORTRIAD,
        CHORD_MINORTRIAD,
        CHORD_AUGMENTEDTRIAD,
        CHORD_DIMINISHEDTRIAD,
        // CHORD_SUS2_TRIAD,
        CHORD_SUS4_TRIAD,
        CHORD_SUS_SHARP4_TRIAD,
        CHORD_MAJOR7_OMIT5,
        CHORD_MINOR7_OMIT5,
        CHORD_DOMINANT7_OMIT5,
        CHORD_HITCHCOCK7_OMIT5,
    ],

    // Tetradic chords (4 notes)
    [
        CHORD_MAJOR7,
        CHORD_MINOR7,
        CHORD_MAJOR7_SUS4,
        CHORD_DOMINANT7,
        CHORD_DOMINANT7_SUS4,
        CHORD_DOMINANT7_SUS_SHARP4,
        CHORD_HITCHCOCK7,
        CHORD_DIMINISHED7,
        CHORD_HALFDIMINISHED7,
        CHORD_AUGMENTED7,
        CHORD_MAJOR_ADD9,
        CHORD_MAJOR_ADD_FLAT9,
        CHORD_MAJOR_ADD11,
        CHORD_MAJOR_ADD_SHARP11,
        CHORD_MINOR_ADD_FLAT9,
        CHORD_MINOR_ADD9,
        // CHORD_MINOR_ADD_FLAT11, Garbage chord
        CHORD_MINOR_ADD11,
        CHORD_MINOR_ADD_SHARP11,
        CHORD_DIMINISHED_ADD9,
        CHORD_DIMINISHED_ADD11,
    ],

    // Pentatonics
    [
        CHORD_MINOR9,
        CHORD_MAJOR9,
        CHORD_DOMINANT9,
        CHORD_MINOR_FLAT9,
        // CHORD_MAJOR7_SHARP11, TODO add this when conflict with chords and scales is resolved
        SCALE_NATURALPENTATONIC,
        SCALE_KUMOIPENTATONIC,
        SCALE_HIROJOSHIPENTATONIC,
        SCALE_ANTONIOPENTATONIC,
    ], 

    // Hexatonics
    [
        SCALE_WHOLETONE,
        SCALE_AUGMENTED,
        SCALE_BLUES,
    ],

    // septatonics
    [
        SCALE_NATURAL,
        SCALE_MELODIC,
        SCALE_HARMONICMINOR,
        SCALE_HARMONICMAJOR,
        SCALE_DOUBLEHARMONIC,
        SCALE_HUNGARIANMAJOR,
        SCALE_NEOPOLITANMAJOR,
        SCALE_NEOPOLITANMINOR,
        SCALE_PERSIAN,
        SCALE_ENIGMATICMINOR,
        SCALE_ASCENDINGENIGMATICMAJOR,
        SCALE_DESCENDINGENIGMATICMAJOR,
        SCALE_LOCRIANNATURAL7,
    ],

    // octatonics
    [
        SCALE_DIMINISHED,
        SCALE_8TONESPANISH,
        SCALE_DOMINANTBEEBOP,
        SCALE_DORIANBEEBOP,
        SCALE_MELODICMINORBEEBOP,
        SCALE_MAJORBEEBOP,
        SCALE_PHRYGIANDOMINANTBEEBOP,
    ],

    // nonatonics
    [],

    // decatonics
    [],

    // undecatonics
    [],

    // dodecatonics
    [
        SCALE_CHROMATIC
    ],
];