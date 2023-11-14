import React from "react";
import { LocalSynthVoice } from "../sound/SynthVoicings";
type Props = {
    children: JSX.Element
}

type Settings = {
    isMuted: boolean,
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>,
    prioritizeMIDIAudio: boolean,
    setPrioritizeMIDIAudio: React.Dispatch<React.SetStateAction<boolean>>,
    localSynthVoice: LocalSynthVoice,
    setLocalSynthVoice: React.Dispatch<React.SetStateAction<LocalSynthVoice>>,
}

const settingsContext = React.createContext<Settings | null>(null);

function SettingsProvider(props: Props) {
    const [isMuted, setIsMuted] = React.useState(false);
    const [prioritizeMIDIAudio, setPrioritizeMIDIAudio] = React.useState(true);
    const [localSynthVoice, setLocalSynthVoice] = React.useState<LocalSynthVoice>(LocalSynthVoice.Sine);

    const settings = React.useMemo(() => ({
        isMuted,
        setIsMuted,
        prioritizeMIDIAudio,
        setPrioritizeMIDIAudio,
        localSynthVoice,
        setLocalSynthVoice,
    }), [isMuted, localSynthVoice, prioritizeMIDIAudio]);

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
