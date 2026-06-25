export default function QuizSidebarNavigator({ total, currentIndex, statuses, onNavigate }) {
  const getStatusStyle = (status, idx) => {
    if (idx === currentIndex) return { border: '2px solid #2563eb', backgroundColor: '#eff6ff' };
    if (status === 'answered') return { backgroundColor: '#dcfce7', color: 'green', border: '1px solid green' };
    if (status === 'flagged') return { backgroundColor: '#fef3c7', color: '#d97706', border: '1px solid #d97706' };
    if (status === 'skipped') return { backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626' };
    return { backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' };
  };

  return (
    <div style={{ width: '300px', borderLeft: '1px solid #ddd', padding: '20px', overflowY: 'auto' }}>
      <h4>PROGRESS</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '15px' }}>
        {Array.from({ length: total }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            style={{
              padding: '10px 0',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              ...getStatusStyle(statuses[idx], idx)
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}