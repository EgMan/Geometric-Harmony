import React from "react";
import { WebMidi } from "webmidi";
import { BrowserType, useBrowserVersion } from "../utils/Utils";
import { normalizeToSingleOctave } from "./NoteProvider";

export function useConnectToMidi(onReady: () => void) {
    const browserType = useBrowserVersion();
    React.useEffect(() => {
        switch (browserType) {
            case BrowserType.Chrome:
            case BrowserType.Opera:
            case BrowserType.Edge:
            case BrowserType.Unknown:
                WebMidi
                    .enable()
                    .then(onEnabled)
                    .catch(err => alert(err));
            break;
        }

        function onEnabled() {
            // Inputs
            WebMidi.inputs.forEach(input => console.log("Midi input found: ", input.manufacturer, input.name));

            // Outputs
            WebMidi.outputs.forEach(output => console.log("Midi output found: ", output.manufacturer, output.name));

            onReady();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [browserType]);
}
export function midiNoteToProgramNote (midiNote: number, octaveNumber: number){
        return normalizeToSingleOctave(midiNote) + (12 * (octaveNumber - 3))
}