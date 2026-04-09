import { useNavigate } from 'react-router-dom';
import { useDyscalculiaFlow } from '../context/DyscalculiaFlowContext';
import '../styles/dyscalculia.css';

const ProgressDashboardScreen = () => {
  const navigate = useNavigate();
  const { progressMetrics, resetModule } = useDyscalculiaFlow();

  if (!progressMetrics) {
    return (
      <main className='dys-shell'>
        <section className='dys-card'>
          <h2 className='dys-title'>No progress yet</h2>
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

  return (
    <main className='dys-shell'>
      <section className='dys-card'>
        <p className='dys-chip'>Progress Dashboard</p>
        <h2 className='dys-title'>Parent / Teacher View</h2>

        <div className='dys-metric-grid'>
          <article className='dys-metric'>
            <h4>Total Activities</h4>
            <p>{progressMetrics.completedActivities}</p>
          </article>
          <article className='dys-metric'>
            <h4>Average Accuracy</h4>
            <p>{Math.round(progressMetrics.averageAccuracy * 100)}%</p>
          </article>
          <article className='dys-metric'>
            <h4>Avg Response Time</h4>
            <p>{(progressMetrics.averageResponseTimeMs / 1000).toFixed(1)}s</p>
          </article>
        </div>

        <div className='dys-list-box'>
          <h3>Weak Skill Areas</h3>
          {progressMetrics.weakSkillAreas.length ? (
            <ul>
              {progressMetrics.weakSkillAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No weak skills detected currently.</p>
          )}
          <h3>Improvement Summary</h3>
          <p>{progressMetrics.improvementSummary}</p>
        </div>

        <div className='dys-actions'>
          <button
            type='button'
            className='dys-btn dys-btn-secondary'
            onClick={() => navigate('/dyscalculia/recommendation')}
          >
            Continue Practice
          </button>
          <button
            type='button'
            className='dys-btn dys-btn-primary'
            onClick={() => {
              resetModule();
              navigate('/dyscalculia');
            }}
          >
            Restart Module
          </button>
        </div>
      </section>
    </main>
  );
};

export default ProgressDashboardScreen;
