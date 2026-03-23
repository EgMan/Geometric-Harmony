import React from "react";
import { Group, Line, Rect, Text } from 'react-konva';
import { WidgetComponentProps } from "../view/Widget";
import { WidgetConfig } from "../view/ViewManager";
import { NoteSet, normalizeToSingleOctave, useNoteSet, useUpdateNoteSet } from "../sound/NoteProvider";
import * as Pitchfinder from "pitchfinder";
import { useAppTheme } from "../view/ThemeManager";
import SettingsMenuOverlay from "../view/SettingsMenuOverlay";
import { Switch } from "@mui/material";

export interface MicPitchConfig extends WidgetConfig {
    snapToScale: boolean;
    playAudio: boolean;
}

export const WidgetConfig_MicPitch: MicPitchConfig = {
    type: "micpitch",
    displayName: "Tuner",
    snapToScale: false,
    playAudio: true,
};

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MIC_GREEN = "#22c55e";

function noteHz(midiNote: number): number {
    return 440 * Math.pow(2, (midiNote - 69) / 12);
}

type Props = {
    width: number;
    height: number;
} & WidgetComponentProps;

function MicPitch(props: Props) {
    const [hz, setHz] = React.useState<number | null>(null);
    const [micError, setMicError] = React.useState<string | null>(null);
    const { colorPalette } = useAppTheme()!;

    React.useEffect(() => {
        let stream: MediaStream | null = null;
        let audioContext: AudioContext | null = null;
        let pollInterval: ReturnType<typeof setInterval> | null = null;

        async function setup() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
                audioContext = new AudioContext();
                await audioContext.resume();
                const source = audioContext.createMediaStreamSource(stream);
                const analyser = audioContext.createAnalyser();
                analyser.fftSize = 4096;
                source.connect(analyser);

                const buffer = new Float32Array(analyser.fftSize);
                const detectPitch = Pitchfinder.AMDF({ sampleRate: audioContext.sampleRate });

                pollInterval = setInterval(() => {
                    analyser.getFloatTimeDomainData(buffer);
                    const pitch = detectPitch(buffer);
                    setHz(pitch ?? null);
                }, 100);
            } catch (err: any) {
                const denied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
                setMicError(denied ? 'Mic access denied' : 'Mic unavailable');
            }
        }

        setup();

        return () => {
            if (pollInterval) clearInterval(pollInterval);
            audioContext?.close();
            stream?.getTracks().forEach(t => t.stop());
        };
    }, []);
    const updateNotes = useUpdateNoteSet();
    const activeNotes = useNoteSet(NoteSet.Active).notes;

    const config = props.fromWidget.widgetConfig as MicPitchConfig;
    const [snapToScale, setSnapToScale] = React.useState(config.snapToScale);
    const [playAudio, setPlayAudio] = React.useState(config.playAudio);

    // Raw MIDI note from detected Hz
    const rawMidi = hz !== null ? Math.round(12 * Math.log2(hz / 440)) + 69 : null;

    // Apply snap-to-scale if enabled
    const effectiveMidi = React.useMemo(() => {
        if (rawMidi === null) return null;
        if (!snapToScale || activeNotes.size === 0) return rawMidi;

        const rawDegree = normalizeToSingleOctave(rawMidi);
        const octaveBase = rawMidi - rawDegree;

        let bestDegree = rawDegree;
        let bestDist = Infinity;
        activeNotes.forEach(activeDegree => {
            const dist = Math.min(
                Math.abs(activeDegree - rawDegree),
                12 - Math.abs(activeDegree - rawDegree)
            );
            if (dist < bestDist) {
                bestDist = dist;
                bestDegree = activeDegree;
            }
        });

        return octaveBase + bestDegree;
    }, [rawMidi, snapToScale, activeNotes]);

    // Feed detected note into NoteProvider
    const prevMidi = React.useRef<number | null>(null);
    React.useEffect(() => {
        if (effectiveMidi === prevMidi.current) return;
        prevMidi.current = effectiveMidi;

        const types = playAudio
            ? new Set([NoteSet.PlayingInput])
            : new Set([NoteSet.MicPitchInput]);

        updateNotes(NoteSet.MicPitchInput, effectiveMidi !== null ? [effectiveMidi] : [], true, true, types, MIC_GREEN);
    }, [effectiveMidi, playAudio, updateNotes]);

    // Cleanup channel on unmount
    React.useEffect(() => {
        return () => {
            updateNotes(NoteSet.MicPitchInput, [], true, true, new Set([NoteSet.MicPitchInput]), MIC_GREEN);
        };
    }, [updateNotes]);

    // Display values
    const noteName = micError ? "!" : effectiveMidi !== null
        ? `${NOTE_NAMES[((effectiveMidi % 12) + 12) % 12]}${Math.floor(effectiveMidi / 12) - 1}`
        : "—";
    const hzText = micError ?? (hz !== null ? `${hz.toFixed(1)} Hz` : "");

    // Tuner strip geometry
    const stripY = props.height * 0.58;
    const stripHeight = props.height * 0.32;
    const stripWidth = props.width - 20;
    const stripX = 10;
    const semitoneCount = 2; // ±1 semitone
    const semitoneSpacing = stripWidth / semitoneCount;
    const centerX = stripX + stripWidth / 2;

    const nearestMidi = effectiveMidi ?? rawMidi;

    const stripElements: JSX.Element[] = [];
    if (nearestMidi !== null) {
        for (let i = -1; i <= 1; i++) {
            const midi = nearestMidi + i;
            const x = centerX + i * semitoneSpacing;
            const degree = ((midi % 12) + 12) % 12;
            const octave = Math.floor(midi / 12) - 1;
            const label = `${NOTE_NAMES[degree]}${octave}`;
            const isCenter = i === 0;

            stripElements.push(
                <React.Fragment key={`tick${i}`}>
                    <Line
                        points={[x, stripY + 2, x, stripY + stripHeight * (isCenter ? 0.55 : 0.35)]}
                        stroke={colorPalette.Widget_Primary}
                        strokeWidth={isCenter ? 2 : 1}
                        opacity={isCenter ? 0.8 : 0.3}
                    />
                    <Text
                        x={x - 15}
                        y={stripY + stripHeight * 0.6}
                        width={30}
                        text={label}
                        fontSize={isCenter ? 10 : 8}
                        fontFamily="monospace"
                        fill={colorPalette.Widget_Primary}
                        opacity={isCenter ? 0.9 : 0.3}
                        align="center"
                    />
                </React.Fragment>
            );
        }

        // Pitch indicator — offset by cents from nearest note
        if (hz !== null) {
            const cents = 1200 * Math.log2(hz / noteHz(nearestMidi));
            const indicatorX = centerX + (cents / 50) * (semitoneSpacing / 2);
            stripElements.push(
                <Rect
                    key="indicator"
                    x={indicatorX - 3}
                    y={stripY + 2}
                    width={6}
                    height={stripHeight * 0.5}
                    fill={MIC_GREEN}
                    cornerRadius={3}
                />
            );
        }
    }

    const settingsRows = [
        <tr key="snap">
            <td>Snap to active scale</td>
            <td><Switch color="primary" checked={snapToScale} onChange={e => setSnapToScale(e.target.checked)} /></td>
        </tr>,
        <tr key="audio">
            <td>Play audio</td>
            <td><Switch color="primary" checked={playAudio} onChange={e => setPlayAudio(e.target.checked)} /></td>
        </tr>,
    ];

    return (
        <Group>
            {/* Note name */}
            <Text
                x={0}
                y={props.height * 0.08}
                width={props.width}
                text={noteName}
                fontSize={40}
                fontFamily="monospace"
                fill={micError ? "#ef4444" : hz !== null ? MIC_GREEN : colorPalette.Widget_Primary}
                opacity={micError ? 1 : hz !== null ? 1 : 0.3}
                align="center"
            />
            {/* Frequency */}
            <Text
                x={0}
                y={props.height * 0.48}
                width={props.width}
                text={hzText}
                fontSize={12}
                fontFamily="monospace"
                fill={colorPalette.Widget_Primary}
                opacity={0.5}
                align="center"
            />
            {/* Strip background */}
            <Rect
                x={stripX}
                y={stripY}
                width={stripWidth}
                height={stripHeight}
                fill={colorPalette.Widget_Primary}
                opacity={0.05}
                cornerRadius={4}
            />
            {stripElements}
            <SettingsMenuOverlay fromWidget={props.fromWidget} settingsRows={settingsRows} />
        </Group>
    );
}

export default MicPitch;
