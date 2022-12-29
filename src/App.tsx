import React from 'react';
import './App.css';
import { Stage, Layer } from 'react-konva';
import Wheel from './components/Wheel';
import Piano from './components/Piano';
import SoundEngine from './components/SoundEngine';
import NoteProvider from './components/NoteProvider';
import KeypressProvider from './components/KeypressProvider';
import HarmonyAnalyzer from './components/HarmonyAnalyzer';
import BackPlate from './components/BackPlate';
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
  }, [])

  const limitingAxisIsHeight = windowWidth > windowHeight;
  const limitingAxisSize = limitingAxisIsHeight ? windowHeight : windowWidth;
  const padding = limitingAxisSize / 6;
  const wheelRadius = limitingAxisSize / 2 - padding;
  const pianoOctaveCount = limitingAxisIsHeight ? 4 : 2;
  const pianoHeight = ((windowHeight / 2) - wheelRadius) * 2 / 3;
  const pianoWidth = (windowWidth / pianoOctaveCount) - .5;

  return (
    <div className="App">
      <header className="App-header">
        <KeypressProvider>
          <NoteProvider>
            <div>
              <Stage width={windowWidth} height={windowHeight}>
                <Layer>
                  <BackPlate width={windowWidth} height={windowHeight} />
                  <Wheel subdivisionCount={12} radius={wheelRadius} x={windowWidth / 4} y={windowHeight / 2} isCircleOfFifths={false} />
                  <Wheel subdivisionCount={12} radius={wheelRadius} x={3 * windowWidth / 4} y={windowHeight / 2} isCircleOfFifths={true} />
                  <Piano x={windowWidth / 2} y={windowHeight - 1} height={pianoHeight} width={pianoWidth} octaveCount={pianoOctaveCount} />
                  <HarmonyAnalyzer subdivisionCount={12} x={0} y={10} width={windowWidth} />
                </Layer>
              </Stage>
              <SoundEngine />
            </div>
          </NoteProvider>
        </KeypressProvider>
      </header>
    </div>
  );
}

export default App;
