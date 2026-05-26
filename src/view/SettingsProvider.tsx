import React from "react";
import { LocalSynthVoice } from "../sound/SynthVoicings";

export enum NoteDisplayMode {
    NoteNames = "noteNames",
    Intervals = "intervals",
}

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
    noteDisplayMode: NoteDisplayMode,
    setNoteDisplayMode: React.Dispatch<React.SetStateAction<NoteDisplayMode>>,
}

const settingsContext = React.createContext<Settings | null>(null);

function SettingsProvider(props: Props) {
    const [isMuted, setIsMuted] = React.useState(false);
    const [isPercussionMuted, setIsPercussionMuted] = React.useState(true);
    const [prioritizeMIDIAudio, setPrioritizeMIDIAudio] = React.useState(true);
    const [localSynthVoice, setLocalSynthVoice] = React.useState<LocalSynthVoice>(LocalSynthVoice.Triangle);
    const [isPeaceModeEnabled, setIsPeaceModeEnabled] = React.useState<boolean>(false);
    const [synthVolume, setSynthVolume] = React.useState<number>(100);
    const [noteDisplayMode, setNoteDisplayMode] = React.useState<NoteDisplayMode>(NoteDisplayMode.NoteNames);

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
        noteDisplayMode,
        setNoteDisplayMode,
    }), [isMuted, isPeaceModeEnabled, isPercussionMuted, localSynthVoice, noteDisplayMode, prioritizeMIDIAudio, synthVolume]);

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
