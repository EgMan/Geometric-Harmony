import { ListItemText, MenuItem } from "@mui/material";
import React from "react";
import { WebMidi } from "webmidi";
import UsbOffIcon from '@mui/icons-material/UsbOff';
import PianoIcon from '@mui/icons-material/Piano';
import PianoOffIcon from '@mui/icons-material/PianoOff';

type Props = {};
export default function MIDIConnectionManager(props: Props) {
    const [devices, setDevices] = React.useState<string[]>([]);

    const updateDevices = React.useCallback(() => {
        // TODO disambiguate multiple devices of the same name
        const inputDevices = WebMidi.inputs.map(i => i.name);
        const outputDevices = WebMidi.outputs.map(i => i.name);
        const allDevices = Array.from(new Set(inputDevices.concat(outputDevices)));
        setDevices(allDevices);
    }, []);

    React.useEffect(() => {
        WebMidi.addListener("connected", (e) => {
            updateDevices();
        });
        WebMidi.addListener("disconnected", (e) => {
            updateDevices();
        });
        WebMidi.addListener("enabled", (e) => {
            updateDevices();
        });
        updateDevices();
    }, [updateDevices]);

    const devicesDisplay = React.useMemo(() => {
        const deviceDisplay = devices.map((device, i) => (
            <MenuItem key={i} onClick={() => { }}>
                <PianoIcon />
                <ListItemText sx={{ paddingLeft: "16px" }}>{device}</ListItemText>
            </MenuItem>
        ));
        if (WebMidi.enabled === false) {
            return <MenuItem onClick={() => WebMidi.enable().catch(a => {
                if (a.name === "SecurityError") {
                    alert("Unable to get permission to enable MIDI access.")
                }
                else {
                    alert("Unable to enable MIDI access.  \nIt's likely that Web MIDI is not supported in this browser.")
                }
            })}>
                <UsbOffIcon />
                <ListItemText sx={{ paddingLeft: "16px" }}>Enable MIDI access</ListItemText>
            </MenuItem>;
        }
        if (deviceDisplay.length === 0) {
            return <MenuItem disabled={true}>
                <PianoOffIcon />
                <ListItemText sx={{ paddingLeft: "16px" }}> No MIDI devices found</ListItemText>
            </MenuItem>;
        }
        return deviceDisplay;
    }, [devices]);
    return <div>
        {devicesDisplay}
    </div>;
};
