
import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import LineGraph from '../view/LineGraph';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { Group } from 'react-konva';
import { useSynth, useSynthAfterEffects } from '../sound/SoundEngine';
import { Waveform } from 'tone';
import { useNoteDisplays } from '../sound/NoteProvider';

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

function Oscilloscope(props: Props) {
    const updatePeriod = 30;

    const waveformSampleSize = 4096;
    const latchDownsampleRate = 4;
    const waveformDownsampleRate = 2;
    const latchRatio = 4;
    const waveformDisplaySize = waveformSampleSize / (waveformDownsampleRate * latchDownsampleRate * latchRatio);
    const waveformLatchDataSize = waveformSampleSize / (latchDownsampleRate * latchRatio);
    const waveformPanSpeed = 3;

    const synth = useSynth();
    const synthOut = useSynthAfterEffects();
    const updateTrigger = useNoteDisplays();
    const [values, setValues] = React.useState<number[]>(Array(waveformDisplaySize).fill(waveformDisplaySize));
    const [latchingValues, setLatchingValues] = React.useState<number[]>(Array(waveformLatchDataSize).fill(waveformDisplaySize));
    const [minValue, setMinValue] = React.useState<number>(1);
    const [maxValue, setMaxValue] = React.useState<number>(-1);

    const waveform = React.useMemo(() => {
        return new Waveform(waveformSampleSize);
    }, [waveformSampleSize]);

    React.useEffect(() => {
        if (!synthOut || !synth) {
            throw new Error("No synth found");
        }
        synthOut.connect(waveform);
    }, [waveform, synthOut, synth]);

    const latchWaveform = React.useCallback((oldVals: number[], newVals: number[]) => {
        let latchIdx = 0;
        let minDivergence = -1;
        // let minInflectionChanges = -1;
        // let minDivergencedeltaYsArePositive: boolean[] = [];

        console.log("for loop range", newVals.length - oldVals.length, newVals.length, oldVals.length);
        const highestLatchIdx = newVals.length - oldVals.length;
        for (let window = 0; window <= highestLatchIdx; window++) {
            // let inflectionChanges = 0;
            let divergence = 0;
            // let deltaYsPositivity = [];
            for (var i = 0; i < oldVals.length; i++) {
                const deltaY = newVals[i + window] - oldVals[i];
                divergence += Math.pow(Math.abs(deltaY), 2);
            }
            if (divergence < minDivergence || minDivergence === -1) {
                minDivergence = divergence;
                latchIdx = window;
            }
        }

        latchIdx = Math.max(0, Math.min(highestLatchIdx, latchIdx + waveformPanSpeed));

        // adjust for differences in last values size and current display size
        // should only really be needed when changing sample/size value
        if (latchIdx + waveformLatchDataSize > newVals.length) {
            latchIdx -= waveformLatchDataSize - newVals.length;
        }

        return latchIdx;
    }, [waveformLatchDataSize]);

    const updateDisplay = React.useCallback(() => {
        let minVal = 0;
        let maxVal = 0;

        let rawValues: Float32Array;
        rawValues = waveform.getValue();
        let displayValues = Array.from(rawValues).map(val => {
            if (isFinite(val) && !isNaN(val)) {
                minVal = Math.min(val, minVal);
                maxVal = Math.max(val, maxVal);
                return val;
            }
            return 0;
        }).filter((val, idx) => {
            return idx % latchDownsampleRate === 0;
        });

        const latchIdx = latchWaveform(latchingValues, displayValues);
        displayValues = displayValues.slice(latchIdx, latchIdx + waveformLatchDataSize);

        setLatchingValues(displayValues);

        displayValues = displayValues.filter((val, idx) => {
            return idx % waveformDownsampleRate === 0;
        })

        setMinValue(-1);
        setMaxValue(1);

        if (maxVal - minVal > 0 || values.some(val => val !== 0)) {
            setValues(displayValues);
            console.log("VALS", values.length, displayValues.length, waveformDisplaySize)
        }
    }, [waveform, latchWaveform, latchingValues, waveformLatchDataSize, values, waveformDisplaySize]);

    React.useEffect(() => {
        setTimeout(() => {
            updateDisplay();
        }, 250);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateTrigger]);

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
    }, [updateDisplay, waveform]);

    const fullRender = React.useMemo((
    ) => {
        return (
            <Group y={props.height * 0.5}>
                <LineGraph width={props.width} height={props.height} minVal={minValue} maxVal={maxValue} values={values} lineProps={{ opacity: 0.1, strokeWidth: 2, tension: 0.5 }
                } />
            </Group>
        );
    }, [maxValue, minValue, props.height, props.width, values]);

    return (
        <Group>
            {fullRender}
            <SettingsMenuOverlay settingsRows={[]} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export default Oscilloscope;