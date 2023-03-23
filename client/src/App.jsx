import React from 'react';
import './App.css';
import { available } from './data';
import { useDragAndDrop } from './dragAndDrop';

const App = () => {
  const { isDragging, containerRef, dragStart } = useDragAndDrop(available);
  return (
    <>
      <div className='container' ref={containerRef}>
        {available.map((item, index) => (
          <div key={item.id} onPointerDown={(e) => dragStart(e, index)}>
            <div className={`card ${isDragging === index ? 'dragging' : ''}`}>
              {/*有點到單個item 就顯示className為dragging 顯示陰影 */}
              <div className='img-container'>
                <img src='./card.svg' alt='' />
              </div>
              <div>
                <h4>{item.subtitle}</h4>
                <h2>{item.title}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default App;
