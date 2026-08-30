import { createPortal } from 'react-dom';

import crab from '../../../assets/images/dyscalculiaimages/dashboard-animals/crab-shell.png';
import dolphin from '../../../assets/images/dyscalculiaimages/dashboard-animals/dolphin-jump.png';
import jellyfish from '../../../assets/images/dyscalculiaimages/dashboard-animals/jellyfish-glow.png';
import octopus from '../../../assets/images/dyscalculiaimages/dashboard-animals/octopus-star.png';
import pufferfish from '../../../assets/images/dyscalculiaimages/dashboard-animals/pufferfish-graduate.png';
import seal from '../../../assets/images/dyscalculiaimages/dashboard-animals/seal-ball.png';
import seahorse from '../../../assets/images/dyscalculiaimages/dashboard-animals/seahorse-pearl.png';
import turtle from '../../../assets/images/dyscalculiaimages/dashboard-animals/turtle-star.png';
import whale from '../../../assets/images/dyscalculiaimages/dashboard-animals/whale-splash.png';
import '../styles/ocean-animal-friends.css';

const FRIENDS = {
  tracing: [turtle, pufferfish, seahorse],
  listening: [whale, dolphin, seal],
  sorting: [pufferfish, octopus, seahorse],
  balloon: [seal, crab, dolphin],
  symbols: [crab, octopus, turtle],
  matching: [octopus, whale, jellyfish],
};

const OceanAnimalFriends = ({ scene = 'tracing' }) => {
  const animals = FRIENDS[scene] || FRIENDS.tracing;
  const decoration = (
    <div className={`ocean-friends ocean-friends--${scene}`} aria-hidden="true">
      {animals.map((src, index) => <span className={`ocean-friend ocean-friend--${index + 1}`} key={src}><img src={src} alt="" /><i>✨</i></span>)}
    </div>
  );
  return typeof document === 'undefined' ? decoration : createPortal(decoration, document.body);
};

export default OceanAnimalFriends;
