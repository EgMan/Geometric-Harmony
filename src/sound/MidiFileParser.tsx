import React from 'react';
import { MidiNoteMixins, MidiSetTempoEvent, MidiProgramChangeEvent, MidiKeySignatureEvent } from "midi-file";
import * as midiManager from 'midi-file';
import { NoteSet, useClearChannelsOfType, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote } from './MIDIInterface';
import { WebMidi } from 'webmidi';

type Props = {
    closeContainer: () => void,
}

type MidiEventTracker = {
    eventIndex: number,
    ticksTraversed: number,
    msTraversed: number,
    programNumber: number,
};

const scheduleAheadMS = 100;
const scheduleBehindMS = 10;

type MidiDataContextType = {
    midiData: React.MutableRefObject<midiManager.MidiData | null>,
    midiEventTrackers: React.MutableRefObject<MidiEventTracker[] | null>,
    lastTime: React.MutableRefObject<number>,
    startTime: React.MutableRefObject<number>,
    microsecPerBeat: React.MutableRefObject<number>,
    inputRef: React.MutableRefObject<HTMLInputElement | null>,
    loadedFileNameState: [string | null, React.Dispatch<React.SetStateAction<string | null>>],
};
const midiDataContext = React.createContext<MidiDataContextType | null>(null);
type ProviderProps = {
    children: JSX.Element
}
export function MidiFileDataProvider({ children }: ProviderProps) {
    // const midiData = React.useRef<midiManager.MidiData | null>(null);
    // const midiEventTrackers = React.useRef<MidiEventTracker[] | null>(null);
    // const lastTime = React.useRef<number>(window.performance.now());
    // const startTime = React.useRef<number>(window.performance.now());
    // const microsecPerBeat = React.useRef<number>(60000000 / 120);
    // const inputRef = React.useRef<HTMLInputElement>(null);
    // const [loadedFilename, setLoadedFilename] = React.useState<string | null>(null);
    // return {
    //     midiData: React.useRef<midiManager.MidiData | null>(null),
    //     midiEventTrackers: React.useRef<MidiEventTracker[] | null>(null),
    //     lastTime: React.useRef<number>(window.performance.now()),
    //     startTime: React.useRef<number>(window.performance.now()),
    //     microsecPerBeat: React.useRef<number>(60000000 / 120),
    //     inputRef: React.useRef<HTMLInputElement>(null),
    //     loadedFileName: React.useState<string | null>(null),
    // };

    return (
        <midiDataContext.Provider value={{
            midiData: React.useRef<midiManager.MidiData | null>(null),
            midiEventTrackers: React.useRef<MidiEventTracker[] | null>(null),
            lastTime: React.useRef<number>(window.performance.now()),
            startTime: React.useRef<number>(window.performance.now()),
            microsecPerBeat: React.useRef<number>(60000000 / 120),
            inputRef: React.useRef<HTMLInputElement>(null),
            loadedFileNameState: React.useState<string | null>(null),
        }}>
            {children}
        </midiDataContext.Provider >
    );
}

