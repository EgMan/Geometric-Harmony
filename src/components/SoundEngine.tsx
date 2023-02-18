import { Song, Track, Instrument } from 'reactronica';
import useKeypressPlayer from './KeypressPlayer';
import { useActiveNotes, useEmphasizedNotes } from './NoteProvider';
import React from 'react';
import { getNote } from './Utils';

type Props = {}

function SoundEngine(props: Props) {
    useKeypressPlayer();

    const emphasizedNotes = useEmphasizedNotes();
    const activeNotes = useActiveNotes();
    const playingNotes = Array.from(emphasizedNotes).filter(note => activeNotes.has(note));
    const [forceCutoff, setForceCutoff] = React.useState(false);

    const playNotes = playingNotes.map(note => {
        return {
            name: getNote(note),
            velocity: 0.8,
        }
    });

    React.useEffect(() => {
        const onMouseUp = (event: MouseEvent) => {
            if (playNotes.length === 0) {
                setForceCutoff(true);
            }
        }
        window.addEventListener("mouseup", onMouseUp);

        return () => {
            window.removeEventListener("mouseup", onMouseUp);
        }
    }, [playNotes.length]);

    if (forceCutoff && playNotes.length > 0) {
        setForceCutoff(false);
    }
    else if (forceCutoff) {
        return <Song key="song" isPlaying={false} />;
    }

    return (
        <Song key="song" isPlaying={playNotes.length > 0}>
            <Track key="track">
                <Instrument
                    key="synth"
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