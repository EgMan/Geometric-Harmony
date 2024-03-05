import React from "react";
import { LocalSynthVoice } from "../sound/SynthVoicings";
import { Tooltip } from "@mui/material";
type Props = {
    children: JSX.Element
}

type HTMLOverlayElems = {
    mouseTooltip: String,
    setMouseTooltip: React.Dispatch<React.SetStateAction<string>>,
}

const overlayContext = React.createContext<HTMLOverlayElems | null>(null);

function HTMLOverlayProvider(props: Props) {
    const [mouseTooltip, setMouseTooltip] = React.useState("");

    const overlayElems = React.useMemo(() => ({
        mouseTooltip,
        setMouseTooltip,
    }), [mouseTooltip]);

    return (
        <overlayContext.Provider value={overlayElems}>
            <Tooltip title={mouseTooltip} open={Boolean(mouseTooltip)} placement="top" followCursor
                PopperProps={{
                    modifiers: [
                        {
                            name: "offset",
                            options: {
                                offset: [0, 16],
                            },
                        },
                    ],
                }}
            >
                {/* {props.children} */}
                <div>
                    {props.children}
                </div>
            </Tooltip>
        </overlayContext.Provider>
    );
}

export function useHTMLOverlay() {
    return React.useContext(overlayContext);
}

export default HTMLOverlayProvider;
