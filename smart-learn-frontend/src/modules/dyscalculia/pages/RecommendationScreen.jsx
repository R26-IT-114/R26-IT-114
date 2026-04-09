import { useNavigate } from 'react-router-dom';
import { useDyscalculiaFlow } from '../context/DyscalculiaFlowContext';
import '../styles/dyscalculia.css';

const RecommendationScreen = () => {
  const navigate = useNavigate();
  const { recommendations, assessmentResult } = useDyscalculiaFlow();

  if (!assessmentResult) {
    return (
      <main className='dys-shell'>
        <section className='dys-card'>
          <h2 className='dys-title'>Take assessment first</h2>
          <button
            type='button'
            className='dys-btn dys-btn-primary'
            onClick={() => navigate('/dyscalculia/assessment')}
          >
            Go to Assessment
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className='dys-shell'>
      <section className='dys-card'>
        <p className='dys-chip'>Adaptive Recommendations</p>
        <h2 className='dys-title'>Suggested Activities</h2>

        <div className='dys-list-stack'>
          {recommendations.map((item) => (
            <article className='dys-list-item' key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <p className='dys-mini'>Skill: {item.skillType}</p>
              <p className='dys-mini'>Duration: {item.durationMinutes} min</p>
              <button
                type='button'
                className='dys-btn dys-btn-primary'
                onClick={() => navigate(`/dyscalculia/learning-game/${item.id}`)}
              >
                Start Game
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
};

export default RecommendationScreen;
