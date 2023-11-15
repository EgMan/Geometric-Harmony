
import React from 'react';
import { WidgetComponentProps } from '../view/Widget';
import LineGraph from '../view/LineGraph';
import SettingsMenuOverlay from '../view/SettingsMenuOverlay';
import { Group } from 'react-konva';
import { useSynth } from '../sound/SoundEngine';
import { FFT } from 'tone';

type Props = {
    width: number,
    height: number,
} & WidgetComponentProps

function Oscilloscope(props: Props) {
    const updatePeriod = 50;

    const synth = useSynth();
    const [values, setValues] = React.useState<number[]>([]);
    const [minValue, setMinValue] = React.useState<number>(1);
    const [maxValue, setMaxValue] = React.useState<number>(-1);

    const size = 1024 * 8;

    // const analyser = useSynthAnalyser();
    const analyser = React.useMemo(() => {
        return new FFT({ size, normalRange: false, smoothing: 1 });
    }, [size]);

    React.useEffect(() => {
        if (!synth) {
            throw new Error("No synth found");
        }
        synth.connect(analyser);
    }, [analyser, synth]);

    const updateDisplay = React.useCallback(() => {
        let minVal = 0;
        let maxVal = 0;

        let rawValues = analyser.getValue();
        let displayValues = Array.from(rawValues).filter((val, idx) => {
            const freq = analyser.getFrequencyOfIndex(idx);
            return freq < 3000;
        }).map(val => {
            if (isFinite(val) && !isNaN(val)) {
                minVal = Math.min(val, minVal);
                maxVal = Math.max(val, maxVal);
                return val;
            }
            return 0;
        });

        setMinValue(minVal);
        setMaxValue(maxVal);
        if (maxVal - minVal > 0 || values.some(val => val !== 0)) {
            setValues(displayValues);
        }
    }, [analyser, values]);

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
    }, [analyser, updateDisplay]);

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
            <SettingsMenuOverlay settingsRows={[]} fromWidget={props.fromWidget}>
                {fullRender}
            </SettingsMenuOverlay>
        </Group>
    );
}

export default Oscilloscope;