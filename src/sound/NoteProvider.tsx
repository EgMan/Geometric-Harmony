import React from "react";
import useRenderingTrace from "../utils/ProfilingUtils";
import { SpeakerSoundType } from "./SoundEngine";
import { channel } from "diagnostics_channel";
import { DefaultNoteBank, INITIAL_ACTIVE_NOTES, NoteBank } from "../utils/NotesetBank";

type Props = {
    children: JSX.Element
}

export enum NoteSet {
    Active = "Active",
    Highlighted = "Highlighted",
    Emphasized = "Emphasized",
    Emphasized_OctaveGnostic = "Emphasized_OctaveGnostic",
    KeypressInput = "KeypressInput",
    PlayingInput = "PlayingInput",
    MIDIFileInput = "MidiFileInput",
}

export type NoteChannel = {
    name: string,
    channelTypes: Set<string>,
    notes: Set<number>,
    color?: string,
    playTo?: SpeakerSoundType,
}


type NoteChannels = {
    [key: string]: NoteChannel,
}

const homeNoteContext = React.createContext<number | null>(null);
const setHomeNoteContext = React.createContext((note: number | null) => { });
const updateNoteSetContext = React.createContext((noteSet: string[] | string, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false, types: Set<string> | null = null, color: string | null = null) => { });
const rawChannelContext = React.createContext<{ get: NoteChannels, set: null | React.Dispatch<React.SetStateAction<NoteChannels>> }>({ get: {} as NoteChannels, set: null });

const noteBankContext = React.createContext<{ get: NoteBank, set: null | React.Dispatch<React.SetStateAction<NoteBank>> }>({ get: DefaultNoteBank, set: null });

const octaveAgnosticNoteSets = new Set<string>([NoteSet.Active, NoteSet.Emphasized, NoteSet.Highlighted]);


