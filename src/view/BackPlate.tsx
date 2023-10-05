import React from "react";
import { Rect } from "react-konva";
import { NoteSet, useUpdateNoteSet } from "../sound/NoteProvider";

type Props =
    {
        width: number
        height: number
    }

function BackPlate(props: Props): JSX.Element {
    const updateNotes = useUpdateNoteSet();
    const resetEmphasizedNotes = () => { updateNotes([NoteSet.Emphasized, NoteSet.Emphasized_OctaveGnostic], [], false, true) }

    // TODO Come back and remove this if I don't miss it at all
    return <></>;
    // return (
    // <Rect key="backplate"
    //     x={0}
    //     y={0}
    //     width={props.width}
    //     height={props.height}
    //     fill="rgba(0,0,0,0)"
    // onMouseEnter={resetEmphasizedNotes} 
    // />
    // );
}

export default BackPlate;