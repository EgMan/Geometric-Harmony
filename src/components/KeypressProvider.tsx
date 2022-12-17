import React from "react";

const KeyPressedContext = React.createContext((key: string) => new Boolean());
const KeysPressedContext = React.createContext(new Set<string>());


type Props = {
    children: JSX.Element
}

function KeypressProvider(props:Props) {
    const [keysPressed, setKeysPressed] = React.useState(new Set<string>());

    const onKeyDown = (event: KeyboardEvent)=> {
        keysPressed.add(event.key);
        setKeysPressed(new Set(keysPressed));
        console.log(keysPressed);
    }

    const onKeyUp = (event: KeyboardEvent)=> {
        keysPressed.delete(event.key);
        setKeysPressed(new Set(keysPressed));
        console.log(keysPressed);
    }

    React.useEffect(()=>{
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return ()=>{
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        }
    }, []);

    const isKeyPressed = (key: string) =>
    {
        return keysPressed.has(key);
    }

    return (
        <KeyPressedContext.Provider value={isKeyPressed}>
            <KeysPressedContext.Provider value={keysPressed}>
                {props.children}
            </KeysPressedContext.Provider>
        </KeyPressedContext.Provider>
    );
}

export function useIsKeyPressed(){
    return React.useContext(KeyPressedContext);
}

export function useKeysPressed(){
    return React.useContext(KeysPressedContext);
}

export default KeypressProvider;