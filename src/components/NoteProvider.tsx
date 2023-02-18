import React from "react";

const noteSetContext = React.createContext((noteSet: NoteSet) => { return new Set<number>() });
const updateNoteSetContext = React.createContext((noteSet: NoteSet, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false) => { });

type Props = {
    children: JSX.Element
}

export enum NoteSet {
    Active,
    Emphasized,
    Highlighted,
}

function NoteProvider(props: Props) {
    const [noteSets, setNoteSets] = React.useState({
        [NoteSet.Active]: new Set<number>([0, 2, 3, 5, 7, 9, 10]),
        [NoteSet.Emphasized]: new Set<number>(),
        [NoteSet.Highlighted]: new Set<number>(),
    });
    const getNoteSet = React.useCallback((noteSet: NoteSet) => {
        return noteSets[noteSet];
    }, [noteSets]);
    const setNoteSet = React.useCallback((noteSet: NoteSet, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false) => {
        const startingPoint = overwriteExisting ? new Set<number>() : noteSets[noteSet];

        nums = nums.map(elem => {
            return ((12 * 12) + elem) % 12;
        });

        if (areEnabled) {
            setNoteSets({
                ...noteSets,
                [noteSet]: new Set(Array.from(startingPoint).concat(nums))
            });
        }
        else {
            const numsSet = new Set(nums);
            setNoteSets({
                ...noteSets,
                [noteSet]: new Set(Array.from(startingPoint).filter(elem => !numsSet.has(elem)))
            });
        }
    }, [noteSets]);

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

export default NoteProvider;