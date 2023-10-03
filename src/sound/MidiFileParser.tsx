import React from 'react';
import * as fs from 'fs';
import { parseMidi, MidiNoteOnEvent, MidiBaseEvent, MidiNoteMixins, MidiChannelEvent, MidiSetTempoEvent } from "midi-file";
import * as midiManager from 'midi-file';
import { NoteSet, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote } from './MIDIInterface';
import { getNoteName } from '../utils/Utils';

type Props = {
}

type MidiEventTracker = {
    eventIndex: number,
    ticksTraversed: number,
};

const scheduleAheadMS = 100;
const scheduleBehindMS = 10;

export function MidiFileParser(props: Props) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const updateNotes = useUpdateNoteSet();

    // const [midiData, setMidiData] = React.useState<midiManager.MidiData | null>(null);
    // const [midiEventTrackers, setMidiEventTrackers] = React.useState<MidiEventTracker[] | null>(null);
    const midiData = React.useRef<midiManager.MidiData | null>(null);
    const midiEventTrackers = React.useRef<MidiEventTracker[] | null>(null);
    const lastTime = React.useRef<number>(window.performance.now());
    const startTime = React.useRef<number>(window.performance.now());
    const microsecPerBeat = React.useRef<number>(60000000 / 120);

    const scheduleEvent = React.useCallback((event: midiManager.MidiEvent, msFromNow: number, track: number) => {
        setTimeout(() => {
            if (event.type === 'noteOn' || event.type === 'noteOff') {
                updateNotes(`NoteSet.MIDIFileInput-Track${track}-channel${event.channel}`, [midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, 3)], event.type === 'noteOn', false, new Set([NoteSet.MIDIFileInput]), "purple");
                // console.log("scheduled event", getNoteName(midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, 3), new Set()), event, msFromNow);
            }
        }, msFromNow);
    }, [updateNotes]);

    // var lastTime = window.performance.now();
    const tickWithDrift = React.useCallback(() => {
        if (!midiData || !midiEventTrackers) { return; }
        // console.log("time since last", now - lastTime.current);
        // lastTime.current = now;
        const microsecPerTick = microsecPerBeat.current / ((midiData.current?.header?.ticksPerBeat ?? 400));

        midiData.current?.tracks.forEach((track, trackIdx) => {
            if (trackIdx !== 0 && trackIdx !== 1) { return; }

            // check index bounds here
            if (!midiEventTrackers.current) { return; }
            const eventTracker = midiEventTrackers.current[trackIdx];
            const now = window.performance.now();

            var eventTimeTicks = eventTracker.ticksTraversed;

            while (midiEventTrackers.current[trackIdx].eventIndex < track.length) {
                var nextEvent = track[midiEventTrackers.current[trackIdx].eventIndex];

                // THIS IS WHERE THE BUG IS FASHO
                eventTimeTicks += nextEvent.deltaTime ?? 0;
                const eventTimeMS = eventTimeTicks * microsecPerTick / 1000;

                if (startTime.current + eventTimeMS > now + scheduleAheadMS) {
                    break;
                }

                if (nextEvent.type === 'noteOn' || nextEvent.type === 'noteOff') {
                    scheduleEvent(nextEvent, eventTimeMS + startTime.current - now, trackIdx);
                }

                if (nextEvent.type === 'setTempo') {
                    microsecPerBeat.current = (nextEvent as MidiSetTempoEvent).microsecondsPerBeat;
                    console.log("parsed tempo: ", 60000000 / microsecPerBeat.current);
                }

                // eventTracker.ticksTraversed = eventTime;
                // setMidiEventTrackers(prev => { const trackers = prev ?? []; trackers[trackIdx].eventIndex += 1; return trackers; });
                midiEventTrackers.current[trackIdx].ticksTraversed = eventTimeTicks;
                midiEventTrackers.current[trackIdx].eventIndex++;

                // console.log(`track ${trackIdx} : ${midiEventTrackers.current[trackIdx].eventIndex} / ${midiData.current?.tracks[trackIdx].length} ${100 * midiEventTrackers.current[trackIdx].eventIndex / (midiData.current?.tracks[trackIdx].length ?? 1)}%`)
            }
        });

        setTimeout(() => {
            tickWithDrift();
        }, 10);
    }, [midiData, midiEventTrackers, scheduleEvent]);

    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onInputChange = React.useCallback(async () => {
        if (!inputRef.current) { return; }
        const source: HTMLInputElement = inputRef.current;
        if (!source.files) { return; }
        const arrBuffer = await source.files[0].arrayBuffer();
        const input = new Uint8Array(arrBuffer);
        const parsed = midiManager.parseMidi(input);
        // setMidiEventTrackers(new Array(parsed.tracks.length).fill({ eventIndex: 0, ticksTraversed: 0 }));
        // setMidiData(parsed);
        midiData.current = parsed;
        midiEventTrackers.current = new Array(parsed.tracks.length).fill({ eventIndex: 0, ticksTraversed: 0 });
        startTime.current = window.performance.now();
        microsecPerBeat.current = 60000000 / 120;
        console.log("Midi data parsed: ", parsed);


        tickWithDrift();
        // parsed.tracks.forEach((track, index) => {
        //     // const naivegarbage = track.filter(event => event.type === 'noteOn' || event.type === 'noteOff');
        //     var shittytimer = 0;

        //     const audioCtx = new AudioContext();
        //     // Older webkit/blink browsers require a prefix

        //     // …

        //     console.log("audiotime ", audioCtx.currentTime);
        //     console.log("systime ", new Date().getTime());
        //     console.log("perftime ", window.performance.now());
        //     naivegarbage.forEach(event => {
        //         shittytimer += event.deltaTime ?? 0;
        //         if ((event as { channel: number | null | undefined })?.channel === 9) { return; }
        //         setTimeout(() => {
        //             updateNotes(NoteSet.PlayingInput, [midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, 3)], event.type === 'noteOn', false);
        //             console.log(event);
        //         }, shittytimer * msPerTick);
        //     });
        // });

        // naivegarbage();
        // const out = parseMidi(input);
        // console.log(out);
        // out.tracks.sort((a, b) => a.de - b.length);
    }, [tickWithDrift]);




    return (
        <div>
            <input onChange={onInputChange} ref={inputRef} type="file" id="filereader" />
        </div>
    );
}