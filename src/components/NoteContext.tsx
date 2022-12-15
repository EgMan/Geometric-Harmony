import React from "react";

const ActiveNoteContext = React.createContext((i: number) => new Boolean());
const ActiveNotesContext = React.createContext(() => new Array<number>());
const ActiveNoteUpdateContext = React.createContext((i: number, isActive: boolean)=>{});

export function useGetAllActiveNotes()
{
    return React.useContext(ActiveNotesContext);
}

export function useIsNoteActive()
{
    return React.useContext(ActiveNoteContext);
}

export function useSetIsNoteActive()
{
    return React.useContext(ActiveNoteUpdateContext);
}

type Props = {
    children: JSX.Element
}

export function NoteProvider(props:Props) {
    const [activeNotes, setActiveNotes] = React.useState(new Map());

    const setIsNoteActive = (i: number, isActive: boolean) => {
            const newMap = activeNotes.set(i, isActive);
            setActiveNotes(new Map(newMap))
        }

    const getIsNoteActive = (i: number) => {
            return activeNotes.get(i) === true;
        }

    const getAllActiveNotes = () => {
        const notes: number[] = Array.from(activeNotes).filter((elem) => {return elem[1] === true}).map(elem => {
            return elem[0];
        });
        return notes;
    }

    return (
        <ActiveNotesContext.Provider value={getAllActiveNotes}>
            <ActiveNoteContext.Provider value={getIsNoteActive}>
                <ActiveNoteUpdateContext.Provider value={setIsNoteActive}>
                    {props.children}
                </ActiveNoteUpdateContext.Provider>
            </ActiveNoteContext.Provider>
        </ActiveNotesContext.Provider>
    );
}