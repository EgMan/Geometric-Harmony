import React from "react";

const ActiveNoteContext = React.createContext((i: number) => new Boolean());
const ActiveNotesContext = React.createContext(() => new Array<number>());
const ActiveNoteUpdateContext = React.createContext((i: number, isActive: boolean)=>{});
const EmphasizedNoteContext = React.createContext((i: number) => new Boolean());
const EmphasizedNoteUpdateContext = React.createContext((i: number, isEmphasized: boolean, clearOthers: boolean = false)=>{});

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

export function useIsNoteEmphasized()
{
    return React.useContext(EmphasizedNoteContext);
}

export function useSetIsNoteEmphasized()
{
    return React.useContext(EmphasizedNoteUpdateContext);
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

    const [emphasizedNotes, setEmphasizedNotes] = React.useState(new Map());

    const useSetIsNoteEmphasized = (i: number, isEmphasized: boolean, clearOthers: boolean = false) => {
            if (clearOthers)
            {
                setEmphasizedNotes(new Map().set(i, isEmphasized));
            }
            else
            {
                setEmphasizedNotes(new Map(emphasizedNotes.set(i, isEmphasized)));
            }
        }

    const getIsNoteEmphasized = (i: number) => {
            return emphasizedNotes.get(i) === true;
        }

    return (
        <EmphasizedNoteContext.Provider value={getIsNoteEmphasized}>
            <EmphasizedNoteUpdateContext.Provider value={useSetIsNoteEmphasized}>
                <ActiveNotesContext.Provider value={getAllActiveNotes}>
                    <ActiveNoteContext.Provider value={getIsNoteActive}>
                        <ActiveNoteUpdateContext.Provider value={setIsNoteActive}>
                            {props.children}
                        </ActiveNoteUpdateContext.Provider>
                    </ActiveNoteContext.Provider>
                </ActiveNotesContext.Provider>
            </EmphasizedNoteUpdateContext.Provider>
        </EmphasizedNoteContext.Provider>
    );
}