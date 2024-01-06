import { Slider } from "@mui/material";
import React from "react";
import { useSynth } from "./SoundEngine";
import { useSettings } from "../view/SettingsProvider";

type Props = {
}

function VolumeSlider(props: Props) {
    const settings = useSettings()!;

    return <Slider
        size="small"
        value={settings.synthVolume}
        onChange={(e, v) => settings.setSynthVolume(v as number)}
        defaultValue={70}
        aria-label="Small"
        valueLabelDisplay="auto"
    />;
}

export default VolumeSlider;