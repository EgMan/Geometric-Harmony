import React from 'react';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import { useAppTheme } from "./ThemeManager";
import { Typography } from '@mui/material';
import { Group } from 'react-konva';

type Props = {
    charDisplay: string;
};

function CharIcon(props: Props) {
    const { colorPalette } = useAppTheme()!;

    return <div style={{ position: "relative", display: "flex" }}>

        <SquareRoundedIcon sx={{ color: colorPalette.UI_Primary }} fontSize="small">
        </SquareRoundedIcon>
        <Typography fontFamily="monospace"
            sx={{
                color: colorPalette.Main_Background,
                // color: "red",
                position: "absolute",
                // lineHeight: 1,
                top: "50%",
                left: "50%",
                // bottom: "100%",
                // transform: "translate(0%, 100%)",

                transform: "translate(-50%, -50%)",
                // left: "0",
                // right: 0,
                // marginInline: "auto",
                // width: "fit-content",

                // lineHeight: 1,
                // top: "center",
                // verticalAlign: "middle",

                // alignSelf: "center",
                // alighItems: "center",

                fontFamily: "monospace",
                fontWeight: "bold",
                // left: "0",
                // fontSize: "1em"
            }}
        >
            {props.charDisplay}
        </Typography>

        {/* <Group > */}
        {/* </Group> */}
    </div>
}

export default CharIcon;