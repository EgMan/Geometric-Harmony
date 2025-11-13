import { Theme, ThemeProvider, createTheme } from '@mui/material';
import React, { createContext } from 'react';
import { blendColors } from '../utils/Utils';

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
    UI_Accent: string,

    Interval_Semitone: string,
    Interval_Wholetone: string,
    Interval_MinorThird: string,
    Interval_MajorThird: string,
    Interval_PerfectFourth: string,
    Interval_Tritone: string,

    Widget_Primary: string,
    // Should be Widget_Primary with slight mix of Main_Background
    Widget_MutedPrimary: string,

    Note_Active: string,
    Note_Home: string,
};

export type AppTheme = {
    muiTheme: Theme,
    colorPalette: ColorPalette,
};

export const ThemeContext = createContext<AppTheme | null>(null);
export const ChangeColorPaletteContext = createContext<React.Dispatch<React.SetStateAction<ColorPalette>> | null>(null);

function ThemeManager(props: Props) {
    const [colorPalette, setColorPalette] = React.useState<ColorPalette>(
        // Theme_WhiteOnBlack
        Theme_Classic
        // Theme_BlackOnWhite
    );

    const MUITheme: Theme = React.useMemo(() => {
        return createTheme(
            {
                palette: {
                    primary: {
                        main: colorPalette.UI_Accent,
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
                                transition: 'color 1.618s ease',
                            },
                        },
                    },
                    MuiTooltip: {
                        styleOverrides: {
                            tooltip: {
                                fontFamily: "monospace",
                                color: colorPalette.UI_Primary,
                                backgroundColor: colorPalette.UI_Background,
                                backdropFilter: 'blur(13px)',
                                transition: 'color 1.618s ease',
                            },
                            arrow: {
                                color: colorPalette.UI_Background,
                                transition: 'color 1.618s ease',
                                // backgroundColor: colorPalette.UI_Background,
                            }
                        }
                    }
                },
            }
        );
    }, [colorPalette.UI_Accent, colorPalette.UI_Background, colorPalette.UI_Primary]);

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
                <ThemeProvider theme={MUITheme}>
                    {props.children}
                </ThemeProvider>
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

const Theme_Classic: ColorPalette =
{
    Main_Background: "#373737",
    UI_Primary: "white",
    UI_Background: "rgba(255, 255, 255, 0.04)",
    UI_Accent: "rgb(255, 238, 88)",
    Widget_Primary: "rgb(128,128,128)",
    Widget_MutedPrimary: blendColors(["rgb(128,128,128)", "#373737", "#373737"])!,

    // Widget_MutedPrimary: "rgb(128,128,128)",

    Interval_Semitone: "violet",
    Interval_Wholetone: "rgb(100, 61, 255)",
    Interval_MinorThird: "blue",
    Interval_MajorThird: "green",
    Interval_PerfectFourth: "orange",
    Interval_Tritone: "red",

    Note_Active: "white",
    Note_Home: "yellow",
}

const Theme_BlackOnWhite: ColorPalette =
{
    Main_Background: "rgb(243, 238, 212)",
    UI_Primary: "black",
    // UI_MutedPrimary: "rgb(128, 128, 128)",
    UI_Background: "rgba(0, 0, 0, 0.04)",
    UI_Accent: "rgb(255, 238, 88)",
    Widget_Primary: "rgb(24, 20, 0)",
    Widget_MutedPrimary: blendColors(["white", "black"])!,

    Interval_Semitone: "black",
    Interval_Wholetone: "black",
    Interval_MinorThird: "black",
    Interval_MajorThird: "black",
    Interval_PerfectFourth: "black",
    Interval_Tritone: "black",
    Note_Active: "black",
    Note_Home: "lightgreen",
}

const Theme_WhiteOnBlack: ColorPalette =
{
    Main_Background: "black",
    UI_Primary: "white",
    UI_Background: "rgba(255, 255, 255, 0.1)",
    UI_Accent: "rgb(255, 238, 88)",
    Widget_Primary: "rgb(128, 128, 128)",
    Widget_MutedPrimary: blendColors(["rgb(128, 128, 128)", "black"])!,

    // Interval_Semitone: "white",
    // Interval_Wholetone: "white",
    // Interval_MinorThird: "white",
    // Interval_MajorThird: "white",
    // Interval_PerfectFourth: "white",
    // Interval_Tritone: "white",
    Interval_Semitone: "violet",
    Interval_Wholetone: "rgb(100, 61, 255)",
    Interval_MinorThird: "blue",
    Interval_MajorThird: "green",
    Interval_PerfectFourth: "orange",
    Interval_Tritone: "red",

    Note_Active: "white",
    Note_Home: "yellow",
}

export enum ColorTheme {
    Classic = "Classic",
    Light = "Light",
    Dark = "Dark",
    Random = "I'm feeling lucky",
}

export function useSetAppTheme(theme: ColorTheme) {
    const changeApptheme = useChangeAppTheme()!
    return React.useCallback(() => {
        switch (theme) {
            case ColorTheme.Classic:
                changeApptheme(Theme_Classic);
                break;
            case ColorTheme.Light:
                changeApptheme(Theme_WhiteOnBlack);
                break;
            case ColorTheme.Dark:
                changeApptheme(Theme_BlackOnWhite);
                break;
            case ColorTheme.Random:
                changeApptheme(Theme_Classic);
                break;
            default:
                break;
        }
    }, [changeApptheme, theme]);
}
