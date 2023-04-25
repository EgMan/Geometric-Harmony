import React from 'react';
import './App.css';
import SoundEngine from './components/SoundEngine';
import NoteProvider from './components/NoteProvider';
import useSoundEngine from './components/SoundEngine';
import ViewManager from './components/ViewManager';
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
        <NoteProvider>
          <div>
            <ViewManager width={windowWidth} height={windowHeight} />
            <SoundEngine />
          </div>
        </NoteProvider>
      </header>
    </div>
  );
}

export default App;
