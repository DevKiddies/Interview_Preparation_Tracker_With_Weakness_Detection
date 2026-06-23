export default function QuizFooterControls({ onPrev, onFlag, onSaveNext, isFirst, isLast }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingGap: '15px', paddingTop: '15px', marginTop: 'auto' }}>
      <button onClick={onPrev} disabled={isFirst} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', cursor: isFirst ? 'not-allowed' : 'pointer' }}>
        ← Prev
      </button>
      
      <button onClick={onFlag} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #d97706', color: '#d97706', background: 'none', cursor: 'pointer' }}>
        ⚑ Flag
      </button>
      
      <button onClick={onSaveNext} style={{ padding: '10px 25px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}>
        {isLast ? 'Save' : 'Save & Next →'}
      </button>
    </div>
  );
}