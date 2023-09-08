import React from "react";

const homeNoteContext = React.createContext<number | null>(null);
const setHomeNoteContext = React.createContext((note: number | null) => { });
const noteSetContext = React.createContext((noteSet: NoteSet, normalizeToOneOctave?: boolean) => { return new Set<number>() });
const updateNoteSetContext = React.createContext((noteSet: NoteSet[] | NoteSet, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false) => { });

type Props = {
    children: JSX.Element
}

export enum NoteSet {
    Active,
    Highlighted,
    Emphasized,
    Emphasized_OctaveGnostic,
    PlayingInput,
}

const octaveAgnosticNoteSets = new Set([NoteSet.Active, NoteSet.Emphasized, NoteSet.Highlighted]);

function NoteProvider(props: Props) {
    const [noteSets, setNoteSets] = React.useState({
        [NoteSet.Active]: new Set<number>([0, 2, 3, 5, 7, 9, 10]),
        [NoteSet.Emphasized]: new Set<number>(),
        [NoteSet.Highlighted]: new Set<number>(),
        [NoteSet.Emphasized_OctaveGnostic]: new Set<number>(),
        [NoteSet.PlayingInput]: new Set<number>(),
    });
    const [homeNoteRaw, setHomeNoteRaw] = React.useState<number | null>(10);
    const homeNote = React.useMemo(() => homeNoteRaw !== null && noteSets[NoteSet.Active].has(homeNoteRaw) ? homeNoteRaw : null, [homeNoteRaw, noteSets]);
    const setHomeNote = React.useCallback((note: number | null) => {
        // if (noteSets[NoteSet.Active].has(note)) {
        setHomeNoteRaw(note === null ? null : normalizeToSingleOctave(note));
        // }
    }, []);

    // Clear home note if no longer active
    React.useEffect(() => {
        if (homeNoteRaw !== null && !noteSets[NoteSet.Active].has(homeNoteRaw)) {
            setHomeNoteRaw(null);
        }
    }, [homeNote, homeNoteRaw, noteSets]);

    const getNoteSet = React.useCallback((noteSet: NoteSet, normalizeToOneOctave?: boolean) => {
        if (normalizeToOneOctave) {
            return new Set(Array.from(noteSets[noteSet]).map(elem => normalizeToSingleOctave(elem)));
        }
        return noteSets[noteSet];
        // return new Set(Array.from(noteSets[noteSet]).map(elem => {
        //     return ((12 * 12) + elem) % 12;
        // }));
    }, [noteSets]);
    /*
    const setNoteSet = React.useCallback((noteSetsToUpdate: NoteSet[] | NoteSet, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false) => {
        const writeToNoteSet = (noteSet: NoteSet) => {
            const startingPoint = overwriteExisting ? new Set<number>() : { ...noteSets[noteSet] };

            const maybeModdedNums = !octaveAgnosticNoteSets.has(noteSet) ? nums : nums.map(elem => {
                return ((12 * 12) + elem) % 12;
            });

            // function areSetsEqual(setA, setB) {
            if (noteSets[noteSet].size === maybeModdedNums.size) {
                return false;
            }
            for (let element of maybeModdedNums) {
                if (!setB.has(element)) {
                    return false;
                }
            }
            return true;
            // }

            setNoteSets(prevState => {
                if (areEnabled) {
                    return {
                        ...prevState,
                        [noteSet]: new Set(Array.from(startingPoint).concat(maybeModdedNums))
                    }
                }
                else {
                    const numsSet = new Set(maybeModdedNums);
                    return {
                        ...prevState,
                        [noteSet]: new Set(Array.from(startingPoint).filter(elem => !numsSet.has(elem)))
                    }
                }
            });
        };
        if (noteSetsToUpdate instanceof Array) {
            noteSetsToUpdate.forEach(writeToNoteSet);
        }
        else {
            writeToNoteSet(noteSetsToUpdate);
        }
    }, [noteSets]);
    */
    const setNoteSet = React.useCallback(
        (noteSetsToUpdate: NoteSet[] | NoteSet, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false) => {
            const newNoteSets = { ...noteSets };  // Make a shallow copy of the current state

            const writeToNoteSet = (noteSet: NoteSet) => {
                const startingPoint = overwriteExisting ? new Set<number>() : newNoteSets[noteSet];

                const maybeModdedNums = !octaveAgnosticNoteSets.has(noteSet) ? nums : nums.map(elem => {
                    return ((12 * 12) + elem) % 12;
                });

                if (areEnabled) {
                    newNoteSets[noteSet] = new Set(Array.from(startingPoint).concat(maybeModdedNums));
                } else {
                    const numsSet = new Set(maybeModdedNums);
                    newNoteSets[noteSet] = new Set(Array.from(startingPoint).filter(elem => !numsSet.has(elem)));
                }
            };

            if (noteSetsToUpdate instanceof Array) {
                noteSetsToUpdate.forEach(writeToNoteSet);
            } else {
                writeToNoteSet(noteSetsToUpdate);
            }

            // Only update the state if there's a genuine change
            for (const key in newNoteSets) {
                const keynum = Number(key) as NoteSet;
                if (!noteSets[keynum] ||
                    newNoteSets[keynum].size !== noteSets[keynum].size ||
                    !Array.from(newNoteSets[keynum]).every(elem => noteSets[keynum].has(elem))) {
                    setNoteSets(newNoteSets);
                    return;
                }
            }
        },
        [noteSets]
    );


    // For adding new shapes
    // React.useEffect(() => {
    //     const activeNotes = getNoteSet(NoteSet.Active);
    //     var str = "";
    //     Array.from(Array(12).keys()).forEach(elem => {
    //         str += `[${activeNotes.has(elem) ? "true" : "false"}], `
    //     });
    //     // console.log(`${activeNotes.size} active notes: `, Array.from(Array(12).keys()).map(elem => activeNotes.has(elem)));
    //     console.log(`[${str.slice(0, -2)}]`);
    // }, [getNoteSet, noteSets]);


    return (
        <noteSetContext.Provider value={getNoteSet}>
            <updateNoteSetContext.Provider value={setNoteSet}>
                <homeNoteContext.Provider value={homeNote}>
                    <setHomeNoteContext.Provider value={setHomeNote}>
                        {props.children}
                    </setHomeNoteContext.Provider>
                </homeNoteContext.Provider>
            </updateNoteSetContext.Provider>
        </noteSetContext.Provider>
    );
}

