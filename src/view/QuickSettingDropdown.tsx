import React from 'react';
import { animated, useSpring } from '@react-spring/konva';
import { Circle, Group } from 'react-konva';
import ModalOverlay from './ModalOverlay';

export enum QuickSettingType {
    SideBarDropdown,
    ClickWithOverlay,
}

type Props = {
    x: number
    y: number
    icon: string
}

function QuickSettingDropdown(props: Props) {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [newWidgetMenuOpen, setNewWidgetMenuOpen] = React.useState(false);
    const newWidgetMenuProps = useSpring({ opacity: newWidgetMenuOpen ? 0.75 : 0.0, width: newWidgetMenuOpen ? 100 : 100, height: newWidgetMenuOpen ? window.innerHeight : 0 });
    const buttonGroupProps = useSpring({ scaleX: newWidgetMenuOpen ? 2 : 1, scaleY: newWidgetMenuOpen ? 2 : 1, x: newWidgetMenuOpen ? 50 : props.x, y: newWidgetMenuOpen ? props.y : props.y });
    const buttonCircleProps = useSpring({ opacity: newWidgetMenuOpen ? 0 : 0.1, fill: newWidgetMenuOpen ? "black" : "white", radius: newWidgetMenuOpen ? 16 : 12, config: { duration: 450 } });
    const buttonIconProps = useSpring({ fill: newWidgetMenuOpen ? "black" : "lightgrey" });
    return <Group>
        {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
        <animated.Rect
            {...newWidgetMenuProps}
            cornerRadius={[0, 9, 9, 0]}
            fill='rgb(255,255,255)'
            // fill='#717171'
            onMouseLeave={() => setNewWidgetMenuOpen(false)}
        />
        {/* <animated.Rect {...newWidgetMenuProps} y={-15} cornerRadius={9} fill='rgb(255,255,255,0.1)' onMouseLeave={() => setNewWidgetMenuOpen(false)}></animated.Rect> */}
        {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
        < animated.Group {...buttonGroupProps}>
            <animated.Circle
                {...buttonCircleProps}
                listening={!newWidgetMenuOpen}
                onMouseEnter={() => setNewWidgetMenuOpen(true)}
                onClick={() => setIsModalOpen(true)}
            />
            <animated.Text
                {...buttonIconProps}
                bold={true}
                listening={!newWidgetMenuOpen}
                opacity={1}
                width={40}
                height={40}
                x={-20}
                y={-20}
                text={props.icon}
                fontSize={16}
                fontFamily='monospace'
                align="center"
                verticalAlign="middle" />
        </animated.Group >
        <Circle
            x={props.x}
            y={props.y}
            radius={16}
            opacity={0}
            onMouseEnter={() => setNewWidgetMenuOpen(true)}
            onClick={() => setIsModalOpen(true)}
            listening={!newWidgetMenuOpen}
        />
        <ModalOverlay
            isVisible={false}
            setIsVisible={setIsModalOpen}
            htmlContent={
                <table>
                </table>
            }
            canvasContent={
                <Group x={props.x} y={props.y}>
                    {/* <animated.Circle {...buttonCircleProps} fill={"black"}></animated.Circle> */}
                </Group>
            }
        />
    </Group>
}

export default QuickSettingDropdown;