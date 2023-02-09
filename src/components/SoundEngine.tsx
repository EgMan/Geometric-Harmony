import { Song, Track, Instrument } from 'reactronica';
import useKeypressPlayer from './KeypressPlayer';
import { useActiveNotes, useEmphasizedNotes } from './NoteProvider';
import React from 'react';

const numberToNote = ["C3", "C#3", "D3", "D#3", "E3", "F3", "F#3", "G3", "G#3", "A3", "A#3", "B3"];

export function getNoteName(i: number) {
    return numberToNote[i] ?? "unknown";
}

type Props =
    {

    }

function SoundEngine(props: Props) {
    useKeypressPlayer();

    const emphasizedNotes = useEmphasizedNotes();
    const activeNotes = useActiveNotes();
    const playingNotes = Array.from(emphasizedNotes).filter(note => activeNotes.has(note));

    const playNotes = playingNotes.map(note => {
        return {
            name: getNoteName(note),
            velocity: 0.8,
        }
    });

    return (
        <Song isPlaying={true}>
            <Track>
                <Instrument
                    key={"synth"}
                    type="amSynth"
                    notes={playNotes}
                    envelope={{
                        attack: .1,
                        release: 0.5,
                    }}
                />
            </Track>
        </Song>
    );
}
export default SoundEngine;