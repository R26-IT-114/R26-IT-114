import simpleJungleImg from '../../../assets/images/background/word-builder-simple-jungle.png';
import FireflyOverlay from './FireflyOverlay';

export default function SharedJungleGameBackground({ children }) {
  return (
    <div className="dyslexia-shared-jungle">
      <img
        src={simpleJungleImg}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="dyslexia-shared-jungle__image"
      />
      <div className="dyslexia-shared-jungle__focus" aria-hidden="true" />
      <FireflyOverlay />
      <div className="dyslexia-shared-jungle__content">{children}</div>
    </div>
  );
}
