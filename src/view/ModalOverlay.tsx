import React from "react";
import { Layer, Stage } from "react-konva";
import { Html } from "react-konva-utils";
import { ThemeProvider } from "@mui/material";
import { useSpring as useSpring_web, animated as animated_web } from "@react-spring/web";
import { useAppTheme } from "./ThemeManager";

type Props = {
    isVisible: boolean,
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
    htmlContent?: JSX.Element,
    canvasContent?: JSX.Element,
    panelPosition?: { left?: number, right?: number, center?: boolean },
}

function ModalOverlay(props: Props) {
    const appTheme = useAppTheme();
    const overlayProps = useSpring_web({ opacity: props.isVisible ? 1 : 0 })
    if (!appTheme) return null;
    return <Html divProps={{ id: props.isVisible ? "overlay" : "overlay-no-pointer-events" }} >
        < animated_web.div id="backdrop-blur" style={overlayProps}>
            {
                props.canvasContent &&
                <Stage width={window.innerWidth} height={window.innerHeight}>
                    <Layer>
                        {props.canvasContent}
                    </Layer>
                </Stage>
            }
            {
                props.htmlContent &&
                <ThemeProvider theme={appTheme.muiTheme}>
                    <div id="click-back-div" onClick={() => props.setIsVisible(false)}>
                        <div id="overlay-content" style={props.panelPosition?.center ? undefined : props.panelPosition ? { left: props.panelPosition.left, right: props.panelPosition.right, top: 80 } : undefined} onClick={(e) => e.stopPropagation()}>
                            {props.htmlContent}
                        </div>
                    </div>
                </ThemeProvider>
            }
        </animated_web.div>
        {/* </div> */}
    </Html >
}

export default ModalOverlay;