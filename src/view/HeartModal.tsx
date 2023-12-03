import React from 'react';
import ModalOverlay from './ModalOverlay';

type Props = {
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
};

function HeartModal(props: Props) {

    return <ModalOverlay
        isVisible={props.isOpen}
        setIsVisible={props.setIsOpen}
        htmlContent={
            <div id='heart-message-div'>
                <div style={{ textAlign: 'center' }}>
                    A message from the developer:
                </div>
                <br /><br />
                Thank you for using my passion project 🙂 <br />
                <br />
                I'd like to keep supporting GeoSynth with bugfixes and new features for a long time.<br />
                If you enjoy it, please consider supporting me by either donating to my <a href="https://egman.github.io/Geometric-Harmony">Patreon</a> or by sponsoring me on Github.<br />
                <br />
                Notice a bug or have ideas for improvement? Please file an issue on <a href="https://egman.github.io/Geometric-Harmony">Github</a>.<br />
                <br />
                Have a question or want to share something with me and the community?  Join the <a href="https://egman.github.io/Geometric-Harmony">Discord</a>!
                <br /><br />
                Thank you,<br />
                Antonio Woods
            </div>
        }
    />
}

export default HeartModal;