import simpleJungleImg from '../../../assets/images/background/word-builder-simple-jungle.png';

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
      <div className="dyslexia-shared-jungle__content">{children}</div>
    </div>
  );
}
