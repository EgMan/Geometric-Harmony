import React from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastRewindIcon from '@mui/icons-material/FastRewind';
import FastForwardIcon from '@mui/icons-material/FastForward';
import { useMidiTransport } from '../sound/MidiFileParser';
import { useAppTheme } from './ThemeManager';

function formatTime(ms: number): string {
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MidiTransport() {
    const transport = useMidiTransport();
    const { colorPalette } = useAppTheme()!;

    const [isDragging, setIsDragging] = React.useState(false);
    const [dragValue, setDragValue] = React.useState(0);

    const loaded = !!(transport?.fileName);
    const isPlaying = transport?.isPlaying ?? false;
    const positionMs = transport?.positionMs ?? 0;
    const durationMs = transport?.durationMs ?? 0;
    const fileName = transport?.fileName ?? 'No file loaded';
    const displayMs = isDragging ? dragValue : positionMs;

    return (
        <Box sx={{ px: 2, py: 1, minWidth: 280, opacity: loaded ? 1 : 0.4 }}>
            <Typography sx={{
                color: colorPalette.UI_Primary,
                fontFamily: 'monospace',
                fontSize: 11,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                opacity: 0.8,
                mb: 0.5,
            }}>
                {fileName}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <IconButton size="small" disabled={!loaded} onClick={() => transport?.skipBack()} sx={{ color: colorPalette.UI_Primary, p: 0.5 }}>
                    <FastRewindIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" disabled={!loaded} onClick={isPlaying ? transport?.pause : transport?.resume} sx={{ color: colorPalette.UI_Primary, p: 0.5 }}>
                    {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <IconButton size="small" disabled={!loaded} onClick={() => transport?.skipForward()} sx={{ color: colorPalette.UI_Primary, p: 0.5 }}>
                    <FastForwardIcon fontSize="small" />
                </IconButton>
                <Typography sx={{ color: colorPalette.UI_Primary, fontFamily: 'monospace', fontSize: 11, minWidth: 36, textAlign: 'right', opacity: 0.7 }}>
                    {formatTime(displayMs)}
                </Typography>
                <Typography sx={{ color: colorPalette.UI_Primary, fontFamily: 'monospace', fontSize: 11, opacity: 0.5 }}>/</Typography>
                <Typography sx={{ color: colorPalette.UI_Primary, fontFamily: 'monospace', fontSize: 11, minWidth: 36, opacity: 0.7 }}>
                    {formatTime(durationMs)}
                </Typography>
            </Box>

            <Slider
                size="small"
                disabled={!loaded}
                value={displayMs}
                min={0}
                max={durationMs || 1}
                onChange={(_e, val) => { setIsDragging(true); setDragValue(val as number); }}
                onChangeCommitted={(_e, val) => { setIsDragging(false); transport?.seekTo(val as number); }}
                sx={{
                    color: colorPalette.UI_Primary,
                    width: '100%',
                    '& .MuiSlider-thumb': { width: 12, height: 12 },
                }}
            />
        </Box>
    );
}