export function MidiFileParser(props: Props) {
    const updateNotes = useUpdateNoteSet();
    const clearChannels = useClearChannelsOfType();
    const stateContext = React.useContext(midiDataContext);
    if (!stateContext) { throw new Error("MidiFileParser must be a child of MidiFileDataProvider"); }
    const { midiData, midiEventTrackers, startTime, microsecPerBeat, inputRef, loadedFileNameState } = stateContext;
    const [loadedFileName, setLoadedFilename] = loadedFileNameState;

    // const [midiData, setMidiData] = React.useState<midiManager.MidiData | null>(null);
    // const [midiEventTrackers, setMidiEventTrackers] = React.useState<MidiEventTracker[] | null>(null);

    const scheduleEvent = React.useCallback((event: midiManager.MidiEvent, msFromNow: number, track: number) => {
        setTimeout(() => {
            const tracker = stateContext.midiEventTrackers.current?.[track];
            if (!tracker) { return; }
            if (event.type === 'noteOn' || event.type === 'noteOff') {
                // if ((event as MidiNoteMixins).noteNumber > 34 && (event as MidiNoteMixins).noteNumber < 49 && (event as MidiNoteMixins).noteNumber != 58) {
                if (
                    // (tracker.programNumber === 0 && (stateContext.midiEventTrackers.current?.length ?? 0) > 1) || 
                    tracker.programNumber > 96) {
                    console.log("Is this drums?", track);
                    return;
                };
                updateNotes(`${NoteSet.MIDIFileInput}-Track${track}`, [midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, Math.floor((event as MidiNoteMixins).noteNumber / 12) - 1)], event.type === 'noteOn', false, new Set([NoteSet.MIDIFileInput]), `hsl(${(track * 2 * 360 / 16) % 360}, 100%, 50%)`);
                // console.log("scheduled event", getNoteName(midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, 3), new Set()), event, msFromNow);
            }
        }, msFromNow);
    }, [stateContext.midiEventTrackers, updateNotes]);

    // var lastTime = window.performance.now();
    const tickWithDrift = React.useCallback(() => {
        if (!midiData?.current || !midiEventTrackers?.current) { return; }
        // console.log("time since last", now - lastTime.current);
        // lastTime.current = now;
        const microsecPerTick = microsecPerBeat.current / ((midiData.current?.header?.ticksPerBeat ?? 400));

        midiData.current?.tracks.forEach((track, trackIdx) => {
            // if (trackIdx !== 0 && trackIdx !== 2) { return; }
            // if (trackIdx !== 0 && trackIdx !== 1) { return; }

            // check index bounds here
            if (!midiEventTrackers.current) { return; }
            const eventTracker = midiEventTrackers.current[trackIdx];

            // let eventTimeTicks = eventTracker.ticksTraversed;
            let eventTimeMS = eventTracker.msTraversed;

            while (midiEventTrackers.current[trackIdx].eventIndex < track.length) {
                let nextEvent = track[midiEventTrackers.current[trackIdx].eventIndex];

                // THIS IS WHERE THE BUG IS FASHO
                // eventTimeTicks += nextEvent.deltaTime ?? 0;
                eventTimeMS += (nextEvent.deltaTime * microsecPerTick / 1000);

                const now = window.performance.now();
                if (startTime.current + eventTimeMS > now + scheduleAheadMS) {
                    break;
                }

                if (nextEvent.type === 'noteOn' || nextEvent.type === 'noteOff') {
                    scheduleEvent(nextEvent, eventTimeMS + startTime.current - now, trackIdx);
                }

                // todo move to schedule method
                if (nextEvent.type === 'programChange') {
                    console.log("program change", trackIdx, (nextEvent as MidiProgramChangeEvent).programNumber);
                    midiEventTrackers.current[trackIdx].programNumber = (nextEvent as MidiProgramChangeEvent).programNumber;
                    WebMidi.outputs.forEach(output => {
                        // output.sendProgramChange((nextEvent as MidiProgramChangeEvent).programNumber, { channels: (nextEvent as MidiProgramChangeEvent).channel });
                    });
                }

                if (nextEvent.type === 'keySignature') {
                    console.log("KEY SIG", trackIdx, (nextEvent as MidiKeySignatureEvent).key, (nextEvent as MidiKeySignatureEvent).scale);
                    // midiEventTrackers.current[trackIdx].programNumber = (nextEvent as MidiKeySignatureEvent).programNumber;
                }

                if (nextEvent.type === 'setTempo') {
                    microsecPerBeat.current = (nextEvent as MidiSetTempoEvent).microsecondsPerBeat;
                    console.log("parsed tempo: ", 60000000 / microsecPerBeat.current);
                }

                // eventTracker.ticksTraversed = eventTime;
                // setMidiEventTrackers(prev => { const trackers = prev ?? []; trackers[trackIdx].eventIndex += 1; return trackers; });
                // midiEventTrackers.current[trackIdx].ticksTraversed = eventTimeTicks;
                midiEventTrackers.current[trackIdx].msTraversed = eventTimeMS;
                midiEventTrackers.current[trackIdx].eventIndex++;

                // console.log(`track ${trackIdx} : ${midiEventTrackers.current[trackIdx].eventIndex} / ${midiData.current?.tracks[trackIdx].length} ${100 * midiEventTrackers.current[trackIdx].eventIndex / (midiData.current?.tracks[trackIdx].length ?? 1)}%`)
            }
        });
        // const isComplete = midiEventTrackers.current?.reduce((complete, track) => complete && track.eventIndex >= (midiData.current?.tracks[trackIdx]?.length ?? 0), false);
        // const percentageComplete = React.useMemo(() => {
        let runningPercentageTotal = 0;
        for (let i = 0; i < midiEventTrackers.current?.length ?? 0; i++) {
            runningPercentageTotal += 100 * midiEventTrackers.current?.[i].eventIndex / (midiData.current?.tracks[i].length ?? 1);
        }
        const percentageComplete = runningPercentageTotal / (midiEventTrackers.current?.length ?? 1);
        // }, [midiData, midiEventTrackers]);
        // console.log(`${loadedFileName} : ${percentageComplete}% complete`, percentageComplete);
        if (percentageComplete >= 100) {
            clearChannels(NoteSet.MIDIFileInput);
            console.log("MIDI file complete");
        }
        else {
            setTimeout(() => {
                tickWithDrift();
            }, 10);
        }
    }, [clearChannels, microsecPerBeat, midiData, midiEventTrackers, scheduleEvent, startTime]);

    React.useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onInputChange = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(async (inputEvent) => {
        if (!inputRef.current) { return; }
        const source: HTMLInputElement = inputRef.current;
        if (!source.files) { return; }
        setLoadedFilename(source.files[0].name);
        props.closeContainer();
        const arrBuffer = await source.files[0].arrayBuffer();
        const input = new Uint8Array(arrBuffer);
        const parsed = midiManager.parseMidi(input);
        // setMidiEventTrackers(new Array(parsed.tracks.length).fill({ eventIndex: 0, ticksTraversed: 0 }));
        // setMidiData(parsed);
        midiData.current = parsed;
        // midiEventTrackers.current = new Array(parsed.tracks.length).fill({ ...{ eventIndex: 0, ticksTraversed: 0 } });
        midiEventTrackers.current = Array.from({ length: parsed.tracks.length }, e => ({ eventIndex: 0, ticksTraversed: 0, msTraversed: 0, programNumber: 1 }));

        startTime.current = window.performance.now();
        microsecPerBeat.current = 60000000 / 120;
        console.log("Midi data parsed: ", parsed);
        clearChannels(NoteSet.MIDIFileInput);


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
    }, [clearChannels, inputRef, microsecPerBeat, midiData, midiEventTrackers, props, setLoadedFilename, startTime, tickWithDrift]);




    return (
        <div>
            <label className="midi-file-input-label">
                <input className="midi-file-input" accept=".mid,.midi" onChange={onInputChange} ref={inputRef} type="file" id="filereader" />
                {loadedFileName ?? "Play a MIDI file"}
            </label>
            {/* <input id="file-upload" type="file" /> */}
        </div>
    );
}