import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Rect, Circle } from 'react-konva';
import Wheel from './components/Wheel';
import Piano from './components/Piano';
import { NoteProvider } from './components/NoteContext';
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
  const padding = limitingAxisSize/6;
  const wheelRadius = limitingAxisSize/2 - padding;
  const pianoOctaveCount = limitingAxisIsHeight ? 6 : 3;
  const pianoHeight = padding/2;
  const pianoWidth = (windowWidth / pianoOctaveCount)-.5;

  return (
    <div className="App">
      <header className="App-header">
        <NoteProvider>
          <Stage width={windowWidth} height={windowHeight}>
            <Layer>
              <Wheel subdivisionCount={12} radius={wheelRadius} x={windowWidth / 4} y={windowHeight / 2} isCircleOfFifths={false}/>
              <Wheel subdivisionCount={12} radius={wheelRadius} x={3*windowWidth / 4} y={windowHeight / 2} isCircleOfFifths={true}/>
              <Piano x={windowWidth / 2} y={windowHeight-1} height={pianoHeight} width={pianoWidth} octaveCount={pianoOctaveCount} />
            </Layer>
          </Stage>
        </NoteProvider>
      </header>
    </div>
  );
}

export default App;
