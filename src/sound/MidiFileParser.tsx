import React from 'react';
import * as fs from 'fs';
import { parseMidi, MidiNoteOnEvent, MidiBaseEvent, MidiNoteMixins } from "midi-file";
import * as midiManager from 'midi-file';
import { NoteSet, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote } from './MIDIInterface';

type Props = {
}

export function MidiFileParser(props: Props) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const updateNotes = useUpdateNoteSet();
    const onInputChange = React.useCallback(async () => {
        if (!inputRef.current) { return; }
        const source: HTMLInputElement = inputRef.current;
        if (!source.files) { return; }
        const arrBuffer = await source.files[0].arrayBuffer();
        const input = new Uint8Array(arrBuffer);
        const parsed = midiManager.parseMidi(input);
        console.log(parsed);
        const garbagemergedtracks = parsed.tracks[1];
        // const garbagemergedtracks = parsed.tracks.reduce((arr, item) => {
        //     return arr.concat(item);
        // }, []);
        updateNotes(NoteSet.Emphasized_OctaveGnostic, [1], true, false);
        updateNotes(NoteSet.Emphasized_OctaveGnostic, [0], true, false);
        // parsed.tracks.forEach((track, index) => {
        //     const naivegarbage = track.filter(event => event.type === 'noteOn' || event.type === 'noteOff');
        //     var shittytimer = 0;
        //     naivegarbage.forEach(event => {
        //         shittytimer += event.deltaTime ?? 0;
        //         setTimeout(() => {
        //             updateNotes(NoteSet.Emphasized_OctaveGnostic, [midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, 3)], event.type === 'noteOn', false);
        //             console.log(event);
        //         }, shittytimer * 10);
        //     });
        // });

        // naivegarbage();
        // const out = parseMidi(input);
        // console.log(out);
        // out.tracks.sort((a, b) => a.de - b.length);
    }, [updateNotes]);
    return (
        <div>
            <input onChange={onInputChange} ref={inputRef} type="file" id="filereader" />
        </div>
    );
}