export function useNoteSet() {
    return React.useContext(noteSetContext);
}

export function useUpdateNoteSet() {
    return React.useContext(updateNoteSetContext);
}

export function useHomeNote() {
    return React.useContext(homeNoteContext);
}

export function useSetHomeNote() {
    return React.useContext(setHomeNoteContext);
}

export function normalizeToSingleOctave(i: number) {
    return ((12 * 12) + i) % 12;
}

// TODO we can get rid of this function
export function useGetCombinedModdedEmphasis() {
    const getNoteSet = useNoteSet();
    return React.useCallback(() => {
        const emphasized = getNoteSet(NoteSet.Emphasized);
        var emphasizedOctaveGnostic = getNoteSet(NoteSet.Emphasized_OctaveGnostic);

        emphasizedOctaveGnostic = new Set(Array.from(emphasizedOctaveGnostic).map(elem => {
            return normalizeToSingleOctave(elem);
        }));

        //There has gotta be a better way to union two sets
        return new Set(Array.from(emphasizedOctaveGnostic).concat(Array.from(emphasized)));
    }, [getNoteSet]);
}

export function useCheckNoteEmphasis() {
    const getNoteSet = useNoteSet();
    return React.useCallback((note: number, octaveGnostic: boolean) => {
        const emphasized = getNoteSet(NoteSet.Emphasized);
        var emphasizedOctaveGnostic = getNoteSet(NoteSet.Emphasized_OctaveGnostic);

        if (!octaveGnostic) {
            emphasizedOctaveGnostic = new Set(Array.from(emphasizedOctaveGnostic).map(elem => {
                return normalizeToSingleOctave(elem);
            }));
            return emphasized.has(note) || emphasizedOctaveGnostic.has(note);
        }

        return emphasizedOctaveGnostic.has(note) || emphasized.has(normalizeToSingleOctave(note));
    }, [getNoteSet]);
}

export default NoteProvider;
