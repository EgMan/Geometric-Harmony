import React from 'react';
import './App.css';
import SoundEngine from './sound/SoundEngine';
import NoteProvider from './sound/NoteProvider';
import useSoundEngine from './sound/SoundEngine';
import ViewManager from './view/ViewManager';
import SettingsProvider from './view/SettingsProvider';
function App() {
  useSoundEngine();
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
            <div>
              <ViewManager width={windowWidth} height={windowHeight} />
              <SoundEngine />
            </div>
          </NoteProvider>
        </SettingsProvider>
      </header>
    </div>
  );
}

export default App;
