import React from "react";
import useRenderingTrace from "../utils/ProfilingUtils";
import { SpeakerSoundType } from "./SoundEngine";

type Props = {
    children: JSX.Element
}

export enum NoteSet {
    Active = "Active",
    Highlighted = "Highlighted",
    Emphasized = "Emphasized",
    Emphasized_OctaveGnostic = "Emphasized_OctaveGnostic",
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

// type NoteChannelDisplay = {
//     channel: NoteChannel,
//     color: string,
// }

const homeNoteContext = React.createContext<number | null>(null);
const setHomeNoteContext = React.createContext((note: number | null) => { });
const noteSetContext = React.createContext((noteSet: string, normalizeToOneOctave?: boolean) => { return { notes: new Set<number>(), channelTypes: new Set([NoteSet.Active]) } as NoteChannel });
const updateNoteSetContext = React.createContext((noteSet: string[] | string, nums: Array<number>, areEnabled: boolean, overwriteExisting: boolean = false, types: Set<string> | null = null, color: string | null = null) => { });
const rawChannelContext = React.createContext({} as NoteChannels);

const octaveAgnosticNoteSets = new Set<string>([NoteSet.Active, NoteSet.Emphasized, NoteSet.Highlighted]);

function NoteProvider(props: Props) {
    const [channels, setChannels] = React.useState<NoteChannels>({
        [NoteSet.Active]: { name: NoteSet.Active, channelTypes: new Set([NoteSet.Active]), notes: new Set<number>([0, 2, 3, 5, 7, 9, 10]) },
        [NoteSet.Emphasized]: { name: NoteSet.Emphasized, channelTypes: new Set([NoteSet.Emphasized]), notes: new Set<number>([]), color: "red" },
        [NoteSet.Highlighted]: { name: NoteSet.Highlighted, channelTypes: new Set([NoteSet.Highlighted]), notes: new Set<number>([]) },
        [NoteSet.Emphasized_OctaveGnostic]: { name: NoteSet.Emphasized_OctaveGnostic, channelTypes: new Set([NoteSet.Emphasized_OctaveGnostic]), notes: new Set<number>([]), color: "red" },
        [NoteSet.PlayingInput]: { name: NoteSet.PlayingInput, channelTypes: new Set([NoteSet.PlayingInput]), notes: new Set<number>([]) },
    });
    console.log("channels", channels);
    const [homeNoteRaw, setHomeNoteRaw] = React.useState<number | null>(10);
    const homeNote = React.useMemo(() => homeNoteRaw !== null && channels[NoteSet.Active].notes.has(homeNoteRaw) ? homeNoteRaw : null, [homeNoteRaw, channels]);
    const setHomeNote = React.useCallback((note: number | null) => {
        // if (noteSets[NoteSet.Active].has(note)) {
        setHomeNoteRaw(note === null ? null : normalizeToSingleOctave(note));
        // }
    }, []);

    // Clear home note if no longer active
    React.useEffect(() => {
        if (homeNoteRaw !== null && !channels[NoteSet.Active].notes.has(homeNoteRaw)) {
            setHomeNoteRaw(null);
        }
    }, [homeNote, homeNoteRaw, channels]);

    const getNoteSet = React.useCallback((noteSet: string, normalizeToOneOctave?: boolean) => {
        if (normalizeToOneOctave) {
            return { ...channels[noteSet], notes: new Set(Array.from(channels[String(noteSet)].notes).map(elem => normalizeToSingleOctave(elem))) };
        }
        return channels[noteSet];
        // return new Set(Array.from(noteSets[noteSet]).map(elem => {
        //     return ((12 * 12) + elem) % 12;
        // }));
    }, [channels]);

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
        },
        []
    );


    // For adding new shapes
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
        <noteSetContext.Provider value={getNoteSet}>
            <updateNoteSetContext.Provider value={setNoteSet}>
                <homeNoteContext.Provider value={homeNote}>
                    <setHomeNoteContext.Provider value={setHomeNote}>
                        <rawChannelContext.Provider value={channels}>
                            {props.children}
                        </rawChannelContext.Provider>
                    </setHomeNoteContext.Provider>
                </homeNoteContext.Provider>
            </updateNoteSetContext.Provider>
        </noteSetContext.Provider>
    );
}

export function useNoteSet() {
    return React.useContext(noteSetContext);
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

export function normalizeToSingleOctave(i: number) {
    return ((12 * 12) + i) % 12;
}

// TODO we can get rid of this function
export function useGetCombinedModdedEmphasis() {
    const getNoteSet = useNoteSet();
    return React.useCallback(() => {
        const emphasized = getNoteSet(NoteSet.Emphasized);
        const emphasizedOctaveGnosticChannels = getNoteSet(NoteSet.Emphasized_OctaveGnostic);

        const emphasizedOctaveGnostic = new Set(Array.from(emphasizedOctaveGnosticChannels.notes).map(elem => {
            return normalizeToSingleOctave(elem);
        }));

        //There has gotta be a better way to union two sets
        return new Set(Array.from(emphasizedOctaveGnostic).concat(Array.from(emphasized.notes)));
    }, [getNoteSet]);
}

export function useCheckNoteEmphasis() {
    const getNoteSet = useNoteSet();
    return React.useCallback((note: number, octaveGnostic: boolean) => {
        const emphasized = getNoteSet(NoteSet.Emphasized).notes;
        var emphasizedOctaveGnostic = getNoteSet(NoteSet.Emphasized_OctaveGnostic).notes;

        if (!octaveGnostic) {
            emphasizedOctaveGnostic = new Set(Array.from(emphasizedOctaveGnostic).map(elem => {
                return normalizeToSingleOctave(elem);
            }));
            return emphasized.has(note) || emphasizedOctaveGnostic.has(note);
        }

        return emphasizedOctaveGnostic.has(note) || emphasized.has(normalizeToSingleOctave(note));
    }, [getNoteSet]);
}

export function useNotesOfType(...types: string[]) {
    const channels = React.useContext(rawChannelContext);
    return React.useMemo(() => {
        return Object.keys(channels).filter(name => Array.from(channels[name].channelTypes).some(typeInChannel => types.includes(typeInChannel))).reduce((obj, key) => { channels[key].notes.forEach(note => obj.push([channels[key], note])); return obj; }, [] as Array<[NoteChannel, number]>);
    }, [channels, types]);
}

// export function useNotesOfType(noteSet: string) {
//     const channels = React.useContext(rawChannelContext);
//     return React.useMemo(() => {
//         return Object.keys(channels).filter(name => channels[name].channelTypes.has(noteSet)).reduce((obj, key) => { channels[key].notes.forEach(note => obj.push([channels[key], note])); return obj; }, [] as Array<[NoteChannel, number]>);
//     }, [channels, noteSet]);
// }

// function defaultChannelColor

export function useChannelDisplays() {
    const channels = React.useContext(rawChannelContext);
    return React.useMemo(() => {
        return Object.keys(channels)
            .filter(name => channels[name].notes.size > 0 && channels[name].color)
            .reduce((obj, key) => { obj.push(channels[key]); return obj; }, [] as NoteChannel[]);
    }, [channels]);
}

export default NoteProvider;
