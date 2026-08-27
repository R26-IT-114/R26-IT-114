import React from 'react';
import dinosaurScene from '../../../assets/images/dysgraphia/dinosaurs/dinosaur-calm-background.png';

const WordGameDinosaurBackground = () => (
  <div className="word-dino-background" aria-hidden="true">
    <img className="word-dino-scene" src={dinosaurScene} alt="" />
    <div className="word-dino-overlay" />
  </div>
);

export default WordGameDinosaurBackground;
