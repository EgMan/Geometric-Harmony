import React from "react";
import { useSettings } from "../view/SettingsProvider";
import * as Tone from 'tone';
import { usePrevious } from "../utils/Utils";
// -- Synth effect chain constants --

/** Maximum simultaneous notes for a PolySynth instance. */
const MAX_POLYPHONY = 128;

const SYNTH_REVERB_DECAY = 1.25;
const SYNTH_REVERB_WET = 0.75;

const SYNTH_FILTER_FREQUENCY = 75000;
const SYNTH_FILTER_Q = 10;

const SYNTH_EQ_LOW = 55;
const SYNTH_EQ_MID = 20;
const SYNTH_EQ_HIGH = 0;
const SYNTH_EQ_LOW_FREQUENCY = 2500;
const SYNTH_EQ_HIGH_FREQUENCY = 20000;

const SYNTH_GAIN = 1.1;

const SYNTH_COMPRESSOR_RATIO = 3.5;
const SYNTH_COMPRESSOR_THRESHOLD = -90;

const SYNTH_ENVELOPE = {
    attack: 0.05,
    decay: 0.05,
    sustain: 0.75,
    release: 0.2,
};

/** Snare noise filter frequency (Hz). */
const SNARE_NOISE_FILTER_FREQ = 8000;
/** Snare noise gain. */
const SNARE_NOISE_GAIN = 0.55;

export enum LocalSynthVoice {
    Sine = "Smooth Sines",
    Square = "Sharp Squares",
    Triangle = "Tricky Triangles",
    AMSynth = "AM Synth",
    FMSynth = "FM Synth",
    Snare = "Snare",
}

export type SynthVoice = {
    synth: Tone.PolySynth;
    synthAfterEffects: Tone.ToneAudioNode;
}

export type SynthDrum = {
    synthDrum: Tone.PolySynth;
    synthDrumAfterEffects: Tone.ToneAudioNode;
    volumeNode: Tone.Gain;
};

export function useSynthDrumFromSettings(): SynthDrum {
    const settings = useSettings();
    const [synthDrum, setSynthDrum] = React.useState<SynthVoice | null>(null);

    const prevSynthVoice = usePrevious<LocalSynthVoice | null>(settings?.localSynthVoice ?? null, null);

    // if (synthDrum && prevSynthVoice && prevSynthVoice !== settings?.localSynthVoice) {
    //     if (!synthDrum.synth.disposed) {
    //         synthDrum.synth.releaseAll();
    //         // synth.synth.dispose(); //memory leak?
    //     }
    // }
    return React.useMemo(() => {
        return snare();
   }, []);
}

export function useSynthVoiceFromSettings(): SynthVoice {
    const settings = useSettings();
    const [synth, setSynth] = React.useState<SynthVoice | null>(null);

    const prevSynthVoice = usePrevious<LocalSynthVoice | null>(settings?.localSynthVoice ?? null, null);

    if (synth && prevSynthVoice && prevSynthVoice !== settings?.localSynthVoice) {
        if (!synth.synth.disposed) {
            synth.synth.releaseAll();
        }
    }

    return React.useMemo(() => {
        const synthVoice = settings?.localSynthVoice as LocalSynthVoice;
        let newSynth: SynthVoice;
        switch (synthVoice) {
            case LocalSynthVoice.Sine:
                newSynth = smoothSines();
                break;
            case LocalSynthVoice.Square:
                newSynth = sharpSquares();
                break;
            case LocalSynthVoice.Triangle:
                newSynth = trickyTriangles();
                break;
            case LocalSynthVoice.AMSynth:
                newSynth = AMSynth();
                break;
            case LocalSynthVoice.FMSynth:
            default:
                newSynth = smoothSines();
                break;
        }
        setSynth(newSynth);
        return newSynth;
    }, [settings?.localSynthVoice]);
}

