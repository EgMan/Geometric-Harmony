import React from 'react';
import { MidiNoteMixins, MidiSetTempoEvent, MidiProgramChangeEvent, MidiKeySignatureEvent, MidiControllerEvent, MidiNoteAftertouchEvent, MidiPitchBendEvent, MidiTextEvent, MidiNoteOnEvent, MidiNoteOffEvent } from "midi-file";
import * as midiManager from 'midi-file';
import { NoteSet, useClearChannelsOfType, useSetHomeNote, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote } from './MIDIInterface';
import { WebMidi } from 'webmidi';
import { useSetActiveShape } from './HarmonicModulation';
import { SCALE_NATURAL } from '../utils/KnownHarmonicShapes';
import { getNote, getNoteMIDI, getNoteName } from '../utils/Utils';
import { useSettings } from '../view/SettingsProvider';
import { useSynth, useSynthDrum } from './SoundEngine';
import * as Tone from 'tone';
import { ListItemIcon, MenuItem } from '@mui/material';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import { useAppTheme } from '../view/ThemeManager';

type Props = {
    closeContainer: () => void,
}

type MidiEventTracker = {
    eventIndex: number,
    ticksTraversed: number,
    msTraversed: number,
};

type MidiChannelTracker = {
    programNumber: number,
}

type TempoTracker = { ticks: number, msPerTick: number, beatsPerMinute: number };
type TemposByTrack = { [trackNum: number]: TempoTracker[] };

type MidiPreprocessedData = {
    tempos: TemposByTrack,
};

const scheduleAheadMS = 300;

