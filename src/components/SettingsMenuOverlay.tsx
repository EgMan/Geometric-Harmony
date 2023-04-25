
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
    return (
        <Group x={-props.fromWidget.containerPosition.x} y={-props.fromWidget.containerPosition.y}>
            <ModalOverlay
                isVisible={props.fromWidget.isOverlayVisible}
                setIsVisible={props.fromWidget.setIsOverlayVisible}
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
                    props.fromWidget.isOverlayVisible ? (<Group x={props.fromWidget.position.x} y={props.fromWidget.position.y}>
                        {props.children}
                    </Group>) : undefined
                }
            />
        </Group>
    );
}

export default SettingsMenuOverlay;