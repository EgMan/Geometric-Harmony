import React from "react";
import { WebMidi } from "webmidi";

export function useConnectToMidi() {
    React.useEffect(() => {
        WebMidi
            .enable()
            .then(onEnabled)
            .catch(err => alert(err));

        function onEnabled() {
            // Inputs
            WebMidi.inputs.forEach(input => console.log("Midi input found: ", input.manufacturer, input.name));

            // Outputs
            WebMidi.outputs.forEach(output => console.log("Midi output found: ", output.manufacturer, output.name));
        }
    }, []);
}