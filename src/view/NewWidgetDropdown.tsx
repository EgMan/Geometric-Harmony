import React from 'react';
import { animated, useSpring } from '@react-spring/konva';
import { Circle, Group, Text } from 'react-konva';
import { WidgetTrackerActions, WidgetType, widgetNameByType } from './ViewManager';
import { Vector2d } from 'konva/lib/types';
import Konva from 'konva';

export enum QuickSettingType {
    SideBarDropdown,
    ClickWithOverlay,
}

// const props.width = 200;

type Props = {
    x: number
    y: number
    icon: string
    width: number
    // spawnWidget: (type: WidgetType, position?: Vector2d) => string
    // killWidget: (uid: String) => boolean
    // setIsMaxamized: (uid: String, isMaxamized: boolean) => boolean,
    widgetTrackerActions: WidgetTrackerActions,
    pointerPosition: Vector2d | null,
}

function NewWidgetDropdown(props: Props) {
    const [trayWidgets, setTrayWidgets] = React.useState<String[]>([]);

    const [newWidgetMenuOpen, setNewWidgetMenuOpen] = React.useState(false);
    const newWidgetMenuProps = useSpring({ opacity: newWidgetMenuOpen ? 0.75 : 0.0, width: newWidgetMenuOpen ? props.width : props.width, height: newWidgetMenuOpen ? window.innerHeight : 0 });
    const buttonGroupProps = useSpring({ scaleX: newWidgetMenuOpen ? 2 : 1, scaleY: newWidgetMenuOpen ? 2 : 1, x: newWidgetMenuOpen ? props.width / 2 : props.x, y: newWidgetMenuOpen ? props.y : props.y });
    const buttonCircleProps = useSpring({ opacity: newWidgetMenuOpen ? 0 : 0.1, fill: newWidgetMenuOpen ? "black" : "white", radius: newWidgetMenuOpen ? 16 : 12, config: { duration: 450 } });
    const buttonIconProps = useSpring({ fill: newWidgetMenuOpen ? "black" : "lightgrey" });
    const textProps = useSpring({ opacity: newWidgetMenuOpen ? 1 : 0 });

    const startPosition = 75;
    const rowSpacing = 60;

    React.useEffect(() => {
        if (newWidgetMenuOpen) {
            const newUIDs =
                Object.values(WidgetType)
                    .filter(value => typeof value !== 'number')
                    .map((key, index) => {
                        const widgetType = WidgetType[key as keyof typeof WidgetType];
                        return props.widgetTrackerActions.spawnWidget(widgetType, { x: props.width / 2, y: startPosition + (rowSpacing * (index)) });
                    });
            setTrayWidgets(oldTrayWidgets => { oldTrayWidgets.push(...newUIDs); return oldTrayWidgets; });
        } else {
            trayWidgets.forEach((uid: String) => {
                const tracker = props.widgetTrackerActions.getWidgetTracker(uid)
                if (tracker == null) return;
                const positionX = (tracker?.initialPosition?.x ?? 0) + (tracker?.draggedPosition?.x ?? 0);
                if (positionX >= props.width) {
                    props.widgetTrackerActions.setWidgetTracker(uid, { ...tracker, isMaxamized: true });
                }
                else {
                    props.widgetTrackerActions.killWidget(uid);
                }
            });
            setTrayWidgets([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newWidgetMenuOpen]);

    const displayTexts =
        React.useMemo(() => {
            return Object.values(WidgetType)
                .filter(value => typeof value !== 'number')
                .map((key, index) => {
                    const widgetName = widgetNameByType(WidgetType[key as keyof typeof WidgetType]);
                    /* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */
                    return <Text
                        key={index}
                        bold={true}
                        listening={false}
                        opacity={1}
                        width={props.width}
                        height={40}
                        x={0}
                        y={startPosition + (rowSpacing * (index))}
                        text={widgetName}
                        fill={"black"}
                        fontSize={16}
                        fontFamily='monospace'
                        align="center"
                        verticalAlign="middle" />
                });

        }, [props.width]);

    React.useEffect(() => {
        if (props.pointerPosition) {
            const stage = props.pointerPosition;
            const mouseX = stage?.x ?? props.width;
            if (mouseX >= props.width) {
                setNewWidgetMenuOpen(false);
            }
        }
    }, [props.pointerPosition, props.width]);

    const dropdownRef = React.useRef<Konva.Group>(null);
    React.useEffect(() => {
        if (dropdownRef.current) {
            // dropdownRef.current.moveToBottom();
            // dropdownRef.current.parent?.moveToTop();

            // dropdownRef.current.setZIndex(ZIndices.newWidgetDropdown);
            // console.log("dropdown", dropdownRef.current.zIndex());

            // dropdownRef.current.zIndex(ZIndices.contextMenu);
            // console.log("dropdown", contextMenuRef.current);
        }
    }, [props.pointerPosition]);

    return <Group>
        {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
        <Group ref={dropdownRef}>
            <animated.Rect
                {...newWidgetMenuProps}
                cornerRadius={[0, 9, 9, 0]}
                fill='rgb(255,255,255)'
                // fill='#717171'
                onMouseLeave={(event: { target: { getStage: () => any; }; }) => {
                    const stage = event.target.getStage();
                    const pointerPosition = stage?.getPointerPosition();
                    const mouseX = pointerPosition?.x ?? props.width;
                    if (mouseX >= props.width) {
                        setNewWidgetMenuOpen(false);
                    }
                }}
            />
            <animated.Group {...textProps}>
                {displayTexts}
            </animated.Group>
        </Group>
        {/* <animated.Rect {...newWidgetMenuProps} y={-15} cornerRadius={9} fill='rgb(255,255,255,0.1)' onMouseLeave={() => setNewWidgetMenuOpen(false)}></animated.Rect> */}
        {/* @ts-ignore: https://github.com/pmndrs/react-spring/issues/1515 */}
        < animated.Group {...buttonGroupProps}>
            <animated.Circle
                {...buttonCircleProps}
                listening={!newWidgetMenuOpen}
                onMouseEnter={() => setNewWidgetMenuOpen(true)}
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
            listening={!newWidgetMenuOpen}
        />
    </Group>
}

export default NewWidgetDropdown;