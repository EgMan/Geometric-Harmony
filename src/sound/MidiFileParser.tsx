import React from 'react';
import { MidiNoteMixins, MidiSetTempoEvent, MidiProgramChangeEvent, MidiKeySignatureEvent, MidiControllerEvent, MidiNoteAftertouchEvent, MidiPitchBendEvent, MidiTextEvent } from "midi-file";
import * as midiManager from 'midi-file';
import { NoteSet, useClearChannelsOfType, useSetHomeNote, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote } from './MIDIInterface';
import { WebMidi } from 'webmidi';
import { useSetActiveShape } from './HarmonicModulation';
import { SCALE_NATURAL } from '../utils/KnownHarmonicShapes';
import { getNoteName } from '../utils/Utils';

type Props = {
    closeContainer: () => void,
}

type MidiEventTracker = {
    eventIndex: number,
    ticksTraversed: number,
    msTraversed: number,
    programNumber: number,
};

const scheduleAheadMS = 150;
const scheduleBehindMS = 10;

type MidiDataContextType = {
    midiData: React.MutableRefObject<midiManager.MidiData | null>,
    midiEventTrackers: React.MutableRefObject<MidiEventTracker[] | null>,
    lastTime: React.MutableRefObject<number>,
    startTime: React.MutableRefObject<number>,
    microsecPerBeat: React.MutableRefObject<number>,
    inputRef: React.MutableRefObject<HTMLInputElement | null>,
    loadedFileNameState: [string | null, React.Dispatch<React.SetStateAction<string | null>>],
    totalPendingScheduled: React.MutableRefObject<number>,
};
const midiDataContext = React.createContext<MidiDataContextType | null>(null);
type ProviderProps = {
    children: JSX.Element
}
export function MidiFileDataProvider({ children }: ProviderProps) {
    return (
        <midiDataContext.Provider value={{
            midiData: React.useRef<midiManager.MidiData | null>(null),
            midiEventTrackers: React.useRef<MidiEventTracker[] | null>(null),
            lastTime: React.useRef<number>(window.performance.now()),
            startTime: React.useRef<number>(window.performance.now()),
            microsecPerBeat: React.useRef<number>(60000000 / 120),
            inputRef: React.useRef<HTMLInputElement>(null),
            loadedFileNameState: React.useState<string | null>(null),
            totalPendingScheduled: React.useRef<number>(0),
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
    const { midiData, midiEventTrackers, startTime, microsecPerBeat, inputRef, loadedFileNameState, totalPendingScheduled } = stateContext;
    const [loadedFileName, setLoadedFilename] = loadedFileNameState;

    const setActiveShape = useSetActiveShape();
    const setHomeNote = useSetHomeNote();

    // const [midiData, setMidiData] = React.useState<midiManager.MidiData | null>(null);
    // const [midiEventTrackers, setMidiEventTrackers] = React.useState<MidiEventTracker[] | null>(null);

    const scheduleEvent = React.useCallback((event: midiManager.MidiEvent, msFromNow: number, track: number) => {
        setTimeout(() => {
            totalPendingScheduled.current--;
            const tracker = stateContext.midiEventTrackers.current?.[track];
            if (!tracker) { return; }
            switch (event.type) {
                case 'noteOn':
                case 'noteOff':
                    // if ((event as MidiNoteMixins).noteNumber > 34 && (event as MidiNoteMixins).noteNumber < 49 && (event as MidiNoteMixins).noteNumber != 58) {
                    // (stateContext.midiEventTrackers.current ?? []).some((tracker, index) => tracker.programNumber !== 0);
                    if (
                        (tracker.programNumber === 0 && (stateContext.midiEventTrackers.current ?? []).some((tracker, index) => tracker.programNumber > 0 && tracker.programNumber <= 96)) ||
                        tracker.programNumber > 96) {
                        console.log("Is this drums?", track, midiEventTrackers.current);
                        return;
                    };
                    const offset = 3;
                    const chanColor = `hsl(${(45 * (event.channel + offset) + (Math.floor((event.channel + offset) / 8) * (45 / 2))) % 360}deg, 100%, 70%)`;
                    updateNotes(`${NoteSet.MIDIFileInput}-${event.channel}`, [midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, Math.floor((event as MidiNoteMixins).noteNumber / 12) - 1)], event.type === 'noteOn', false, new Set([NoteSet.MIDIFileInput]), chanColor);

                    // console.log("scheduled event", getNoteName(midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, 3), new Set()), event, msFromNow);
                    break;
                case 'programChange':
                    console.log("program change", track, (event as MidiProgramChangeEvent).programNumber);
                    tracker.programNumber = (event as MidiProgramChangeEvent).programNumber;
                    WebMidi.outputs.forEach(output => {
                        output.sendProgramChange((event as MidiProgramChangeEvent).programNumber, { channels: (event as MidiProgramChangeEvent).channel });
                    });
                    break;
                case 'keySignature':
                    // setActiveShape((event as MidiKeySignatureEvent).key, (event as MidiKeySignatureEvent).scale);
                    const keysig = [11, 6, 1, 8, 3, 10, 5, 0, 7, 2, 9, 4][(event as MidiKeySignatureEvent).key + 7];
                    if (keysig !== undefined) {
                        setActiveShape(SCALE_NATURAL, keysig);
                        console.log("KEY SIG", track, (event as MidiKeySignatureEvent).key, getNoteName(keysig, new Set()), (event as MidiKeySignatureEvent).scale);
                    }
                    else {
                        console.warn("Unsupported key signerature", (event as MidiKeySignatureEvent).key);
                    }
                    // Major
                    if ((event as MidiKeySignatureEvent).scale === 0) {
                        setHomeNote(keysig);
                    }
                    // Minor
                    else if ((event as MidiKeySignatureEvent).scale === 1) {
                        setHomeNote(keysig + 9);
                    }
                    else {
                        console.warn("Unsupported scale", (event as MidiKeySignatureEvent).scale);
                    }
                    break;
                case 'setTempo':
                    microsecPerBeat.current = (event as MidiSetTempoEvent).microsecondsPerBeat;
                    console.log("parsed tempo: ", 60000000 / microsecPerBeat.current, "dt=", (event as MidiSetTempoEvent).deltaTime);
                    break;
                case 'controller':
                    WebMidi.outputs.forEach(output => {
                        output.sendControlChange((event as MidiControllerEvent).controllerType, (event as MidiControllerEvent).value, {
                            channels: (event as MidiControllerEvent).channel
                        });
                    });
                    break;
                case 'noteAftertouch':
                    WebMidi.outputs.forEach(output => {
                        output.sendKeyAftertouch((event as MidiNoteAftertouchEvent).noteNumber, (event as MidiNoteAftertouchEvent).amount, { channels: (event as MidiNoteAftertouchEvent).channel });
                    });
                    break;
                case 'pitchBend':
                    const normalizedPitchBend = ((event as MidiPitchBendEvent).value / 8191.5);
                    console.log("pitch bend", normalizedPitchBend, (event as MidiPitchBendEvent).value);
                    WebMidi.outputs.forEach(output => {
                        // output.sendPitchBend((event as MidiPitchBendEvent).value, { channels: (event as MidiPitchBendEvent).channel });
                        output.sendPitchBend(normalizedPitchBend, { channels: 1 });
                    });
                    break;
                case 'text':
                    WebMidi.outputs.forEach(output => {
                        console.log("MIDI TEXT: ", (event as MidiTextEvent).text);
                    });
                    break;
                default:
                    console.log("Unsupported event type", event.type);
                    break;
            }
            // console.log("pending", totalPendingScheduled.current);
        }, msFromNow);
        // Sending events directly to midi outputs

        // switch (event.type) {
        //     case 'noteOn':
        //         WebMidi.outputs.forEach(output => {
        //             output.sendNoteOn((event as MidiNoteOnEvent).noteNumber, {
        //                 channels: 1,
        //                 time: WebMidi.time + msFromNow,

        //                 // time: msFromNow,
        //                 // channels: (event as MidiNoteOnEvent).channel,
        //                 // attack: (event as MidiNoteOnEvent).velocity / 127,
        //             });
        //         });
        //         break;
        //     case 'noteOff':
        //         WebMidi.outputs.forEach(output => {
        //             output.sendNoteOff((event as MidiNoteOffEvent).noteNumber, {
        //                 channels: 1,
        //                 time: WebMidi.time + msFromNow,
        //                 // time: msFromNow,
        //                 // channels: (event as MidiNoteOnEvent).channel,
        //                 // attack: (event as MidiNoteOnEvent).velocity / 127,
        //             });
        //         });
        //         break;
        // }
        totalPendingScheduled.current++;
    }, [microsecPerBeat, midiEventTrackers, setActiveShape, stateContext.midiEventTrackers, totalPendingScheduled, updateNotes]);

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

                // eventTimeTicks += nextEvent.deltaTime ?? 0;
                eventTimeMS += (nextEvent.deltaTime * microsecPerTick / 1000);

                const now = window.performance.now();
                if (startTime.current + eventTimeMS > now + scheduleAheadMS) {
                    break;
                }

                scheduleEvent(nextEvent, eventTimeMS + startTime.current - now, trackIdx);

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
        midiEventTrackers.current = Array.from({ length: parsed.tracks.length }, e => ({ eventIndex: 0, ticksTraversed: 0, msTraversed: 0, programNumber: -1 }));

        startTime.current = window.performance.now();
        microsecPerBeat.current = 60000000 / 120;
        console.log("Midi data parsed: ", parsed);
        clearChannels(NoteSet.MIDIFileInput);

        console.log(`${source.files[0].name} FORMAT ${midiData.current.header.format}`);
        updateNotes(NoteSet.Active, [], false, true);
        tickWithDrift();
    }, [clearChannels, inputRef, microsecPerBeat, midiData, midiEventTrackers, props, setLoadedFilename, startTime, tickWithDrift, updateNotes]);




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