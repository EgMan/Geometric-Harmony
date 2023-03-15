import { Song, Track, Instrument } from 'reactronica';
import useKeypressPlayer from './KeypressPlayer';
import React from 'react';
import { getNote, getNoteMIDI, usePrevious } from './Utils';
import { NoteSet, normalizeToSingleOctave, useNoteSet } from './NoteProvider';
import { useConnectToMidi } from './MIDIInterface';
import { WebMidi } from "webmidi";

type Props = {}

function SoundEngine(props: Props) {
    useKeypressPlayer();
    useConnectToMidi();

    const activeNotes = useNoteSet()(NoteSet.Active);
    const emphasizedNotes = useNoteSet()(NoteSet.Emphasized);
    const emphasizedNotesOctaveGnostic = useNoteSet()(NoteSet.Emphasized_OctaveGnostic);
    const playingNotes = Array.from(emphasizedNotes).concat(Array.from(emphasizedNotesOctaveGnostic)).filter(note => activeNotes.has(normalizeToSingleOctave(note)));
    const previousPlayingNotes = usePrevious<number[]>(playingNotes, []);

    React.useEffect(() => {
        WebMidi.outputs.forEach(output => {
            const notesturnedoff = previousPlayingNotes.filter(note => !playingNotes.includes(note));
            const notesturnedon = playingNotes.filter(note => !previousPlayingNotes.includes(note));
            // output.stopNote(notesturnedoff.map(note => getNote(note)));
            // output.playNote(playingNoteNames);
            if (notesturnedon.length > 0) {
                console.log(`Turning on notes: ${notesturnedon.map(note => getNoteMIDI(note))}`);
            }
            if (notesturnedoff.length > 0) {
                console.log(`Turning off notes: ${notesturnedoff.map(note => getNoteMIDI(note))}`);
            }
            output.sendNoteOff(notesturnedoff.map(note => getNoteMIDI(note)));
            output.sendNoteOn(notesturnedon.map(note => getNoteMIDI(note)));
        });
    }, [playingNotes, previousPlayingNotes]);

    const [forceCutoff, setForceCutoff] = React.useState(false);

    const playNotes = React.useMemo(() => {
        return playingNotes.map(note => {
            return {
                name: getNote(note),
                velocity: 0.8,
            }
        });
    }, [playingNotes]);

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