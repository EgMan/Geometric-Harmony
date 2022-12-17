import React from "react";

// const ActiveNoteContext = React.createContext((i: number) => new Boolean());
const ActiveNotesContext = React.createContext(new Set<number>());
const ActiveNoteUpdateContext = React.createContext((nums: Array<number>, areActive: boolean, overwriteExisting: boolean = false)=>{});

// const EmphasizedNoteContext = React.createContext((i: number) => new Boolean());
const EmphasizedNotesContext = React.createContext(new Set<number>());
const EmphasizedNoteUpdateContext = React.createContext((nums: Array<number>, areActive: boolean, overwriteExisting: boolean = false)=>{});

type Props = {
    children: JSX.Element
}

function NoteProvider(props:Props) {
    const [activeNotes, setActiveNotes] = React.useState(new Set<number>());

    const setAreNotesActive = (nums: Array<number>, areActive: boolean, overwriteExisting: boolean = false) => {
            const startingPoint = overwriteExisting ? new Set<number>() : activeNotes;
            
            if (areActive)
            {
                setActiveNotes(new Set(Array.from(startingPoint).concat(nums)))
            }
            else{
                const numsSet = new Set(nums);
                setActiveNotes(new Set(Array.from(startingPoint).filter(elem => !numsSet.has(elem))));
            }
        }

    const [emphasizedNotes, setEmphasizedNotes] = React.useState(new Set<number>());

    const setAreNotesEmphasized = (nums: Array<number>, areActive: boolean, overwriteExisting: boolean = false) => {
            const startingPoint = overwriteExisting ? new Set<number>() : emphasizedNotes;
            
            if (areActive)
            {
                setEmphasizedNotes(new Set(Array.from(startingPoint).concat(nums)))
            }
            else{
                const numsSet = new Set(nums);
                setEmphasizedNotes(new Set(Array.from(startingPoint).filter(elem => !numsSet.has(elem))));
            }
        }

    return (
        <EmphasizedNotesContext.Provider value={emphasizedNotes}>
                <EmphasizedNoteUpdateContext.Provider value={setAreNotesEmphasized}>
                    <ActiveNotesContext.Provider value={activeNotes}>
                            <ActiveNoteUpdateContext.Provider value={setAreNotesActive}>
                                {props.children}
                            </ActiveNoteUpdateContext.Provider>
                    </ActiveNotesContext.Provider>
                </EmphasizedNoteUpdateContext.Provider>
        </EmphasizedNotesContext.Provider>
    );
}

export function useActiveNotes()
{
    return React.useContext(ActiveNotesContext);
}

export function useSetAreNotesActive()
{
    return React.useContext(ActiveNoteUpdateContext);
}

export function useEmphasizedNotes()
{
    return React.useContext(EmphasizedNotesContext);
}

export function useSetAreNotesEmphasized()
{
    return React.useContext(EmphasizedNoteUpdateContext);
}

export default NoteProvider;