function smoothSines() {
        const reverb = new Tone.Reverb({
            decay: SYNTH_REVERB_DECAY,
            wet: SYNTH_REVERB_WET,
        });
        const filter = new Tone.Filter({
            frequency: SYNTH_FILTER_FREQUENCY,
            type: "lowpass",
            gain: 0,
            Q: SYNTH_FILTER_Q,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: SYNTH_EQ_LOW,
            mid: SYNTH_EQ_MID,
            high: SYNTH_EQ_HIGH,
            lowFrequency: SYNTH_EQ_LOW_FREQUENCY,
            highFrequency: SYNTH_EQ_HIGH_FREQUENCY,
        });
        const gain = new Tone.Gain(
            {
                gain: SYNTH_GAIN,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: SYNTH_COMPRESSOR_RATIO,
            threshold: SYNTH_COMPRESSOR_THRESHOLD,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: SYNTH_ENVELOPE });
        polysynth.maxPolyphony = MAX_POLYPHONY;
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function sharpSquares() {
        const reverb = new Tone.Reverb({
            decay: SYNTH_REVERB_DECAY,
            wet: SYNTH_REVERB_WET,
        });
        const filter = new Tone.Filter({
            frequency: SYNTH_FILTER_FREQUENCY,
            type: "lowpass",
            gain: 0,
            Q: SYNTH_FILTER_Q,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: SYNTH_EQ_LOW,
            mid: SYNTH_EQ_MID,
            high: SYNTH_EQ_HIGH,
            lowFrequency: SYNTH_EQ_LOW_FREQUENCY,
            highFrequency: SYNTH_EQ_HIGH_FREQUENCY,
        });
        const gain = new Tone.Gain(
            {
                gain: SYNTH_GAIN,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: SYNTH_COMPRESSOR_RATIO,
            threshold: SYNTH_COMPRESSOR_THRESHOLD,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "square" }, envelope: SYNTH_ENVELOPE });
        polysynth.maxPolyphony = MAX_POLYPHONY;
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function trickyTriangles() {
        const reverb = new Tone.Reverb({
            decay: SYNTH_REVERB_DECAY,
            wet: SYNTH_REVERB_WET,
        });
        const filter = new Tone.Filter({
            frequency: SYNTH_FILTER_FREQUENCY,
            type: "lowpass",
            gain: 0,
            Q: SYNTH_FILTER_Q,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: SYNTH_EQ_LOW,
            mid: SYNTH_EQ_MID,
            high: SYNTH_EQ_HIGH,
            lowFrequency: SYNTH_EQ_LOW_FREQUENCY,
            highFrequency: SYNTH_EQ_HIGH_FREQUENCY,
        });
        const gain = new Tone.Gain(
            {
                gain: SYNTH_GAIN,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: SYNTH_COMPRESSOR_RATIO,
            threshold: SYNTH_COMPRESSOR_THRESHOLD,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle" }, envelope: SYNTH_ENVELOPE });
        polysynth.maxPolyphony = MAX_POLYPHONY;
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function AMSynth() {
        const reverb = new Tone.Reverb({
            decay: SYNTH_REVERB_DECAY,
            wet: SYNTH_REVERB_WET,
        });
        const filter = new Tone.Filter({
            frequency: SYNTH_FILTER_FREQUENCY,
            type: "lowpass",
            gain: 0,
            Q: SYNTH_FILTER_Q,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: SYNTH_EQ_LOW,
            mid: SYNTH_EQ_MID,
            high: SYNTH_EQ_HIGH,
            lowFrequency: SYNTH_EQ_LOW_FREQUENCY,
            highFrequency: SYNTH_EQ_HIGH_FREQUENCY,
        });
        const gain = new Tone.Gain(
            {
                gain: SYNTH_GAIN,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: SYNTH_COMPRESSOR_RATIO,
            threshold: SYNTH_COMPRESSOR_THRESHOLD,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.AMSynth, { oscillator: { type: "sine" }, envelope: SYNTH_ENVELOPE });
        polysynth.maxPolyphony = MAX_POLYPHONY;
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function FMSynth() {
        const reverb = new Tone.Reverb({
            decay: SYNTH_REVERB_DECAY,
            wet: SYNTH_REVERB_WET,
        });
        const filter = new Tone.Filter({
            frequency: SYNTH_FILTER_FREQUENCY,
            type: "lowpass",
            gain: 0,
            Q: SYNTH_FILTER_Q,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: SYNTH_EQ_LOW,
            mid: SYNTH_EQ_MID,
            high: SYNTH_EQ_HIGH,
            lowFrequency: SYNTH_EQ_LOW_FREQUENCY,
            highFrequency: SYNTH_EQ_HIGH_FREQUENCY,
        });
        const gain = new Tone.Gain(
            {
                gain: SYNTH_GAIN,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: SYNTH_COMPRESSOR_RATIO,
            threshold: SYNTH_COMPRESSOR_THRESHOLD,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.FMSynth, { oscillator: { type: "sine" }, envelope: SYNTH_ENVELOPE });
        // polysynth.voices.forEach(voice => {});
        polysynth.maxPolyphony = MAX_POLYPHONY;
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function snare(): SynthDrum {
        const masterGain = new Tone.Gain({ gain: 1 });
        masterGain.toDestination();

        // Dummy polysynth — needed as the "synthDrum" handle for triggerAttack/releaseAll calls
        const polysynth = new Tone.PolySynth(Tone.MembraneSynth, {
            envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.01 },
        });
        polysynth.maxPolyphony = MAX_POLYPHONY;
        // Not chained to any output — silent

        // Noise layer — light snare transient
        const noiseFilter = new Tone.Filter({ frequency: SNARE_NOISE_FILTER_FREQ, type: "bandpass", Q: 1.5 });
        const noiseGain = new Tone.Gain({ gain: SNARE_NOISE_GAIN });
        const noiseSynth = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.05 },
        });
        noiseSynth.chain(noiseFilter, noiseGain, masterGain);

        // Trigger noise whenever the polysynth handle is triggered
        const origTriggerAttack = polysynth.triggerAttack.bind(polysynth);
        polysynth.triggerAttack = ((...args: Parameters<typeof polysynth.triggerAttack>) => {
            try {
                noiseSynth.triggerRelease(args[1]);
                noiseSynth.triggerAttack(typeof args[1] === 'number' ? args[1] + 0.001 : args[1], args[2]);
            } catch (e) { /* ignore timing conflicts */ }
            return origTriggerAttack(...args);
        }) as typeof polysynth.triggerAttack;

        const origReleaseAll = polysynth.releaseAll.bind(polysynth);
        polysynth.releaseAll = ((...args: Parameters<typeof polysynth.releaseAll>) => {
            try { noiseSynth.triggerRelease(args[0]); } catch (e) { /* ignore */ }
            return origReleaseAll(...args);
        }) as typeof polysynth.releaseAll;

        return { synthDrum: polysynth, synthDrumAfterEffects: masterGain, volumeNode: masterGain };
}