function NoteProvider(props: Props) {
    const [channels, setChannels] = React.useState<NoteChannels>({
        [NoteSet.Active]: { name: NoteSet.Active, channelTypes: new Set([NoteSet.Active]), notes: new Set<number>(INITIAL_ACTIVE_NOTES) },
        [NoteSet.Emphasized]: { name: NoteSet.Emphasized, channelTypes: new Set([NoteSet.Emphasized]), notes: new Set<number>([]), color: "red" },
        [NoteSet.Highlighted]: { name: NoteSet.Highlighted, channelTypes: new Set([NoteSet.Highlighted]), notes: new Set<number>([]) },
        [NoteSet.Emphasized_OctaveGnostic]: { name: NoteSet.Emphasized_OctaveGnostic, channelTypes: new Set([NoteSet.Emphasized_OctaveGnostic]), notes: new Set<number>([]), color: "red" },
        [NoteSet.KeypressInput]: { name: NoteSet.KeypressInput, channelTypes: new Set([NoteSet.KeypressInput]), notes: new Set<number>([]), color: "hsl(25, 100%, 50%)" },
    });
    // console.log("channels", channels);
    const [homeNoteRaw, setHomeNoteRaw] = React.useState<number | null>(10);
    const homeNote = React.useMemo(() => homeNoteRaw !== null && channels[NoteSet.Active].notes.has(homeNoteRaw) ? homeNoteRaw : null, [homeNoteRaw, channels]);
    const setHomeNote = React.useCallback((note: number | null) => {
        // if (noteSets[NoteSet.Active].has(note)) {
        const newHome = note === null ? null : normalizeToSingleOctave(note);
        setHomeNoteRaw(newHome);

        // Update the active note bank entry
        setNoteBank(prevBank => {
            const newBank = { ...prevBank };
            newBank.entries[newBank.activeIndex] = { activeNotes: prevBank.entries[prevBank.activeIndex].activeNotes, homeNote: newHome };
            return newBank;
        });
    }, []);

    const [noteBank, setNoteBank] = React.useState<NoteBank>(DefaultNoteBank);

    // Clear home note if no longer active
    React.useEffect(() => {
        if (homeNoteRaw !== null && !channels[NoteSet.Active].notes.has(homeNoteRaw)) {
            setHomeNoteRaw(null);
        }
    }, [homeNote, homeNoteRaw, channels]);

    useRenderingTrace("NoteProvider.setNoteSet", { noteSets: channels });
    const setNoteSet = React.useCallback(
        (noteSetsToUpdate: string[] | string, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false, types: Set<string> | null = null, color: string | null = null) => {

            setChannels(prevNoteSets => {
                const newNoteSets = { ...prevNoteSets };  // Make a shallow copy of the current state

                const writeToNoteSet = (noteSet: string) => {
                    if (!newNoteSets[noteSet]) {
                        newNoteSets[noteSet] = { name: noteSet, channelTypes: types ?? new Set(), notes: new Set<number>() };
                    }
                    const startingPoint = overwriteExisting ? new Set<number>() : newNoteSets[noteSet]?.notes;

                    const maybeModdedNums = !octaveAgnosticNoteSets.has(noteSet) ? nums : nums.map(elem => {
                        return ((12 * 12) + elem) % 12;
                    });

                    if (areEnabled) {
                        newNoteSets[noteSet] = {
                            ...(newNoteSets[noteSet] ?? []),
                            name: noteSet,
                            notes: new Set(Array.from(startingPoint).concat(maybeModdedNums))
                        };
                    } else {
                        const numsSet = new Set(maybeModdedNums);
                        newNoteSets[noteSet] = { ...(newNoteSets[noteSet] ?? []), name: noteSet, notes: new Set(Array.from(startingPoint).filter(elem => !numsSet.has(elem))) };
                    }
                    if (types) {
                        newNoteSets[noteSet] = { ...newNoteSets[noteSet], channelTypes: types };
                    }
                    if (color) {
                        newNoteSets[noteSet] = { ...newNoteSets[noteSet], color: color };
                    }
                };

                if (noteSetsToUpdate instanceof Array) {
                    noteSetsToUpdate.forEach(writeToNoteSet);
                } else {
                    writeToNoteSet(noteSetsToUpdate);
                }

                // Only update the state if there's a genuine change
                for (const key in newNoteSets) {
                    const keynum = String(key) as NoteSet;
                    if (!prevNoteSets[keynum] ||
                        newNoteSets[keynum].notes.size !== prevNoteSets[keynum].notes.size ||
                        !Array.from(newNoteSets[keynum].notes).every(elem => prevNoteSets[keynum].notes.has(elem))) {
                        return newNoteSets;
                    }
                }
                return prevNoteSets;
            });

            // If changing the Active channel, update the note bank entries
            if (noteSetsToUpdate.includes(NoteSet.Active)) {
                setNoteBank(prevBank => {
                    const newBank = { ...prevBank };
                    newBank.entries[newBank.activeIndex] = { activeNotes: nums, homeNote: homeNote };
                    return newBank;
                });
            }
        },
        [homeNote]
    );


    // For adding new known shapes
    // React.useEffect(() => {
    //     const activeNotes = getNoteSet(NoteSet.Active);
    //     var str = "";
    //     Array.from(Array(12).keys()).forEach(elem => {
    //         str += `[${activeNotes.has(elem) ? "true" : "false"}], `
    //     });
    //     // console.log(`${activeNotes.size} active notes: `, Array.from(Array(12).keys()).map(elem => activeNotes.has(elem)));
    //     console.log(`[${str.slice(0, -2)}]`);
    // }, [getNoteSet, noteSets]);

    return (
        <updateNoteSetContext.Provider value={setNoteSet}>
            <homeNoteContext.Provider value={homeNote}>
                <setHomeNoteContext.Provider value={setHomeNote}>
                    <rawChannelContext.Provider value={{ get: channels, set: setChannels }}>
                        <noteBankContext.Provider value={{ get: noteBank, set: setNoteBank }}>
                            {props.children}
                        </noteBankContext.Provider>
                    </rawChannelContext.Provider>
                </setHomeNoteContext.Provider>
            </homeNoteContext.Provider>
        </updateNoteSetContext.Provider>
    );
}

export function useNoteSet(noteSet: string, normalizeToOneOctave?: boolean) {
    const channels = React.useContext(rawChannelContext);
    const chan = channels.get[noteSet];
    return React.useMemo<NoteChannel>(() => {
        if (!chan) return { name: noteSet, channelTypes: new Set(), notes: new Set<number>() };
        if (normalizeToOneOctave) {
            return { ...channels.get[noteSet], notes: new Set(Array.from(channels.get[String(noteSet)].notes).map(elem => normalizeToSingleOctave(elem))) };
        }
        return channels.get[noteSet];
    }, [chan, normalizeToOneOctave, channels, noteSet]);
}

export function useClearChannelsOfType() {
    const channels = React.useContext(rawChannelContext);
    return React.useCallback((type: string) => {
        channels.set?.(prevChannels => {
            return Object.keys(prevChannels).filter(name => !Array.from(prevChannels[name]?.channelTypes).includes(type)).reduce((obj, key) => { obj[key] = prevChannels[key]; return obj; }, {} as NoteChannels);
        });
    }, [channels]);
}

