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
    const divRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            const touch = e.touches[0];
            if (!touch || !divRef.current) return;
            divRef.current.dispatchEvent(new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                bubbles: true,
            }));
        };
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        return () => document.removeEventListener('touchmove', handleTouchMove);
    }, []);

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
                <div ref={divRef}>
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
