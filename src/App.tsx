import React from 'react';
import './App.css';
import { Stage, Layer } from 'react-konva';
import Wheel from './components/Wheel';
import Piano from './components/Piano';
import SoundEngine from './components/SoundEngine';
import NoteProvider from './components/NoteProvider';
import HarmonyAnalyzer from './components/HarmonyAnalyzer';
import BackPlate from './components/BackPlate';
import StringInstrument from './components/StringInstrument';
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

  const limitingAxisIsHeight = windowWidth > windowHeight;
  const limitingAxisSize = limitingAxisIsHeight ? windowHeight : windowWidth;
  const padding = limitingAxisSize / 5;
  const wheelRadius = limitingAxisSize / 2 - padding;
  const pianoOctaveCount = limitingAxisIsHeight ? 4 : 2;
  const pianoHeight = ((windowHeight / 2) - wheelRadius) * 2 / 3;
  const pianoWidth = (windowWidth / pianoOctaveCount) - .5;

  return (
    <div className="App">
      <header className="App-header">
        <NoteProvider>
          <div>
            <Stage width={windowWidth} height={windowHeight}
              onContextMenu={(e) => { e.evt.preventDefault() }}
            >
              <Layer>
                <BackPlate width={windowWidth} height={windowHeight} />
                <HarmonyAnalyzer subdivisionCount={12} x={windowWidth / 2} y={10} width={windowWidth} />
                <Wheel subdivisionCount={12} radius={wheelRadius} x={windowWidth / 4} y={windowHeight / 2} isCircleOfFifths={false} />
                {/* <Wheel subdivisionCount={12} radius={wheelRadius} x={3 * windowWidth / 4} y={windowHeight / 2} isCircleOfFifths={true} /> */}
                <Piano x={windowWidth / 2} y={windowHeight - 1} height={pianoHeight} width={pianoWidth} octaveCount={pianoOctaveCount} />
                <StringInstrument x={4 * windowWidth / 5} y={windowHeight / 8} height={windowHeight - 200} width={wheelRadius} fretCount={13} tuning={[4, 9, 14, 19, 23, 28]} />
              </Layer>
            </Stage>
            <SoundEngine />
          </div>
        </NoteProvider>
      </header>
    </div>
  );
}

export default App;
