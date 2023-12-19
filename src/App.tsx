import React from 'react';
import './App.css';
import SoundEngine from './sound/SoundEngine';
import NoteProvider from './sound/NoteProvider';
import ViewManager from './view/ViewManager';
import SettingsProvider from './view/SettingsProvider';
import { SnackbarProvider } from 'notistack';
function App() {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth)
  const [windowHeight, setWindowHeight] = React.useState(window.innerHeight)
  const setWindowDimensions = () => {
    setWindowWidth(window.innerWidth)
    setWindowHeight(window.innerHeight)
  }
  React.useEffect(() => {
    window.addEventListener('resize', setWindowDimensions);
    return () => {
      window.removeEventListener('resize', setWindowDimensions)
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <SettingsProvider>
          <NoteProvider>
            <SoundEngine>
              <SnackbarProvider dense={true}>
                <ViewManager width={windowWidth} height={windowHeight} />
              </SnackbarProvider>
            </SoundEngine>
          </NoteProvider>
        </SettingsProvider>
      </header>
    </div>
  );
}

export default App;
