import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Stage, Layer, Rect, Circle } from 'react-konva';
import Note from './components/mandela/Note';
import Wheel from './components/mandela/Wheel';
function App() {
  const padding = 50;
  const wheelRadius = Math.min(window.innerWidth/2, window.innerHeight/2) - padding;
  return (
    <div className="App">
      <header className="App-header">
        <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Wheel subdivisionCount={12} radius={wheelRadius} x={window.innerWidth/2} y={window.innerHeight/2}  />
      </Layer>
    </Stage>
      </header>
    </div>
  );
}

export default App;
