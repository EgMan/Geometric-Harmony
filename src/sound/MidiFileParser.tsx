import React from 'react';
import { MidiNoteMixins, MidiSetTempoEvent, MidiProgramChangeEvent, MidiKeySignatureEvent, MidiControllerEvent, MidiNoteAftertouchEvent, MidiPitchBendEvent, MidiTextEvent, MidiNoteOnEvent, MidiNoteOffEvent, MidiTimeSignatureEvent } from "midi-file";
import * as midiManager from 'midi-file';
import { NoteSet, useClearChannelsOfType, useSetHomeNote, useUpdateNoteSet } from './NoteProvider';
import { midiNoteToProgramNote } from './MIDIInterface';
import { WebMidi } from 'webmidi';
import { useSetActiveShape } from './HarmonicModulation';
import { SCALE_NATURAL } from '../utils/KnownHarmonicShapes';
import { getNote, getNoteMIDI, useActiveNoteNames } from '../utils/Utils';
import { useSettings } from '../view/SettingsProvider';
import { useSynthRef, useSynthDrumRef } from './SoundEngine';
import * as Tone from 'tone';
import { ListItemIcon, MenuItem } from '@mui/material';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import { useAppTheme, useChangeAppTheme } from '../view/ThemeManager';
import { changeLightness, getRandomColor, getRandomColorWithAlpha, blendColors } from '../utils/Utils';
import { SEMITONES_PER_OCTAVE } from '../utils/MagicNumbers';

const MIDI_SCHEDULE_AHEAD_MS = 300;
const DEFAULT_BPM = 120;
const DEFAULT_MICROSECONDS_PER_BEAT = 60000000 / DEFAULT_BPM;
const DEFAULT_MS_PER_BEAT = 60000 / DEFAULT_BPM;

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

export type TransportState = {
    isPlaying: boolean,
    positionMs: number,
    durationMs: number,
};

