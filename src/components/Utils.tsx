export const getIntervalColor = (distance: number) => {
    switch (distance) {
        case 1:
            return "violet"
        case 2:
            return "rgb(112, 0, 195)"
        case 3:
            return "blue"
        case 4:
            return "green"
        case 5:
            return "orange"
        case 6:
            return "red"
        default:
            return "white"
    }
}

export const getIntervalDistance = (loc1: number, loc2: number, subdivisionCount: number) => {
    const dist1 = Math.abs(loc1 - loc2);
    // const dist2 = (props.subdivisionCount-loc1 +loc2) % (Math.ceil(props.subdivisionCount/2));
    const dist2 = (subdivisionCount - Math.max(loc1, loc2) + Math.min(loc1, loc2));
    return Math.min(dist1, dist2);
}