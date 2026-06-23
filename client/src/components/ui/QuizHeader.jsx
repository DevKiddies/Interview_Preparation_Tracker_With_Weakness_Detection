// src/components/ui/QuizHeader.jsx
export default function QuizHeader({ timeLeft, total, statuses, testId, onFinish }) { // Added onFinish prop
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = statuses.filter(s => s === 'answered').length;
  const flaggedCount = statuses.filter(s => s === 'flagged').length;
  const skippedCount = statuses.filter(s => s === 'skipped').length;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', borderBottom: '1px solid #ddd', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
      <div>
        <h3 style={{ margin: 0 }}>FAANG Mock Assessment #{testId}</h3>
        <small style={{ color: '#666' }}>Software Engineer I • {total} Questions</small>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: 'green', fontWeight: '500' }}>✔ {answeredCount} Answered</span>
        <span style={{ color: '#b45309', fontWeight: '500' }}>⚑ {flaggedCount} Flagged</span>
        <span style={{ color: '#dc2626', fontWeight: '500' }}>✖ {skippedCount} Not Answered</span>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>⏱ {formatTime(timeLeft)}</span>
        
        {/* Fire the onFinish callback when clicked */}
        <button 
          onClick={onFinish} 
          style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
        >
          Finish
        </button>
      </div>
    </div>
  );
}