export function useUpdateNoteSet() {
    return React.useContext(updateNoteSetContext);
}

export function useHomeNote() {
    return React.useContext(homeNoteContext);
}

export function useSetHomeNote() {
    return React.useContext(setHomeNoteContext);
}

export function useNoteBank() {
    return React.useContext(noteBankContext);
}

export function normalizeToSingleOctave(i: number) {
    return ((12 * 12) + i) % 12;
}

// TODO we can get rid of this function
export function useGetCombinedModdedEmphasis() {
    const emphasized = useNoteSet(NoteSet.Emphasized);
    const emphasizedOctaveGnosticChannels = useNoteSet(NoteSet.Emphasized_OctaveGnostic);
    return React.useMemo(() => {

        const emphasizedOctaveGnostic = new Set(Array.from(emphasizedOctaveGnosticChannels.notes).map(elem => {
            return normalizeToSingleOctave(elem);
        }));

        //There has gotta be a better way to union two sets
        return new Set(Array.from(emphasizedOctaveGnostic).concat(Array.from(emphasized.notes)));
    }, [emphasized.notes, emphasizedOctaveGnosticChannels.notes]);
}

export function useCheckNoteEmphasis() {
    // const getNoteSet = useNoteSet();
    const emphasized = useNoteSet(NoteSet.Emphasized).notes;
    const emphasizedOctaveGnostic = useNoteSet(NoteSet.Emphasized_OctaveGnostic).notes;
    return React.useCallback((note: number, octaveGnostic: boolean) => {
        // const emphasized = useNoteSet(NoteSet.Emphasized).notes;
        // var emphasizedOctaveGnostic = useNoteSet(NoteSet.Emphasized_OctaveGnostic).notes;

        let emphasizedOctaveGnosticProcessed = emphasizedOctaveGnostic;
        if (!octaveGnostic) {
            emphasizedOctaveGnosticProcessed = new Set(Array.from(emphasizedOctaveGnostic).map(elem => {
                return normalizeToSingleOctave(elem);
            }));
            return emphasized.has(note) || emphasizedOctaveGnostic.has(note);
        }

        return emphasizedOctaveGnosticProcessed.has(note) || emphasized.has(normalizeToSingleOctave(note));
    }, [emphasized, emphasizedOctaveGnostic]);
}

export function useNotesOfType(...types: string[]) {
    const channels = React.useContext(rawChannelContext);
    return React.useMemo(() => {
        return Object.keys(channels.get).filter(name => Array.from(channels.get[name].channelTypes).some(typeInChannel => types.includes(typeInChannel))).reduce((obj, key) => { channels.get[key].notes.forEach(note => obj.push([channels.get[key], note])); return obj; }, [] as Array<[NoteChannel, number]>);
    }, [channels, types]);
}

function useChannelNamesToDisplay() {
    const channels = React.useContext(rawChannelContext);
    return React.useMemo(() => {
        return Object.keys(channels.get)
            .filter(name => channels.get[name].notes.size > 0 && channels.get[name].color)
    }, [channels.get]);
}

export function useChannelDisplays() {
    const channels = React.useContext(rawChannelContext);
    const names = useChannelNamesToDisplay();
    return React.useMemo(() => {
        return names.reduce((obj, key) => { obj.push(channels.get[key]); return obj; }, [] as NoteChannel[]).filter(channel => channel.notes.size > 0);
    }, [channels.get, names]);
}
export function useNoteDisplays() {
    const channels = React.useContext(rawChannelContext);
    const names = useChannelNamesToDisplay();
    return React.useMemo(() => {
        return names
            .reduce((obj, key) => {
                const channel = channels.get[key];
                if (channel) {
                    channel.notes.forEach(note => {
                        const octaveGnostic = obj.octaveGnostic[note] ?? [];
                        const normalized = obj.normalized[normalizeToSingleOctave(note)] ?? [];
                        normalized.push(channel);
                        octaveGnostic.push(channel);
                        obj.octaveGnostic[note] = octaveGnostic;
                        obj.normalized[normalizeToSingleOctave(note)] = normalized;
                    });
                    return obj;
                }
                return obj;
            }, { normalized: {}, octaveGnostic: {} } as {
                normalized: {
                    [note: number]: NoteChannel[],
                }
                octaveGnostic: {
                    [note: number]: NoteChannel[],
                }
            });
    }, [channels.get, names]);
}

export default NoteProvider;
