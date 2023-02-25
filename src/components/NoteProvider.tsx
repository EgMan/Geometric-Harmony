import React from "react";

const noteSetContext = React.createContext((noteSet: NoteSet) => { return new Set<number>() });
const updateNoteSetContext = React.createContext((noteSet: NoteSet[] | NoteSet, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false) => { });

type Props = {
    children: JSX.Element
}

export enum NoteSet {
    Active,
    Highlighted,
    Emphasized,
    Emphasized_OctaveGnostic,
}

const octaveAgnosticNoteSets = new Set([NoteSet.Active, NoteSet.Emphasized, NoteSet.Highlighted]);

function NoteProvider(props: Props) {
    const [noteSets, setNoteSets] = React.useState({
        [NoteSet.Active]: new Set<number>([0, 2, 3, 5, 7, 9, 10]),
        [NoteSet.Emphasized]: new Set<number>(),
        [NoteSet.Highlighted]: new Set<number>(),
        [NoteSet.Emphasized_OctaveGnostic]: new Set<number>(),
    });
    const getNoteSet = React.useCallback((noteSet: NoteSet) => {
        return noteSets[noteSet];
        // return new Set(Array.from(noteSets[noteSet]).map(elem => {
        //     return ((12 * 12) + elem) % 12;
        // }));
    }, [noteSets]);
    const setNoteSet = React.useCallback((noteSetsToUpdate: NoteSet[] | NoteSet, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false) => {
        const writeToNoteSet = (noteSet: NoteSet) => {
            const startingPoint = overwriteExisting ? new Set<number>() : noteSets[noteSet];

            const maybeModdedNums = !octaveAgnosticNoteSets.has(noteSet) ? nums : nums.map(elem => {
                return ((12 * 12) + elem) % 12;
            });

            if (areEnabled) {
                setNoteSets(prevState => {
                    return {
                        ...prevState,
                        [noteSet]: new Set(Array.from(startingPoint).concat(maybeModdedNums))
                    }
                });
            }
            else {
                const numsSet = new Set(maybeModdedNums);
                setNoteSets(prevState => {
                    return {
                        ...prevState,
                        [noteSet]: new Set(Array.from(startingPoint).filter(elem => !numsSet.has(elem)))
                    }
                });
            }
        };
        if (noteSetsToUpdate instanceof Array) {
            noteSetsToUpdate.forEach(writeToNoteSet);
        }
        else {
            writeToNoteSet(noteSetsToUpdate);
        }
    }, [noteSets]);

    React.useEffect(() => {
        const activeNotes = getNoteSet(NoteSet.Active);
        var str = "";
        Array.from(Array(12).keys()).forEach(elem => {
            str += `[${activeNotes.has(elem) ? "true" : "false"}], `
        });
        // console.log(`${activeNotes.size} active notes: `, Array.from(Array(12).keys()).map(elem => activeNotes.has(elem)));
        console.log(`[${str.slice(0, -2)}]`);
    }, [getNoteSet, noteSets]);


    return (
        <noteSetContext.Provider value={getNoteSet}>
            <updateNoteSetContext.Provider value={setNoteSet}>
                {props.children}
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

        const normalizeToSingleOctave = (i: number) => {
            return ((12 * 12) + i) % 12;
        }

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