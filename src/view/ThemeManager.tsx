import { Theme, colors, createTheme } from '@mui/material';
import { useSpring, useTransition } from '@react-spring/web';
import React, { createContext } from 'react';

// import { ThemeProvider } from 'styled-components';
// import createTheme from "styled-components";


type Props = {
    children: React.ReactNode;
}

export type ColorPalette = {
    // Background of the app
    Main_Background: string,
    // Main color for all UI Glyphs/Icons/etc.  Should contrast with background
    UI_Primary: string,
    // Background color for window elements.
    UI_Background: string,

    Interval_Semitone: string,
    Interval_Wholetone: string,
    Interval_MinorThird: string,
    Interval_MajorThird: string,
    Interval_PerfectFourth: string,
    Interval_Tritone: string,
    Widget_Primary: string,
};

export type AppTheme = {
    muiTheme: Theme,
    colorPalette: ColorPalette,
};

export const ThemeContext = createContext<AppTheme | null>(null);
export const ChangeColorPaletteContext = createContext<React.Dispatch<React.SetStateAction<ColorPalette>> | null>(null);

function ThemeManager(props: Props) {
    const [colorPalette, setColorPalette] = React.useState<ColorPalette>(
        {
            Main_Background: "#373737",
            UI_Primary: "white",
            UI_Background: "rgba(255, 255, 255, 0.04)",
            Widget_Primary: "grey",

            Interval_Semitone: "violet",
            Interval_Wholetone: "rgb(100, 61, 255)",
            Interval_MinorThird: "blue",
            Interval_MajorThird: "green",
            Interval_PerfectFourth: "orange",
            Interval_Tritone: "red",
        }
    );

    const MUITheme: Theme = React.useMemo(() => {
        return createTheme(
            {
                palette: {
                    primary: {
                        main: colors.yellow[400],
                    },
                },
                typography: {
                    fontFamily: 'monospace',
                },
                components: {
                    MuiPaper: {
                        styleOverrides: {
                            root: {
                                backgroundColor: 'rgb(255,255,255,0.04)',
                                backdropFilter: 'blur(13px)',
                                color: colorPalette.UI_Primary,
                                boxShadow: 'none',
                            },
                        },
                    },
                },
            }
        );
    }, [colorPalette.UI_Primary]);

    const appTheme: AppTheme = React.useMemo(() => (
        {
            muiTheme: MUITheme,
            colorPalette: colorPalette,
        }
    ), [MUITheme, colorPalette]);

    React.useEffect(() => {
        document.body.style.backgroundColor = appTheme.colorPalette.Main_Background;
    }, [appTheme.colorPalette.Main_Background]);

    return (
        <ThemeContext.Provider value={appTheme}>
            <ChangeColorPaletteContext.Provider value={setColorPalette}>
                {props.children}
            </ChangeColorPaletteContext.Provider>
        </ThemeContext.Provider>
    );
};

export default ThemeManager;

export function useAppTheme() {
    return React.useContext(ThemeContext);
}

export function useChangeAppTheme() {
    return React.useContext(ChangeColorPaletteContext);
}