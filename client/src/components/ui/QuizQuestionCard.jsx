export default function QuizQuestionCard({ question, index, selectedOption, onSelect }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', marginBottom: '15px' }}>
        <div>
          <span style={{ background: '#e0e7ff', padding: '4px 8px', borderRadius: '4px', marginRight: '5px' }}>{question.category}</span>
          <span style={{ background: '#dcfce7', padding: '4px 8px', borderRadius: '4px' }}>{question.difficulty}</span>
        </div>
        <span>Q {index + 1} / 50</span>
      </div>
      
      <h2>{question.text}</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '25px' }}>
        {question.options.map((option, idx) => {
          const labels = ['A', 'B', 'C', 'D'];
          const isSelected = selectedOption === option;
          return (
            <button
              key={idx}
              onClick={() => onSelect(option)}
              style={{
                textAlign: 'left',
                padding: '16px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #2563eb' : '1px solid #ccc',
                backgroundColor: isSelected ? '#eff6ff' : 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                gap: '15px'
              }}
            >
              <strong style={{ color: isSelected ? '#2563eb' : '#666' }}>{labels[idx]}</strong>
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}