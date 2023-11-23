import React from "react";
import { useSettings } from "../view/SettingsProvider";
import * as Tone from 'tone';
import { usePrevious } from "../utils/Utils";

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
            // synth.synth.dispose(); //memory leak?
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
            decay: 1.25,
            wet: 0.75,
        });
        const filter = new Tone.Filter({
            frequency: 75000,
            type: "lowpass",
            gain: 0,
            Q: 10,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: 55,
            mid: 20,
            high: 0,
            lowFrequency: 2500,
            highFrequency: 20000,
        });
        const gain = new Tone.Gain(
            {
                gain: 1.1,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: 3.5,
            threshold: -90,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 } });
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function sharpSquares() {
        const reverb = new Tone.Reverb({
            decay: 1.25,
            wet: 0.75,
        });
        const filter = new Tone.Filter({
            frequency: 75000,
            type: "lowpass",
            gain: 0,
            Q: 10,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: 55,
            mid: 20,
            high: 0,
            lowFrequency: 2500,
            highFrequency: 20000,
        });
        const gain = new Tone.Gain(
            {
                gain: 1.1,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: 3.5,
            threshold: -90,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "square" }, envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 } });
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function trickyTriangles() {
        const reverb = new Tone.Reverb({
            decay: 1.25,
            wet: 0.75,
        });
        const filter = new Tone.Filter({
            frequency: 75000,
            type: "lowpass",
            gain: 0,
            Q: 10,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: 55,
            mid: 20,
            high: 0,
            lowFrequency: 2500,
            highFrequency: 20000,
        });
        const gain = new Tone.Gain(
            {
                gain: 1.1,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: 3.5,
            threshold: -90,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle" }, envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 } });
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function AMSynth() {
        const reverb = new Tone.Reverb({
            decay: 1.25,
            wet: 0.75,
        });
        const filter = new Tone.Filter({
            frequency: 75000,
            type: "lowpass",
            gain: 0,
            Q: 10,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: 55,
            mid: 20,
            high: 0,
            lowFrequency: 2500,
            highFrequency: 20000,
        });
        const gain = new Tone.Gain(
            {
                gain: 1.1,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: 3.5,
            threshold: -90,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.AMSynth, { oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 } });
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function FMSynth() {
        const reverb = new Tone.Reverb({
            decay: 1.25,
            wet: 0.75,
        });
        const filter = new Tone.Filter({
            frequency: 75000,
            type: "lowpass",
            gain: 0,
            Q: 10,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: 55,
            mid: 20,
            high: 0,
            lowFrequency: 2500,
            highFrequency: 20000,
        });
        const gain = new Tone.Gain(
            {
                gain: 1.1,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: 3.5,
            threshold: -90,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();
        // panner.pan.rampTo(0, 0.1);


        // const limiter = new Tone.Limiter(    -50).toDestination();
        // const polysynth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" } })
        const polysynth = new Tone.PolySynth(Tone.FMSynth, { oscillator: { type: "sine" }, envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 } });
        // polysynth.voices.forEach(voice => {});
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synth: polysynth, synthAfterEffects: compressor };
}

function snare(): SynthDrum {
        const reverb = new Tone.Reverb({
            decay: 1.25,
            wet: 0.75,
        });
        const filter = new Tone.Filter({
            frequency: 75000,
            type: "lowpass",
            gain: 0,
            Q: 10,
        });
        const autowah = new Tone.AutoWah().toDestination();
        const bitcrusher = new Tone.BitCrusher();
        const distortion = new Tone.Distortion({
            distortion: 0.1,
            wet: 0.1,
        });
        const eq = new Tone.EQ3({
            low: 55,
            mid: 20,
            high: 0,
            lowFrequency: 2500,
            highFrequency: 20000,
        });
        const gain = new Tone.Gain(
            {
                gain: 1.1,
                // gain: 1000,
            }
        );
        const compressor = new Tone.Compressor({
            ratio: 3.5,
            threshold: -90,
            // release: 0,
            // attack: 0.001,
            // knee: 10,
        });

        // const panner = new Tone.Panner(1).toDestination();                             
        // panner.pan.rampTo(0, 0.1);

        // const polysynth = new Tone.NoiseSynth({envelope: { attack: 0.1, decay: 0.05, sustain: 0, release: 0 } });
        // const polysynth = new Tone.PolySynth(Tone.MembraneSynth, { envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 } });
        // polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);
        
        const polysynth = new Tone.PolySynth(Tone.MembraneSynth, {  envelope: { attack: 0.05, decay: 0.05, sustain: 0.75, release: 0.2 }, oscillator: { type: "square" }});
        polysynth.chain(eq, compressor, gain, reverb, Tone.Destination);

        return { synthDrum: polysynth, synthDrumAfterEffects: compressor };
}