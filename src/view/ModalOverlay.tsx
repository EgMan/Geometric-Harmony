import React from "react";
import { Layer, Stage } from "react-konva";
import { Html } from "react-konva-utils";
import { ThemeProvider, createTheme } from "@mui/material";
import { green, purple } from "@mui/material/colors";
import { useSpring as useSpring_web, animated as animated_web } from "@react-spring/web";

const theme = createTheme({
    palette: {
        primary: {
            main: green["A700"],
            light: purple[300],
            dark: purple[900],
        },
    }
});

type Props = {
    isVisible: boolean,
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
    htmlContent?: JSX.Element,
    canvasContent?: JSX.Element,
}

function ModalOverlay(props: Props) {
    const overlayProps = useSpring_web({ opacity: props.isVisible ? 1 : 0 })
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
                <ThemeProvider theme={theme}>
                    <div id="click-back-div" onClick={() => props.setIsVisible(false)}>
                        <div id="overlay-content" onClick={(e) => e.stopPropagation()}>
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