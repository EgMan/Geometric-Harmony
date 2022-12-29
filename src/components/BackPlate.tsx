import React from "react";
import { Rect } from "react-konva";
import { useSetAreNotesEmphasized } from "./NoteProvider";

type Props =
    {
        width: number
        height: number
    }

function BackPlate(props: Props): JSX.Element {
    const setEmphasizedNotes = useSetAreNotesEmphasized();
    const resetEmphasizedNotes = () => {setEmphasizedNotes([], false, true)}
    return (<Rect x={0} y={0} width={props.width} height={props.height} fill="rgba(0,0,0,0)" onMouseEnter={resetEmphasizedNotes}/>);
}

export default BackPlate;