type MidiDataContextType = {
    midiData: React.MutableRefObject<midiManager.MidiData | null>,
    midiEventTrackers: React.MutableRefObject<MidiEventTracker[] | null>,
    midiChannelTrackers: React.MutableRefObject<MidiChannelTracker[] | null>,
    preprocessedData: React.MutableRefObject<MidiPreprocessedData>,
    lastTime: React.MutableRefObject<number>,
    startTime: React.MutableRefObject<number>,
    microsecPerBeat: React.MutableRefObject<number>,
    inputRef: React.MutableRefObject<HTMLInputElement | null>,
    loadedFileNameState: [string | null, React.Dispatch<React.SetStateAction<string | null>>],
    totalPendingScheduled: React.MutableRefObject<number>,
    audioCtx: AudioContext,
};
const midiDataContext = React.createContext<MidiDataContextType | null>(null);
type ProviderProps = {
    children: JSX.Element
}
export function MidiFileDataProvider({ children }: ProviderProps) {
    const audioCtx = React.useMemo(() => new AudioContext(), []);
    return (
        <midiDataContext.Provider value={{
            midiData: React.useRef<midiManager.MidiData | null>(null),
            midiEventTrackers: React.useRef<MidiEventTracker[] | null>(null),
            midiChannelTrackers: React.useRef<MidiChannelTracker[] | null>(null),
            preprocessedData: React.useRef<MidiPreprocessedData>({ tempos: [] }),
            lastTime: React.useRef<number>((audioCtx.currentTime * 1000)),
            startTime: React.useRef<number>((audioCtx.currentTime * 1000)),
            microsecPerBeat: React.useRef<number>(60000000 / 120),
            inputRef: React.useRef<HTMLInputElement>(null),
            loadedFileNameState: React.useState<string | null>(null),
            totalPendingScheduled: React.useRef<number>(0),
            audioCtx,
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
    const { midiData, midiEventTrackers, midiChannelTrackers, preprocessedData, startTime, microsecPerBeat, inputRef, loadedFileNameState, totalPendingScheduled, audioCtx } = stateContext;
    const [loadedFileName, setLoadedFilename] = loadedFileNameState;
    const settings = useSettings();
    const { colorPalette } = useAppTheme()!;

    const setActiveShape = useSetActiveShape();
    const setHomeNote = useSetHomeNote();
    const synth = useSynth();
    const synthDrum = useSynthDrum();

    // const [midiData, setMidiData] = React.useState<midiManager.MidiData | null>(null);
    // const [midiEventTrackers, setMidiEventTrackers] = React.useState<MidiEventTracker[] | null>(null);

    const preprocessData = React.useCallback((midiData: midiManager.MidiData): MidiPreprocessedData => {
        let outTempos: TemposByTrack = {};
        midiData.tracks.forEach((track, trackIdx) => {
            let ticks = 0;
            let MSPerTick = (60000 / 120) / ((midiData.header?.ticksPerBeat ?? 400));
            outTempos[trackIdx] = [{ ticks: 0, msPerTick: MSPerTick, beatsPerMinute: 120 }];
            track.forEach(event => {
                ticks += event.deltaTime;
                if (event.type === 'setTempo') {
                    MSPerTick = (event as MidiSetTempoEvent).microsecondsPerBeat / ((midiData.header?.ticksPerBeat ?? 400) * 1000);
                    outTempos[trackIdx].push({ ticks, msPerTick: MSPerTick, beatsPerMinute: 60000000 / (event as MidiSetTempoEvent).microsecondsPerBeat });
                    if (midiData.header.format === 1 && trackIdx !== 0) {
                        outTempos[0].push({ ticks, msPerTick: MSPerTick, beatsPerMinute: 60000000 / (event as MidiSetTempoEvent).microsecondsPerBeat });
                    }
                }
            });
        });
        return { tempos: outTempos };
    }, []);

    // TODO dynamically memoize this
    const tickToTime = React.useCallback((tick: number, midiData: midiManager.MidiData, preProcessedData: MidiPreprocessedData, trackIdx: number) => {
        let ticksProcessed = 0;
        let tempoIdx = 0;
        let timeMS = 0;
        const tempos = midiData.header.format === 2 ? preProcessedData.tempos[trackIdx] : preProcessedData.tempos[0];
        while (ticksProcessed < tick) {
            if (tempoIdx + 1 < tempos.length && tempos[tempoIdx + 1].ticks < tick) {
                const ticksSpentInCurrentTempo = tempos[tempoIdx + 1].ticks - ticksProcessed;
                timeMS += ticksSpentInCurrentTempo * tempos[tempoIdx].msPerTick;
                ticksProcessed += ticksSpentInCurrentTempo;
                tempoIdx++;
            }
            else {
                // ticksProcessed += tick - preprocessedData.current.tempos[0][tempoIdx].ticks;
                timeMS += (tick - ticksProcessed) * tempos[tempoIdx].msPerTick;
                ticksProcessed = tick;
            }
        }
        return { timeMS, tempo: tempos[tempoIdx] };
    }, []);

    const scheduleEvent = React.useCallback((event: midiManager.MidiEvent, time: number, track: number, ticks: number, tempo: TempoTracker | null) => {
        // setTimeout(() => {
        totalPendingScheduled.current--;
        const tracker = stateContext.midiEventTrackers.current?.[track];
        if (!tracker) { return; }

        switch (event.type) {
            case 'noteOn':
            case 'noteOff':
                setTimeout(() => {
                    const midiChannel = stateContext.midiChannelTrackers.current?.[event.channel];
                    if (
                        // midiChannel && midiChannel.programNumber > 112
                        event.channel === 9
                        || event.channel === 10
                        // || (midiChannel && midiChannel.programNumber > 96)
                    ) {
                        console.log("Is this drums?", track, midiEventTrackers.current);
                        return;
                    };
                    const offset = 3;
                    const chanColor = `hsl(${(Math.floor(45 * (event.channel + offset) + (Math.floor((event.channel + offset) / 8) * (45 / 2)))) % 360}, 100%, 70%)`;
                    updateNotes(`${NoteSet.MIDIFileInput}-${event.channel}`, [midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, Math.floor((event as MidiNoteMixins).noteNumber / 12) - 1)], event.type === 'noteOn', false, new Set([NoteSet.MIDIFileInput]), chanColor);
                }, time - (audioCtx.currentTime * 1000));

                // Sending events directly to midi outputs
                if (settings?.prioritizeMIDIAudio) {
                    WebMidi.outputs.forEach(output => {
                        if (event.type === 'noteOn') {
                            output.sendNoteOn((event as MidiNoteOnEvent).noteNumber, {
                                channels: ((event as MidiNoteOnEvent).channel + 1),
                                time: WebMidi.time + Math.floor(time - (audioCtx.currentTime * 1000)),
                                attack: (event as MidiNoteOnEvent).velocity / 127,
                            });
                        }
                        else {
                            output.sendNoteOff((event as MidiNoteOffEvent).noteNumber, {
                                channels: ((event as MidiNoteOffEvent).channel + 1),
                                time: WebMidi.time + Math.floor(time - (audioCtx.currentTime * 1000)),
                                release: (event as MidiNoteOffEvent).velocity / 127,
                            });
                        }
                    });
                }
                // Sending events directly to synth output
                const chan = stateContext.midiChannelTrackers.current?.[event.channel];
                if (
                    !(event.channel === 9
                        || event.channel === 10
                        // || (chan && chan.programNumber > 96)
                    )) {
                    if (event.type === 'noteOn') {
                        const playTime = Tone.now() + Math.max(0, (time / 1000) - (audioCtx.currentTime));
                        synth?.triggerAttack(
                            getNote(midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, Math.floor((event as MidiNoteMixins).noteNumber / 12) - 1))
                            , playTime, (event as MidiNoteOnEvent).velocity / 127);
                    }
                    else {
                        const playTime = Tone.now() + Math.max(0, (time / 1000) - (audioCtx.currentTime));
                        synth?.triggerRelease(
                            getNote(midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, Math.floor((event as MidiNoteMixins).noteNumber / 12) - 1))
                            , playTime);
                    }
                } else {
                    // Drums
                    const playTime = Tone.now() + Math.max(0.1, (time / 1000) - (audioCtx.currentTime));
                    console.log("time", playTime);
                    const freq = Tone.Frequency(getNoteMIDI(midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, Math.floor((event as MidiNoteMixins).noteNumber / 12) - 1))).toFrequency();
                    if (event.type === 'noteOn') {
                        synthDrum?.triggerAttack(freq, playTime, (event as MidiNoteOnEvent).velocity / 127)
                    }
                    else {
                        synthDrum?.triggerRelease(freq, playTime);
                    }
                }
                break;
            case 'programChange':
                console.log("program change", track, (event as MidiProgramChangeEvent));
                const midiChannel = stateContext.midiChannelTrackers.current?.[event.channel];
                midiChannel!.programNumber = (event as MidiProgramChangeEvent).programNumber;
                if (midiChannel!.programNumber < 0 || midiChannel!.programNumber >= 127) {
                    console.warn("Invalid program number", midiChannel!.programNumber);
                    return;
                }
                WebMidi.outputs.forEach(output => {
                    // output.sendPg
                    output.sendProgramChange((event as MidiProgramChangeEvent).programNumber, {
                        channels: ((event as MidiProgramChangeEvent).channel + 1),
                        time: WebMidi.time + Math.floor(time - (audioCtx.currentTime * 1000)),
                    });
                });
                break;
            case 'keySignature':
                // setActiveShape((event as MidiKeySignatureEvent).key, (event as MidiKeySignatureEvent).scale);
                setTimeout(() => {
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
                }, time - (audioCtx.currentTime * 1000));
                break;
            case 'setTempo':
                setTimeout(() => {
                    // microsecPerBeat.current = (event as MidiSetTempoEvent).microsecondsPerBeat;
                    console.log("Tempo change: ", 60000000 / (event as MidiSetTempoEvent).microsecondsPerBeat, " bpm, track: ", track, ", @ ", ticks);
                }, time - (audioCtx.currentTime * 1000));
                break;
            case 'controller':
                WebMidi.outputs.forEach(output => {
                    output.sendControlChange((event as MidiControllerEvent).controllerType, (event as MidiControllerEvent).value, {
                        channels: ((event as MidiControllerEvent).channel + 1),
                        time: WebMidi.time + Math.floor(time - (audioCtx.currentTime * 1000)),
                    });
                });
                break;
            case 'noteAftertouch':
                WebMidi.outputs.forEach(output => {
                    output.sendKeyAftertouch((event as MidiNoteAftertouchEvent).noteNumber, (event as MidiNoteAftertouchEvent).amount, {
                        channels: ((event as MidiNoteAftertouchEvent).channel + 1),
                        time: WebMidi.time + Math.floor(time - (audioCtx.currentTime * 1000)),
                    });
                });
                break;
            case 'pitchBend':
                const normalizedPitchBend = ((event as MidiPitchBendEvent).value / 8192);
                console.log("pitch bend", normalizedPitchBend, (event as MidiPitchBendEvent).value);
                WebMidi.outputs.forEach(output => {
                    output.sendPitchBend(normalizedPitchBend, {
                        channels: ((event as MidiPitchBendEvent).channel + 1),
                        time: WebMidi.time + Math.floor(time - (audioCtx.currentTime * 1000)),
                    });
                });
                break;
            case 'text':
                setTimeout(() => {
                    console.log("MIDI TEXT: ", (event as MidiTextEvent).text);
                }, time - (audioCtx.currentTime * 1000));
                break;
            default:
                console.log("Unsupported event type", event.type);
                break;
        }

        totalPendingScheduled.current++;
    }, [audioCtx.currentTime, midiEventTrackers, setActiveShape, setHomeNote, settings?.prioritizeMIDIAudio, stateContext.midiChannelTrackers, stateContext.midiEventTrackers, synth, synthDrum, totalPendingScheduled, updateNotes]);

    // var lastTime = (audioCtx.currentTime * 1000);
    const tickWithDrift = React.useCallback(() => {
        if (!midiData?.current || !midiEventTrackers?.current) { return; }
        // console.log("time since last", now - lastTime.current);
        // lastTime.current = now;
        // const microsecPerTick = microsecPerBeat.current / ((midiData.current?.header?.ticksPerBeat ?? 400));

        midiData.current?.tracks.forEach((track, trackIdx) => {
            // if (trackIdx !== 0 && trackIdx !== 2) { return; }
            // if (trackIdx !== 0 && trackIdx !== 1) { return; }

            // check index bounds here
            if (!midiEventTrackers.current) { return; }
            const eventTracker = midiEventTrackers.current[trackIdx];

            let eventTimeMS = eventTracker.msTraversed;
            let ticksTraversed = eventTracker.ticksTraversed;

            while (midiEventTrackers.current[trackIdx].eventIndex < track.length) {
                if (!midiData?.current || !midiEventTrackers?.current) { return; }

                let nextEvent = track[midiEventTrackers.current[trackIdx].eventIndex];
                // eventTimeMS += (nextEvent.deltaTime * microsecPerTick / 1000);
                // TODO address the -1 on the index thing
                const { timeMS, tempo } = tickToTime(ticksTraversed + nextEvent.deltaTime, midiData.current, preprocessedData.current, trackIdx);

                eventTimeMS = timeMS;
                ticksTraversed += nextEvent.deltaTime;

                const now = (audioCtx.currentTime * 1000);
                // console.log("NOW", now);
                if (startTime.current + eventTimeMS > now + scheduleAheadMS) {
                    break;
                }

                // if (nextEvent.type === 'setTempo') {
                // microsecPerBeat.current = (nextEvent as MidiSetTempoEvent).microsecondsPerBeat;
                // }

                scheduleEvent(nextEvent, startTime.current + eventTimeMS, trackIdx, ticksTraversed, tempo);

                midiEventTrackers.current[trackIdx].msTraversed = eventTimeMS;
                midiEventTrackers.current[trackIdx].eventIndex++;
                midiEventTrackers.current[trackIdx].ticksTraversed = ticksTraversed;

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
        // console.log("TRACKERS", midiEventTrackers.current);
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
    }, [audioCtx.currentTime, clearChannels, midiData, midiEventTrackers, preprocessedData, scheduleEvent, startTime, tickToTime]);


    const loadMidiData = React.useCallback<React.ChangeEventHandler<HTMLInputElement>>(async (inputEvent) => {
        if (!inputRef.current) { return; }
        const source: HTMLInputElement = inputRef.current;
        if (!source.files) { return; }
        WebMidi.outputs.forEach(output => {
            output.sendReset();
            output.sendResetAllControllers();
        });
        setLoadedFilename(source.files[0].name);
        props.closeContainer();
        const arrBuffer = await source.files[0].arrayBuffer();
        const input = new Uint8Array(arrBuffer);
        const parsed = midiManager.parseMidi(input);
        midiData.current = parsed;
        midiEventTrackers.current = Array.from({ length: parsed.tracks.length }, e => ({ eventIndex: 0, ticksTraversed: 0, msTraversed: 0 }));
        midiChannelTrackers.current = Array.from({ length: 16 }, e => ({ programNumber: -1 }));
        preprocessedData.current = preprocessData(parsed);

        // microsecPerBeat.current = 60000000 / 120;
        console.log("Midi data parsed: ", parsed);
        clearChannels(NoteSet.MIDIFileInput);

        console.log(`${source.files[0].name} FORMAT ${midiData.current.header.format}`);
        updateNotes(NoteSet.Active, [], false, true);

        startTime.current = (audioCtx.currentTime * 1000);
        tickWithDrift();
    }, [audioCtx.currentTime, clearChannels, inputRef, midiChannelTrackers, midiData, midiEventTrackers, preprocessData, preprocessedData, props, setLoadedFilename, startTime, tickWithDrift, updateNotes]);

    return (
        <MenuItem sx={{ padding: "0" }}>
            <label className="midi-file-input-label" style={{ width: "100%", height: "100%", paddingTop: 6, paddingBottom: 6, paddingLeft: 16, paddingRight: 16 }}>
                <ListItemIcon>
                    <AudioFileIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                </ListItemIcon>
                <input style={{ width: "100%", height: "100%" }} className="midi-file-input" accept=".mid,.midi" onChange={loadMidiData} ref={inputRef} type="file" id="filereader" />
                {loadedFileName ?? "Open MIDI file"}
            </label>
        </MenuItem>
    );
}