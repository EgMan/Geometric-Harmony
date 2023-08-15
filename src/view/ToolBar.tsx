import React from "react";
import { Button, ClickAwayListener, Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Popover, Popper, ThemeProvider, Typography, colors, createTheme, makeStyles } from "@mui/material";
import ShapeNavigationTool from "./ShapeNavigationTool";
import { WidgetTrackerActions, WidgetType } from "./ViewManager";
import { Stage } from "konva/lib/Stage";

type Props =
    {
        widgetTrackerActions: WidgetTrackerActions,
        stageRef: React.RefObject<Stage>,
    }
export const toolbarTheme = createTheme({
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
                    color: "white",
                    boxShadow: 'none',
                },
            },
        },
    },
});

function ToolBar(props: Props) {
    const addButtonRef = React.useRef(null);
    const [addDropdownOpen, setAddDropdownOpen] = React.useState(false);
    const addNewWidget = React.useCallback((widgetType: WidgetType) => {
        // const pos = props.stageRef.current?.getPointerPosition() ?? undefined;
        const pos = { x: window.innerWidth / 2, y: window.innerHeight / 7 };
        props.widgetTrackerActions.spawnWidget(widgetType, pos);
        setAddDropdownOpen(false);
    }, [props.widgetTrackerActions]);
    return (
        <div>
            <div ref={addButtonRef} style={{ position: "fixed", transform: "translate(0, 0px)", zIndex: 1, width: "100vw", backgroundColor: "rgb(255,255,255,0.04)", borderBottomLeftRadius: "9px", borderBottomRightRadius: "9px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                    <Button type="submit" variant="contained"
                        sx={{
                            fontSize: "0.7em",
                            color: 'white',
                            backgroundColor: 'transparent',
                            boxShadow: 'none',
                            '&:hover': {
                                borderTopLeftRadius: '0px',
                                borderTopRightRadius: '9px',
                                borderBottomLeftRadius: '9px',
                                borderBottomRightRadius: '9px',
                                backgroundColor: 'rgb(255,255,255,0.1)',
                            },
                            "&.Mui-disabled": {
                                background: 'transparent',
                                color: "grey"
                            }
                        }}
                        onClick={() => {
                            setAddDropdownOpen(true);
                        }}
                    >+</Button>
                    {/* <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                >⚙</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.6em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                >?</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.6em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                >🎹</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                    onClick={() => {
                        setIsMuted(muted => !muted);
                    }}
                >{muted ? "🔇" : "🔊"}</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                    onClick={() => {
                    }}
                >⏯</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                    onClick={() => {
                    }}
                >⧖</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                    onClick={() => {
                    }}
                >♬</Button> */}
                </div>
                <ShapeNavigationTool width={600} subdivisionCount={12} />
                <div>
                    {/* <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.5em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                >♡</Button>
                <Button type="submit" variant="contained"
                    sx={{
                        fontSize: "0.7em",
                        color: 'white',
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                            borderRadius: '9px',
                            backgroundColor: 'rgb(255,255,255,0.1)',
                        },
                        "&.Mui-disabled": {
                            background: 'transparent',
                            color: "grey"
                        }
                    }}
                >☮</Button> */}
                </div>
            </div>
            <div style={{ width: 320, maxWidth: '100%', zIndex: 1 }}>
                <ThemeProvider theme={toolbarTheme}>
                    <Popover
                        open={addDropdownOpen}
                        onClose={() => setAddDropdownOpen(false)}
                        anchorEl={addButtonRef.current}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: -10,
                        }}
                        style={{ transform: "translate(-15px, 0px)" }}
                        role={"menu"}
                        // placement="right-end"
                        // transition
                        disablePortal
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={() => setAddDropdownOpen(false)}>
                                <MenuList
                                // open={addDropdownOpen}
                                // onClose={() => setAddDropdownOpen(false)}
                                // anchorEl={addButtonRef.current}
                                >
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Piano)}>
                                        <ListItemText>Piano</ListItemText>
                                        {/* <ListItemIcon>
                                            <PianoRoundedIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon> */}
                                        {/* <Typography variant="body2">
                                            ⌘X
                                        </Typography> */}
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Guitar)}>
                                        <ListItemText>Guitar</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Analyzer)}>
                                        <ListItemText>Anayzer</ListItemText>
                                    </MenuItem>
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Tonnetz)}>
                                        <ListItemText>Tonnetz Diagram</ListItemText>
                                    </MenuItem>
                                    {/* <MenuItem onClick={() => addNewWidget(WidgetType.Wheel)}>
                                        <ListItemText>Wheel of Fifths</ListItemText>
                                    </MenuItem> */}
                                    <MenuItem onClick={() => addNewWidget(WidgetType.Wheel)}>
                                        <ListItemText>Wheel of Semitones</ListItemText>
                                    </MenuItem>
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Popover>
                </ThemeProvider>
            </div>
        </div >
    );
}
export default ToolBar;