
import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import LineGraph from '../view/LineGraph';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { Group } from 'react-konva';
import { useSynth, useSynthAfterEffects } from '../sound/SoundEngine';
import { FFT, Waveform } from 'tone';
import { MenuItem, Select } from '@mui/material';

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

function Oscilloscope(props: Props) {
    const updatePeriod = 50;

    const waveformSampleSize = 4096;
    const waveformDownsampleRate = 8;
    const latchRatio = 4;
    const waveformDisplaySize = waveformSampleSize / (waveformDownsampleRate * latchRatio);
    const waveformPanSpeed = 1;

    const synth = useSynth();
    const synthOut = useSynthAfterEffects();
    const [values, setValues] = React.useState<number[]>(Array(waveformDisplaySize).fill(waveformDisplaySize));
    const [minValue, setMinValue] = React.useState<number>(1);
    const [maxValue, setMaxValue] = React.useState<number>(-1);
    const [isFFT, setIsFFT] = React.useState<boolean>(false);

    const settingsMenuItems = [
        (<tr key={"tr1"}>
            <td>Mode</td>
            <td colSpan={2}>  <Select
                id="menu-dropdown"
                value={isFFT ? 1 : 0}
                label="Octave Count"
                labelId="demo-simple-select-filled-label"
                onChange={e => {
                    setIsFFT(e.target.value === 1);
                }}
            >
                <MenuItem value={0}>Waveform</MenuItem>
                <MenuItem value={1}>Spectrogram</MenuItem>
            </Select></td>
        </tr>),
    ];
    const size = 512;

    // const analyser = useSynthAnalyser();
    const analyser = React.useMemo(() => {
        return new FFT({ size: 1024 * 8, normalRange: false, smoothing: 1 });
    }, []);

    const waveform = React.useMemo(() => {
        return new Waveform(waveformSampleSize);
    }, []);

    React.useEffect(() => {
        if (!synthOut || !synth) {
            throw new Error("No synth found");
        }
        synthOut.connect(waveform);
        synth.connect(analyser);
    }, [analyser, waveform, synthOut, synth]);

    const latchWaveform = React.useCallback((oldVals: number[], newVals: number[]) => {
        let latchIdx = 0;
        let minDivergence = -1;

        console.log("for loop range", newVals.length - oldVals.length);
        const highestLatchIdx = newVals.length - oldVals.length;
        for (let window = 0; window <= highestLatchIdx; window++) {
            let divergence = 0;
            for (var i = 0; i < oldVals.length; i++) {
                divergence += Math.abs(oldVals[i] - newVals[i + window]);
            }
            if (divergence < minDivergence || minDivergence === -1) {
                minDivergence = divergence;
                latchIdx = window;
            }
        }

        latchIdx = Math.min(highestLatchIdx, latchIdx + waveformPanSpeed);

        // adjust for differences in last values size and current display size
        // should only really be needed when changing sample/size value
        if (latchIdx + waveformDisplaySize > newVals.length) {
            latchIdx -= waveformDisplaySize - newVals.length;
        }

        return latchIdx;
    }, [waveformDisplaySize]);

    const updateDisplay = React.useCallback(() => {
        let minVal = 0;
        let maxVal = 0;

        let rawValues: Float32Array;
        if (isFFT) {
            rawValues = analyser.getValue();
        }
        else {
            rawValues = waveform.getValue();
        }
        let displayValues = Array.from(rawValues);
        if (isFFT) {
            displayValues = displayValues.filter((val, idx) => {
                const freq = analyser.getFrequencyOfIndex(idx);
                return freq < 3000;
            });
        }
        else {
            displayValues = displayValues.filter((val, idx) => {
                return idx % waveformDownsampleRate === 0;
            });
        }
        displayValues = displayValues.map(val => {
            if (isFinite(val) && !isNaN(val)) {
                minVal = Math.min(val, minVal);
                maxVal = Math.max(val, maxVal);
                return val;
            }
            return 0;
        });

        if (isFFT) {
            setMinValue(minVal);
            setMaxValue(maxVal);
        }
        else {
            const latchIdx = latchWaveform(values, displayValues);
            displayValues = displayValues.slice(latchIdx, latchIdx + waveformDisplaySize);

            setMinValue(-1);
            setMaxValue(1);
        }
        if (maxVal - minVal > 0 || values.some(val => val !== 0)) {
            setValues(displayValues);
        }
    }, [analyser, isFFT, latchWaveform, values, waveform, waveformDisplaySize]);

    // React.useEffect(() => {
    //     setTimeout(() => {
    //         // updateDisplay();
    //     }, 400);
    // }, [channelDisplays, updateDisplay]);

    // const updateTick = React.useCallback(() => {
    //     updateDisplay();
    //     setTimeout(() => {
    //         updateTick();
    //     }, updatePeriod);
    // }, [updateDisplay, updatePeriod]);

    // React.useEffect(() => {
    //     updateTick();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            updateDisplay();
        }, updatePeriod); // adjust interval as needed

        // Clear interval on unmount
        return () => clearInterval(intervalId);
    }, [analyser, isFFT, updateDisplay, waveform]);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group y={props.height * 0.5}>
                <LineGraph width={props.width} height={props.height} minVal={minValue} maxVal={maxValue} values={values} lineProps={{ opacity: 0.1, strokeWidth: 2 }
                } />
            </Group>
        );
    }, [maxValue, minValue, props.height, props.width, values]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={settingsMenuItems} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export default Oscilloscope;