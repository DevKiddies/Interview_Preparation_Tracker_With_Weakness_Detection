export default function QuizHeader({ timeLeft, total, statuses }) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = statuses.filter(s => s === 'answered').length;

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', borderBottom: '1px solid #ddd', alignItems: 'center' }}>
      <div>
        <h3 style={{ margin: 0 }}>FAANG Mock Assessment #4</h3>
        <small style={{ color: '#666' }}>Software Engineer I • {total} Questions</small>
      </div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ color: 'green' }}>✔ {answeredCount} Answered</span>
        <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>⏱ {formatTime(timeLeft)}</span>
        <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Finish</button>
      </div>
    </div>
  );
}