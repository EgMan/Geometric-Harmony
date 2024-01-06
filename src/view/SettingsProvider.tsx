import React from "react";
import { LocalSynthVoice } from "../sound/SynthVoicings";
type Props = {
    children: JSX.Element
}

type Settings = {
    isMuted: boolean,
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>,
    isPercussionMuted: boolean,
    setIsPercussionMuted: React.Dispatch<React.SetStateAction<boolean>>,
    prioritizeMIDIAudio: boolean,
    setPrioritizeMIDIAudio: React.Dispatch<React.SetStateAction<boolean>>,
    localSynthVoice: LocalSynthVoice,
    setLocalSynthVoice: React.Dispatch<React.SetStateAction<LocalSynthVoice>>,
    isPeaceModeEnabled: boolean,
    setIsPeaceModeEnabled: React.Dispatch<React.SetStateAction<boolean>>,
    synthVolume: number,
    setSynthVolume: React.Dispatch<React.SetStateAction<number>>,
}

const settingsContext = React.createContext<Settings | null>(null);

function SettingsProvider(props: Props) {
    const [isMuted, setIsMuted] = React.useState(false);
    const [isPercussionMuted, setIsPercussionMuted] = React.useState(true);
    const [prioritizeMIDIAudio, setPrioritizeMIDIAudio] = React.useState(true);
    const [localSynthVoice, setLocalSynthVoice] = React.useState<LocalSynthVoice>(LocalSynthVoice.Square);
    const [isPeaceModeEnabled, setIsPeaceModeEnabled] = React.useState<boolean>(false);
    const [synthVolume, setSynthVolume] = React.useState<number>(100);

    const settings = React.useMemo(() => ({
        isMuted,
        setIsMuted,
        isPercussionMuted,
        setIsPercussionMuted,
        prioritizeMIDIAudio,
        setPrioritizeMIDIAudio,
        localSynthVoice,
        setLocalSynthVoice,
        isPeaceModeEnabled,
        setIsPeaceModeEnabled,
        synthVolume,
        setSynthVolume,
    }), [isMuted, isPeaceModeEnabled, isPercussionMuted, localSynthVoice, prioritizeMIDIAudio, synthVolume]);

    return (
        <settingsContext.Provider value={settings}>
            {props.children}
        </settingsContext.Provider>
    );
}

export function useSettings() {
    return React.useContext(settingsContext);
}

export default SettingsProvider;
