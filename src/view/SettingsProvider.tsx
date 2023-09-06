import React from "react";

type Props = {
    children: JSX.Element
}

type Settings = {
    isMuted: boolean,
    setIsMuted: React.Dispatch<React.SetStateAction<boolean>>,
}

const settingsContext = React.createContext<Settings | null>(null);

function SettingsProvider(props: Props) {
    const [isMuted, setIsMuted] = React.useState(false);

    const settings = React.useMemo(() => ({
        isMuted,
        setIsMuted,
    }), [isMuted]);

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