const scheduleAheadMS = MIDI_SCHEDULE_AHEAD_MS;
let _isDiscoMode = false;

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
    totalDurationMs: React.MutableRefObject<number>,
    playbackGeneration: React.MutableRefObject<number>,
    isPaused: React.MutableRefObject<boolean>,
    pausedAtMs: React.MutableRefObject<number>,
    transportState: [TransportState, React.Dispatch<React.SetStateAction<TransportState>>],
    controls: {
        pause: React.MutableRefObject<() => void>,
        resume: React.MutableRefObject<() => void>,
        seekTo: React.MutableRefObject<(ms: number) => void>,
    },
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
            lastTime: React.useRef<number>(performance.now()),
            startTime: React.useRef<number>(performance.now()),
            microsecPerBeat: React.useRef<number>(DEFAULT_MICROSECONDS_PER_BEAT),
            inputRef: React.useRef<HTMLInputElement>(null),
            loadedFileNameState: React.useState<string | null>(null),
            totalPendingScheduled: React.useRef<number>(0),
            audioCtx,
            totalDurationMs: React.useRef<number>(0),
            playbackGeneration: React.useRef<number>(0),
            isPaused: React.useRef<boolean>(false),
            pausedAtMs: React.useRef<number>(0),
            transportState: React.useState<TransportState>({ isPlaying: false, positionMs: 0, durationMs: 0 }),
            controls: {
                pause: React.useRef<() => void>(() => { }),
                resume: React.useRef<() => void>(() => { }),
                seekTo: React.useRef<(ms: number) => void>((_ms: number) => { }),
            },
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
    const {
        midiData, midiEventTrackers, midiChannelTrackers, preprocessedData, startTime,
        inputRef, loadedFileNameState, totalPendingScheduled,
        totalDurationMs, playbackGeneration, isPaused, pausedAtMs, transportState, controls,
    } = stateContext;
    const [loadedFileName, setLoadedFilename] = loadedFileNameState;
    const [, setTransport] = transportState;
    const settings = useSettings();
    const { colorPalette } = useAppTheme()!;
    const getNoteName = useActiveNoteNames();

    const setActiveShape = useSetActiveShape();
    const setHomeNote = useSetHomeNote();
    const synthRef = useSynthRef();
    const synthDrumRef = useSynthDrumRef();
    const changeTheme = useChangeAppTheme();
    const lastDiscoPhrase = React.useRef<number>(-1);
    const discoTimeSig = React.useRef<{ numerator: number; denominator: number }>({ numerator: 4, denominator: 4 });
    _isDiscoMode = settings?.isDiscoMode ?? false;

    const preprocessData = React.useCallback((midiData: midiManager.MidiData): MidiPreprocessedData => {
        let outTempos: TemposByTrack = {};
        midiData.tracks.forEach((track, trackIdx) => {
            let ticks = 0;
            let MSPerTick = DEFAULT_MS_PER_BEAT / ((midiData.header?.ticksPerBeat ?? 400));
            outTempos[trackIdx] = [{ ticks: 0, msPerTick: MSPerTick, beatsPerMinute: DEFAULT_BPM }];
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
                timeMS += (tick - ticksProcessed) * tempos[tempoIdx].msPerTick;
                ticksProcessed = tick;
            }
        }
        return { timeMS, tempo: tempos[tempoIdx] };
    }, []);

    const scheduleEvent = React.useCallback((event: midiManager.MidiEvent, time: number, track: number, ticks: number, tempo: TempoTracker | null) => {
        totalPendingScheduled.current--;
        const tracker = stateContext.midiEventTrackers.current?.[track];
        if (!tracker) { return; }

        const delay = Math.max(0, time - performance.now());
        const gen = playbackGeneration.current;

        switch (event.type) {
            case 'noteOn':
            case 'noteOff': {
                const isNoteOn = event.type === 'noteOn';
                const isDrums = event.channel === 9 || event.channel === 10;
                const offset = 3;
                const chanColor = `hsl(${(Math.floor(45 * (event.channel + offset) + (Math.floor((event.channel + offset) / 8) * (45 / 2)))) % 360}, 100%, 70%)`;
                const noteNum = midiNoteToProgramNote((event as MidiNoteMixins).noteNumber, Math.floor((event as MidiNoteMixins).noteNumber / SEMITONES_PER_OCTAVE) - 1);
                const noteVelocity = isNoteOn ? (event as MidiNoteOnEvent).velocity / 127 : (event as MidiNoteOffEvent).velocity / 127;
                const prioritizeMidi = settings?.prioritizeMIDIAudio ?? false;

                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;

                    // Visual
                    if (!isDrums) {
                        updateNotes(`${NoteSet.MIDIFileInput}-${event.channel}`, [noteNum], isNoteOn, false, new Set([NoteSet.MIDIFileInput]), chanColor);
                    }

                    // WebMidi
                    if (prioritizeMidi) {
                        WebMidi.outputs.forEach(output => {
                            if (isNoteOn) {
                                output.sendNoteOn((event as MidiNoteOnEvent).noteNumber, {
                                    channels: (event.channel + 1),
                                    time: WebMidi.time + 5,
                                    attack: noteVelocity,
                                });
                            } else {
                                output.sendNoteOff((event as MidiNoteOffEvent).noteNumber, {
                                    channels: (event.channel + 1),
                                    time: WebMidi.time + 5,
                                    release: noteVelocity,
                                });
                            }
                        });
                    }

                    // Tone.js
                    if (!isDrums) {
                        if (isNoteOn) {
                            synthRef?.current?.triggerAttack(getNote(noteNum), Tone.now() + 0.01, (event as MidiNoteOnEvent).velocity / 127);
                        } else {
                            synthRef?.current?.triggerRelease(getNote(noteNum), Tone.now() + 0.01);
                        }
                    } else {
                        const freq = Tone.Frequency(getNoteMIDI(noteNum)).toFrequency();
                        if (isNoteOn) {
                            synthDrumRef?.current?.triggerAttack(freq, Tone.now() + 0.01, (event as MidiNoteOnEvent).velocity / 127);
                        } else {
                            synthDrumRef?.current?.triggerRelease(freq, Tone.now() + 0.01);
                        }
                    }
                }, delay);
                break;
            }
            case 'programChange': {
                const midiChannel = stateContext.midiChannelTrackers.current?.[event.channel];
                if (midiChannel) {
                    midiChannel.programNumber = (event as MidiProgramChangeEvent).programNumber;
                }
                console.log("program change", track, (event as MidiProgramChangeEvent));
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    WebMidi.outputs.forEach(output => {
                        output.sendProgramChange((event as MidiProgramChangeEvent).programNumber, {
                            channels: ((event as MidiProgramChangeEvent).channel + 1),
                            time: WebMidi.time + 5,
                        });
                    });
                }, delay);
                break;
            }
            case 'keySignature':
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    const keysig = [11, 6, 1, 8, 3, 10, 5, 0, 7, 2, 9, 4][(event as MidiKeySignatureEvent).key + 7];
                    if (keysig !== undefined) {
                        setActiveShape(SCALE_NATURAL, keysig);
                        console.log("KEY SIG", track, (event as MidiKeySignatureEvent).key, getNoteName(keysig), (event as MidiKeySignatureEvent).scale);
                    } else {
                        console.warn("Unsupported key signerature", (event as MidiKeySignatureEvent).key);
                    }
                    if ((event as MidiKeySignatureEvent).scale === 0) {
                        setHomeNote(keysig);
                    } else if ((event as MidiKeySignatureEvent).scale === 1) {
                        setHomeNote(keysig + 9);
                    } else {
                        console.warn("Unsupported scale", (event as MidiKeySignatureEvent).scale);
                    }
                }, delay);
                break;
            case 'setTempo':
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    console.log("Tempo change: ", 60000000 / (event as MidiSetTempoEvent).microsecondsPerBeat, " bpm, track: ", track, ", @ ", ticks);
                }, delay);
                break;
            case 'controller':
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    WebMidi.outputs.forEach(output => {
                        output.sendControlChange((event as MidiControllerEvent).controllerType, (event as MidiControllerEvent).value, {
                            channels: ((event as MidiControllerEvent).channel + 1),
                            time: WebMidi.time + 5,
                        });
                    });
                }, delay);
                break;
            case 'noteAftertouch':
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    WebMidi.outputs.forEach(output => {
                        output.sendKeyAftertouch((event as MidiNoteAftertouchEvent).noteNumber, (event as MidiNoteAftertouchEvent).amount, {
                            channels: ((event as MidiNoteAftertouchEvent).channel + 1),
                            time: WebMidi.time + 5,
                        });
                    });
                }, delay);
                break;
            case 'pitchBend': {
                const normalizedPitchBend = ((event as MidiPitchBendEvent).value / 8192);
                console.log("pitch bend", normalizedPitchBend, (event as MidiPitchBendEvent).value);
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    WebMidi.outputs.forEach(output => {
                        output.sendPitchBend(normalizedPitchBend, {
                            channels: ((event as MidiPitchBendEvent).channel + 1),
                            time: WebMidi.time + 5,
                        });
                    });
                }, delay);
                break;
            }
            case 'timeSignature':
                discoTimeSig.current = {
                    numerator: (event as MidiTimeSignatureEvent).numerator,
                    denominator: (event as MidiTimeSignatureEvent).denominator,
                };
                lastDiscoPhrase.current = -1;
                break;
            case 'text':
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    console.log("MIDI TEXT: ", (event as MidiTextEvent).text);
                }, delay);
                break;
            default:
                console.log("Unsupported event type", event.type);
                break;
        }

        // Disco mode: trigger random theme on new phrases
        if (_isDiscoMode && midiData.current) {
            const ticksPerBeat = midiData.current.header.ticksPerBeat ?? 480;
            const { numerator, denominator } = discoTimeSig.current;
            const measuresPerPhrase = 4;
            const ticksPerPhrase = ticksPerBeat * numerator * (4 / denominator) * measuresPerPhrase;
            const currentPhrase = Math.floor(ticks / ticksPerPhrase);
            if (currentPhrase > lastDiscoPhrase.current) {
                lastDiscoPhrase.current = currentPhrase;
                setTimeout(() => {
                    if (playbackGeneration.current !== gen) return;
                    changeTheme?.(prev => {
                        const Widget_Primary = changeLightness(getRandomColor(), 1.25);
                        const Main_Background = changeLightness(getRandomColor(), 0.75);
                        const Widget_MutedPrimary = blendColors([Widget_Primary, Widget_Primary, Widget_Primary, Main_Background, Main_Background])!;
                        return {
                            ...prev,
                            Main_Background,
                            UI_Background: getRandomColorWithAlpha(),
                            UI_Primary: getRandomColor(),
                            UI_Accent: getRandomColor(),
                            Widget_Primary,
                            Widget_MutedPrimary,
                            Note_Home: getRandomColor(),
                        };
                    });
                }, delay);
            }
        }

        totalPendingScheduled.current++;
    }, [changeTheme, getNoteName, midiData, midiEventTrackers, playbackGeneration, setActiveShape, setHomeNote, settings?.prioritizeMIDIAudio, stateContext.midiChannelTrackers, stateContext.midiEventTrackers, totalPendingScheduled, updateNotes]);

    const tickWithDrift = React.useCallback(() => {
        if (!midiData?.current || !midiEventTrackers?.current) { return; }
        if (isPaused.current) { return; }

        midiData.current?.tracks.forEach((track, trackIdx) => {
            if (!midiEventTrackers.current) { return; }
            const eventTracker = midiEventTrackers.current[trackIdx];

            let eventTimeMS = eventTracker.msTraversed;
            let ticksTraversed = eventTracker.ticksTraversed;

            while (midiEventTrackers.current[trackIdx].eventIndex < track.length) {
                if (!midiData?.current || !midiEventTrackers?.current) { return; }

                let nextEvent = track[midiEventTrackers.current[trackIdx].eventIndex];
                const { timeMS, tempo } = tickToTime(ticksTraversed + nextEvent.deltaTime, midiData.current, preprocessedData.current, trackIdx);

                eventTimeMS = timeMS;
                ticksTraversed += nextEvent.deltaTime;

                const now = performance.now();
                if (startTime.current + eventTimeMS > now + scheduleAheadMS) {
                    break;
                }

                scheduleEvent(nextEvent, startTime.current + eventTimeMS, trackIdx, ticksTraversed, tempo);

                midiEventTrackers.current[trackIdx].msTraversed = eventTimeMS;
                midiEventTrackers.current[trackIdx].eventIndex++;
                midiEventTrackers.current[trackIdx].ticksTraversed = ticksTraversed;
            }
        });

        let runningPercentageTotal = 0;
        for (let i = 0; i < (midiEventTrackers.current?.length ?? 0); i++) {
            runningPercentageTotal += 100 * midiEventTrackers.current?.[i].eventIndex / (midiData.current?.tracks[i].length ?? 1);
        }
        const percentageComplete = runningPercentageTotal / (midiEventTrackers.current?.length ?? 1);

        if (percentageComplete >= 100) {
            clearChannels(NoteSet.MIDIFileInput);
            // Reset to start so hitting play again restarts from the beginning
            isPaused.current = true;
            pausedAtMs.current = 0;
            startTime.current = performance.now();
            if (midiData.current) {
                midiEventTrackers.current = Array.from(
                    { length: midiData.current.tracks.length },
                    () => ({ eventIndex: 0, ticksTraversed: 0, msTraversed: 0 }),
                );
            }
            setTransport(t => ({ ...t, isPlaying: false, positionMs: 0 }));
        }
        else {
            setTimeout(() => {
                tickWithDrift();
            }, 10);
        }
    }, [clearChannels, isPaused, midiData, midiEventTrackers, preprocessedData, scheduleEvent, setTransport, startTime, tickToTime]);

    const pause = React.useCallback(() => {
        if (isPaused.current) return;
        isPaused.current = true;
        pausedAtMs.current = Math.max(0, performance.now() - startTime.current);
        playbackGeneration.current++;
        synthRef?.current?.releaseAll();
        synthDrumRef?.current?.releaseAll();
        // Belt-and-suspenders: a triggerAttack scheduled just before pause
        // may not be "active" yet when releaseAll fires above. Release again
        // after the 10ms lookahead window, but only if still paused.
        setTimeout(() => {
            if (isPaused.current) {
                synthRef?.current?.releaseAll();
                synthDrumRef?.current?.releaseAll();
            }
        }, 50);
        clearChannels(NoteSet.MIDIFileInput);
        setTransport(t => ({ ...t, isPlaying: false, positionMs: pausedAtMs.current }));
    }, [clearChannels, isPaused, pausedAtMs, playbackGeneration, startTime, setTransport]);

    const resume = React.useCallback(() => {
        if (!isPaused.current || !midiData.current) return;
        isPaused.current = false;
        startTime.current = performance.now() - pausedAtMs.current;
        setTransport(t => ({ ...t, isPlaying: true }));
        tickWithDrift();
    }, [isPaused, midiData, pausedAtMs, startTime, tickWithDrift, setTransport]);

    const seekTo = React.useCallback((targetMs: number) => {
        if (!midiData.current || !midiEventTrackers.current) return;
        const wasPlaying = !isPaused.current;

        isPaused.current = true;
        playbackGeneration.current++;
        synthRef?.current?.releaseAll();
        synthDrumRef?.current?.releaseAll();
        clearChannels(NoteSet.MIDIFileInput);

        midiData.current.tracks.forEach((track, trackIdx) => {
            let ticks = 0;
            let eventIdx = 0;
            for (let i = 0; i < track.length; i++) {
                const nextTicks = ticks + track[i].deltaTime;
                const { timeMS } = tickToTime(nextTicks, midiData.current!, preprocessedData.current, trackIdx);
                if (timeMS > targetMs) {
                    eventIdx = i;
                    break;
                }
                ticks = nextTicks;
                eventIdx = i + 1;
            }
            const { timeMS: msAtPosition } = tickToTime(ticks, midiData.current!, preprocessedData.current, trackIdx);
            midiEventTrackers.current![trackIdx] = {
                eventIndex: eventIdx,
                ticksTraversed: ticks,
                msTraversed: msAtPosition,
            };
        });

        startTime.current = performance.now() - targetMs;
        pausedAtMs.current = targetMs;
        lastDiscoPhrase.current = -1;
        setTransport(t => ({ ...t, positionMs: targetMs, isPlaying: wasPlaying }));

        if (wasPlaying) {
            isPaused.current = false;
            tickWithDrift();
        }
    }, [clearChannels, isPaused, midiData, midiEventTrackers, pausedAtMs, playbackGeneration, preprocessedData, startTime, tickWithDrift, tickToTime, setTransport]);

    // Store controls so MidiTransport can call them regardless of popover state
    controls.pause.current = pause;
    controls.resume.current = resume;
    controls.seekTo.current = seekTo;

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

        console.log("Midi data parsed: ", parsed);
        console.log(`${source.files[0].name} FORMAT ${midiData.current.header.format}`);
        clearChannels(NoteSet.MIDIFileInput);
        updateNotes(NoteSet.Active, [], false, true);

        // Compute total duration
        let maxMs = 0;
        parsed.tracks.forEach((track, trackIdx) => {
            let ticks = 0;
            track.forEach(e => { ticks += e.deltaTime; });
            const { timeMS } = tickToTime(ticks, parsed, preprocessedData.current, trackIdx);
            if (timeMS > maxMs) maxMs = timeMS;
        });
        totalDurationMs.current = maxMs;

        // Reset playback state
        playbackGeneration.current++;
        isPaused.current = false;
        pausedAtMs.current = 0;
        lastDiscoPhrase.current = -1;
        discoTimeSig.current = { numerator: 4, denominator: 4 };
        startTime.current = performance.now();
        setTransport({ isPlaying: true, positionMs: 0, durationMs: maxMs });

        tickWithDrift();
    }, [clearChannels, inputRef, isPaused, midiChannelTrackers, midiData, midiEventTrackers, pausedAtMs, playbackGeneration, preprocessData, preprocessedData, props, setLoadedFilename, setTransport, startTime, tickWithDrift, tickToTime, totalDurationMs, updateNotes]);

    return (
        <MenuItem sx={{ padding: "0" }}>
            <label className="midi-file-input-label" style={{ width: "100%", height: "100%", paddingTop: 6, paddingBottom: 6, paddingLeft: 16, paddingRight: 16 }}>
                <ListItemIcon>
                    <AudioFileIcon style={{ color: colorPalette.UI_Primary }} fontSize="small" />
                </ListItemIcon>
                <input style={{ width: "100%", height: "100%" }} className="midi-file-input" accept=".mid,.midi" onChange={loadMidiData} ref={inputRef} type="file" id="filereader" />
                Open MIDI file
            </label>
        </MenuItem>
    );
}

