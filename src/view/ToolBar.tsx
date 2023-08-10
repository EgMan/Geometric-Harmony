import React from "react";
import { Button, ClickAwayListener, Divider, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Paper, Popover, Popper, ThemeProvider, Typography, colors, createTheme } from "@mui/material";
import ShapeNavigationTool from "./ShapeNavigationTool";
import PianoRoundedIcon from '@mui/icons-material/PianoRounded';

type Props =
    {
    }
export const toolbarTheme = createTheme({
    palette: {
        primary: {
            main: colors.yellow[400],
        },
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
    return (
        <div>
            <div ref={addButtonRef} style={{ position: "fixed", transform: "translate(0, 0px)", zIndex: 1, width: "100vw", backgroundColor: "rgb(255,255,255,0.04)", borderRadius: "9px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <div>
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
                        sx={{ boxShadow: 0 }}
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
                        <Paper
                            sx={{ boxShadow: 0 }}
                        >
                            <ClickAwayListener onClickAway={() => setAddDropdownOpen(false)}>
                                <MenuList
                                // open={addDropdownOpen}
                                // onClose={() => setAddDropdownOpen(false)}
                                // anchorEl={addButtonRef.current}
                                >
                                    <MenuItem>
                                        <ListItemText>Piano</ListItemText>
                                        <ListItemIcon>
                                            <PianoRoundedIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        {/* <Typography variant="body2">
                                            ⌘X
                                        </Typography> */}
                                    </MenuItem>
                                    <MenuItem>
                                        <ListItemText>Guitar</ListItemText>
                                        <ListItemIcon>
                                            <PianoRoundedIcon style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        {/* <Typography variant="body2">
                                            ⌘X
                                        </Typography> */}
                                    </MenuItem>
                                    {/* <MenuItem>
                                        <ListItemIcon>
                                            <ContentCopy style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Copy</ListItemText>
                                        <Typography variant="body2">
                                            ⌘C
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem>
                                        <ListItemIcon>
                                            <ContentPaste style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Paste</ListItemText>
                                        <Typography variant="body2">
                                            ⌘V
                                        </Typography>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem>
                                        <ListItemIcon>
                                            <Cloud style={{ color: "white" }} fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>Web Clipboard</ListItemText>
                                    </MenuItem> */}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Popover>
                </ThemeProvider>
                {/* </Paper> */}
            </div>
        </div >
    );
}
export default ToolBar;