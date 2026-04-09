import { useNavigate } from 'react-router-dom';
import { useDyscalculiaFlow } from '../context/DyscalculiaFlowContext';
import '../styles/dyscalculia.css';

const ResultSummaryScreen = () => {
  const navigate = useNavigate();
  const { assessmentResult } = useDyscalculiaFlow();

  if (!assessmentResult) {
    return (
      <main className='dys-shell'>
        <section className='dys-card'>
          <h2 className='dys-title'>No Result Yet</h2>
          <button
            type='button'
            className='dys-btn dys-btn-primary'
            onClick={() => navigate('/dyscalculia/assessment')}
          >
            Start Assessment
          </button>
        </section>
      </main>
    );
  }

  const accuracyPercent = Math.round(assessmentResult.accuracy * 100);
  const avgSeconds = (assessmentResult.averageResponseTimeMs / 1000).toFixed(1);

  return (
    <main className='dys-shell'>
      <section className='dys-card'>
        <p className='dys-chip'>Result Summary</p>
        <h2 className='dys-title'>Severity: {assessmentResult.severityLevel}</h2>

        <div className='dys-metric-grid'>
          <article className='dys-metric'>
            <h4>Accuracy</h4>
            <p>{accuracyPercent}%</p>
          </article>
          <article className='dys-metric'>
            <h4>Avg Time</h4>
            <p>{avgSeconds}s</p>
          </article>
          <article className='dys-metric'>
            <h4>Correct</h4>
            <p>
              {assessmentResult.totalCorrect}/{assessmentResult.totalQuestions}
            </p>
          </article>
        </div>

        <div className='dys-list-box'>
          <h3>Weak Areas</h3>
          {assessmentResult.weakAreas.length === 0 ? (
            <p>None detected. Nice work!</p>
          ) : (
            <ul>
              {assessmentResult.weakAreas.map((area) => (
                <li key={area}>{area}</li>
              ))}
            </ul>
          )}
        </div>

        <div className='dys-actions'>
          <button
            type='button'
            className='dys-btn dys-btn-secondary'
            onClick={() => navigate('/dyscalculia/recommendation')}
          >
            View Activities
          </button>
          <button
            type='button'
            className='dys-btn dys-btn-primary'
            onClick={() => navigate('/dyscalculia/progress-dashboard')}
          >
            Progress Dashboard
          </button>
        </div>
      </section>
    </main>
  );
};

export default ResultSummaryScreen;