export function useMidiTransport() {
    const ctx = React.useContext(midiDataContext);
    const [transport] = ctx?.transportState ?? [{ isPlaying: false, positionMs: 0, durationMs: 0 }];
    const [positionMs, setPositionMs] = React.useState(0);

    React.useEffect(() => {
        if (!ctx) return;
        if (!transport.isPlaying) {
            setPositionMs(transport.positionMs);
            return;
        }
        const interval = setInterval(() => {
            setPositionMs(Math.min(
                Math.max(0, performance.now() - ctx.startTime.current),
                transport.durationMs,
            ));
        }, 100);
        return () => clearInterval(interval);
    }, [ctx, transport.isPlaying, transport.positionMs, transport.durationMs]);

    if (!ctx) return null;

    return {
        isPlaying: transport.isPlaying,
        positionMs,
        durationMs: transport.durationMs,
        fileName: ctx.loadedFileNameState[0],
        pause: () => ctx.controls.pause.current(),
        resume: () => ctx.controls.resume.current(),
        seekTo: (ms: number) => ctx.controls.seekTo.current(ms),
        skipForward: (ms = 10000) => ctx.controls.seekTo.current(Math.min(positionMs + ms, transport.durationMs)),
        skipBack: (ms = 10000) => ctx.controls.seekTo.current(Math.max(positionMs - ms, 0)),
    };
}
