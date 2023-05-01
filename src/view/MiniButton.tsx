import React from "react";
import { Circle, Group, Text } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { createTheme } from "@mui/material";
import { green, purple } from "@mui/material/colors";
import { Vector2d } from "konva/lib/types";
import { WidgetType } from "./ViewManager";

type Props = {
    icon: string,
    x?: number,
    y?: number,
    disabled?: boolean,
    onHover?: () => void,
    onMouseLeave?: () => void,
    onTouchStart?: () => void,
    onClick?: () => void,
    onContextMenu?: () => void,
    iconOffset?: Vector2d,
}

function MiniButton(props: Props) {
    const [mainButtonHover, setMainButtonHover] = React.useState(false);
    const mainButtonProps = useSpring({ opacity: mainButtonHover ? 0.1 : 0, radius: mainButtonHover ? 15 : 10 });
    return (
        <Group x={props.x} y={props.y}>
            {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
            <animated.Circle {...mainButtonProps} fill={"white"}></animated.Circle>
            {(props.disabled ?? false) || <Circle
                radius={16}
                opacity={0}
                onMouseEnter={() => { props.onHover?.(); setMainButtonHover(true) }}
                onMouseLeave={() => { props.onMouseLeave?.(); setMainButtonHover(false) }}
                onTouchStart={props.onTouchStart}
                onClick={props.onClick}
                onContextMenu={(e) => { props.onContextMenu?.(); e.currentTarget.preventDefault() }} />}
            <Text
                bold={true}
                listening={false}
                opacity={1}
                width={40}
                height={40}
                x={-20 + (props.iconOffset?.x ?? 0)}
                y={-20 + (props.iconOffset?.y ?? 0)}
                text={props.icon}
                fill={(props.disabled ?? false) ? "grey" : "black"}
                fontSize={16}
                fontFamily='monospace'
                align="center"
                verticalAlign="middle" />
        </Group>
    );
}

export default MiniButton;