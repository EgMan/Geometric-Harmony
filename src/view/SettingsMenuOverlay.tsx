
import React from 'react';
import ModalOverlay from './ModalOverlay';
import { Group } from 'react-konva';
import { WidgetComponentProps } from './Widget';

type Props = {
    // isVisible: boolean,
    // setIsVisible: React.Dispatch<React.SetStateAction<boolean>>,
    children?: JSX.Element,
    settingsRows: JSX.Element[],
    // position: Vector2d,
    // absoluteParentPos: Vector2d,
} & WidgetComponentProps

function SettingsMenuOverlay(props: Props) {
    const minSpace = 250;
    const widgetAbsX = props.fromWidget.position.x + props.fromWidget.containerPosition.x;
    const widgetWidth = props.fromWidget.widgetSize?.width ?? 0;
    const widgetRight = widgetAbsX + widgetWidth;
    const spaceRight = window.innerWidth - widgetRight;
    const spaceLeft = widgetAbsX;

    const panelPosition = spaceRight >= minSpace
        ? { left: widgetRight + 20 }
        : spaceLeft >= minSpace
            ? { right: window.innerWidth - widgetAbsX + 20 }
            : { center: true };

    return (
        <Group
            x={-(props.fromWidget.position.x + props.fromWidget.containerPosition.x)}
            y={-(props.fromWidget.position.y + props.fromWidget.containerPosition.y)}>
            <ModalOverlay
                isVisible={props.fromWidget.isOverlayVisible}
                setIsVisible={props.fromWidget.setIsOverlayVisible}
                panelPosition={panelPosition}
                htmlContent={
                    <div>
                        <table>
                            <tbody>
                                {props.settingsRows}
                            </tbody>
                        </table>
                    </div>
                }
                canvasContent={
                    props.fromWidget.isOverlayVisible ? (<Group x={props.fromWidget.position.x + props.fromWidget.containerPosition.x} y={props.fromWidget.position.y + props.fromWidget.containerPosition.y}>
                        {props.children}
                    </Group>) : undefined
                }
            />
        </Group>
    );
}

export default SettingsMenuOverlay;