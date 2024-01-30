import React from "react";

const SPACES_WIDTH = 2;
const SPACES_HEIGHT = 2;

export default function gotoSpace(row: number, col: number) {
    const container = document.getElementById('stage-scroll-container');
    if (row < 0 || row >= SPACES_HEIGHT || col < 0 || col >= SPACES_WIDTH) {
        return;
    }
    console.log("gotoSpace", row, col);

    container?.scrollTo({
        top: window.innerHeight * row * 2,
        left: window.innerWidth * col * 2,
        behavior: 'smooth'
      });
}

const GOTOSPACE_RATELIMIT_TIME = 1000;
export function useGotoSpaceRateLimited() {
    const timeout = React.useRef<number | null>(null);
    const isRateLimited = React.useRef<boolean>(false);
    return React.useCallback((row: number, col: number) => {
        if (!isRateLimited.current) {
            isRateLimited.current = true;
            timeout.current = window.setTimeout(() => {
                isRateLimited.current = false;
            }, GOTOSPACE_RATELIMIT_TIME);
        gotoSpace(row, col);
        }
    }, []);
}

export function getCurrentSpace() {
    const container = document.getElementById('stage-scroll-container');
    const row = Math.round((container?.scrollTop ?? 0) / window.innerHeight);
    const col = Math.round((container?.scrollLeft ?? 0) / window.innerWidth);
    return { row, col };
}

export function realignSpaces() {
    const { row, col } = getCurrentSpace();
    gotoSpace(row, col);
}