import React from "react";
import { WebMidi } from "webmidi";
import { BrowserType, emitSnackbar, useBrowserVersion } from "../utils/Utils";
import { normalizeToSingleOctave } from "./NoteProvider";
import { enqueueSnackbar } from "notistack";

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
            WebMidi.inputs.forEach(input => console.log("Midi input found: ", input.manufacturer, input.name, input.id));

            // Outputs
            WebMidi.outputs.forEach(output => {
                console.log("Midi output found: ", output.manufacturer, output.name, output.id);
                output.sendAllNotesOff();
                output.sendAllSoundOff();
            });

            WebMidi.addListener("connected", (e) => {
                emitSnackbar(`MIDI device ${e.port.name} connected`, 5000);
            });
            WebMidi.addListener("disconnected", (e) => {
                emitSnackbar(`MIDI device ${e.port.name} disconnected`, 5000);
            });

            onReady();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [browserType]);
}

export function midiNoteToProgramNote (midiNote: number, octaveNumber: number){
        return normalizeToSingleOctave(midiNote) + (12 * (octaveNumber - 3))
}

export function connectedDevices() {
    return WebMidi.inputs.map(input => input.name);
}