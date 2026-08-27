import seahorse from '../assets/seahorse.png';
import rotateSeahorse from '../assets/rotate sea horse.png';
import buwalla from '../assets/buwalla.png';
import buwallaRotate from '../assets/buwallarotate.png';
import crab from '../assets/crab.png';
import crabRotate from '../assets/crabrotate.png';
import bigFish from '../assets/big fish.png';

const seaOddOneOutData = [
  {
    name: 'බුවල්ලා',
    images: [buwalla, buwalla, buwalla, buwallaRotate],
    oddIndex: 3,
  },
  {
    name: 'මුහුදු අශ්වයා',
    images: [seahorse, seahorse, seahorse, rotateSeahorse],
    oddIndex: 3,
  },
  {
    name: 'කකුළුවා',
    images: [crab, crab, crab, crabRotate],
    oddIndex: 3,
  },
  {
    name: 'ලොකු මාළුවා',
    images: [bigFish, bigFish, bigFish, bigFish],
    oddIndex: 3,
    oddTransform: 'rotate(180deg)',
  },
];

export default seaOddOneOutData;
