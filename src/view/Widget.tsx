import React from "react";
import { Circle, Group, Text } from "react-konva";
import { animated, useSpring, useTransition } from '@react-spring/konva';
import { createTheme } from "@mui/material";
import { green, purple } from "@mui/material/colors";
import { Vector2d } from "konva/lib/types";

export type WidgetComponentProps = {
    fromWidget: {
        isOverlayVisible: boolean;
        setIsOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
        position: Vector2d;
        containerPosition: Vector2d;
    }
}

type WidgetProps<TElem extends React.ElementType> = {
    of?: TElem;
    children?: React.ReactNode;
    initialPosition: Vector2d;
    contextMenuOffset: Vector2d;
} & Omit<React.ComponentPropsWithoutRef<TElem>, keyof WidgetComponentProps>;

function Widget<TElem extends React.ElementType>({ of, children, initialPosition, contextMenuOffset, ...otherProps }: WidgetProps<TElem>) {
    // const test = <Component {...otherProps}></Component>
    const Component = of || Group;

    const [draggedX, setDraggedX] = React.useState(0);
    const [draggedY, setDraggedY] = React.useState(0);

    const [contextMenuOpen, setContextMenuUpen] = React.useState(false);
    const contextMenuProps = useSpring({ opacity: contextMenuOpen ? 0.1 : 0, radius: contextMenuOpen ? 15 : 10 });

    const [isSettingsOverlayVisible, setIsSettingsOverlayVisible] = React.useState(false);

    const mainGroupTransition = useTransition(true, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
        config: { duration: 750 }
    });

    const theme = createTheme({
        palette: {
            primary: {
                main: green["A700"],
                light: purple[300],
                dark: purple[900],
            },
        }
    });

    const fromWidget = {
        isOverlayVisible: isSettingsOverlayVisible,
        setIsOverlayVisible: setIsSettingsOverlayVisible,
        position: { x: initialPosition.x + draggedX, y: initialPosition.y + draggedY },
        containerPosition: { x: initialPosition.x + draggedX, y: initialPosition.y + draggedY },
    }

    return (
        <Group x={initialPosition?.x ?? 0} y={initialPosition?.y ?? 0}>
            {mainGroupTransition(
                (transitionProps, item, t) =>
                    /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                    <animated.Group x={draggedX} y={draggedY} {...transitionProps}>
                        <Component {...otherProps} fromWidget={fromWidget}>{children}</Component>
                    </animated.Group>
            )}
            <Group draggable x={contextMenuOffset?.x ?? 0} y={contextMenuOffset?.y ?? 0} onDragMove={a => { a.currentTarget.parent?.moveToTop(); setDraggedX(a.currentTarget.x() - (contextMenuOffset?.x ?? 0)); setDraggedY(a.currentTarget.y() - (contextMenuOffset?.y ?? 0)); }}>
                {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
                <animated.Circle radius={15} {...contextMenuProps} fill={"white"}></animated.Circle>
                <Circle radius={15} opacity={0} onMouseEnter={() => setContextMenuUpen(true)} onMouseLeave={() => setContextMenuUpen(false)} onTouchStart={() => setIsSettingsOverlayVisible(true)} onClick={() => setIsSettingsOverlayVisible(true)} onContextMenu={(e) => { setIsSettingsOverlayVisible(true); e.currentTarget.preventDefault() }}></Circle>
                <Text
                    bold={true}
                    listening={false}
                    opacity={1}
                    width={40}
                    height={40}
                    x={-20}
                    y={-23}
                    text={'…'}
                    fill="white"
                    fontSize={16}
                    fontFamily='monospace'
                    align="center"
                    verticalAlign="middle" />
            </Group>
        </Group>
    )
}

export default Widget;