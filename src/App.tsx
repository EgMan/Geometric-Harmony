import React from 'react';
import './App.css';
import SoundEngine from './sound/SoundEngine';
import NoteProvider from './sound/NoteProvider';
import ViewManager from './view/ViewManager';
import SettingsProvider from './view/SettingsProvider';
import { SnackbarProvider } from 'notistack';
import ThemeManager from './view/ThemeManager';
import HTMLOverlayProvider from './view/HTMLOverlayProvider';
import { emitSnackbar, isMobile } from './utils/Utils';
function App() {
  const [windowWidth, setWindowWidth] = React.useState(window.innerWidth)
  const [windowHeight, setWindowHeight] = React.useState(window.innerHeight)
  const setWindowDimensions = () => {
    setWindowWidth(window.innerWidth)
    setWindowHeight(window.innerHeight)
  }
  React.useEffect(() => {
    window.addEventListener('scroll', () => {
      console.log('scrolled!');
    });
    window.addEventListener('resize', setWindowDimensions);
    if (isMobile()) {
      emitSnackbar("Looks like you're on mobile!\nThis app was designed for desktop,\nthough many (not all) thangs should still work here.\n\nNote: you may need to un-silence your phone to hear in-browser synth.", 10000, "info", false, true);
    }
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
