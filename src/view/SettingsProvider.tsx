import React from "react";

type Props = {
    children: JSX.Element
}

type Settings = {
    isMuted: boolean,
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>,
    prioritizeMIDIAudio: boolean,
    setPrioritizeMIDIAudio: React.Dispatch<React.SetStateAction<boolean>>,
}

const settingsContext = React.createContext<Settings | null>(null);

function SettingsProvider(props: Props) {
    const [isMuted, setIsMuted] = React.useState(false);
    const [prioritizeMIDIAudio, setPrioritizeMIDIAudio] = React.useState(true);

    const settings = React.useMemo(() => ({
        isMuted,
        setIsMuted,
        prioritizeMIDIAudio,
        setPrioritizeMIDIAudio
    }), [isMuted, prioritizeMIDIAudio]);

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
