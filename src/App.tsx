import React from 'react';
import './App.css';
import SoundEngine from './sound/SoundEngine';
import NoteProvider from './sound/NoteProvider';
import ViewManager from './view/ViewManager';
import SettingsProvider from './view/SettingsProvider';
import { SnackbarProvider } from 'notistack';
import ThemeManager from './view/ThemeManager';
import HTMLOverlayProvider from './view/HTMLOverlayProvider';
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
        <ThemeManager>
          <SettingsProvider>
            <HTMLOverlayProvider>
              <NoteProvider>
                <SoundEngine>
                  <SnackbarProvider dense={true} maxSnack={10} >
                    <ViewManager width={windowWidth} height={windowHeight} />
                  </SnackbarProvider>
                </SoundEngine>
              </NoteProvider>
            </HTMLOverlayProvider>
          </SettingsProvider>
        </ThemeManager>
      </header>
    </div>
  );
}

export default App;
