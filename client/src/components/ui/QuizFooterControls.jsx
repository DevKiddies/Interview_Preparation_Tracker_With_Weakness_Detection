// src/components/ui/QuizFooterControls.jsx
import { useState } from 'react';

export default function QuizFooterControls({ onPrev, onFlag, onSaveNext, isFirst, isLast, isFlagged }) {
  // Requirement 3: Manage mouse state triggers locally
  const [hoveredBtn, setHoveredBtn] = useState(null);

  const baseBtnStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const getPrevStyle = () => ({
    ...baseBtnStyle,
    border: '1px solid #ccc',
    backgroundColor: isFirst ? '#f3f4f6' : (hoveredBtn === 'prev' ? '#e5e7eb' : 'white'),
    color: isFirst ? '#9ca3af' : '#374151',
    cursor: isFirst ? 'not-allowed' : 'pointer'
  });

  const getFlagStyle = () => {
    // Requirement 2: Yellow hue background matching the sidebar state
    if (isFlagged) {
      return {
        ...baseBtnStyle,
        border: '1px solid #d97706',
        backgroundColor: hoveredBtn === 'flag' ? '#fde68a' : '#fef3c7', 
        color: '#d97706'
      };
    }
    return {
      ...baseBtnStyle,
      border: '1px solid #d97706',
      backgroundColor: hoveredBtn === 'flag' ? '#fef3c7' : 'transparent',
      color: '#d97706'
    };
  };

  const getSaveNextStyle = () => ({
    ...baseBtnStyle,
    border: 'none',
    backgroundColor: hoveredBtn === 'savenext' ? '#1d4ed8' : '#2563eb', // Darker blue hover tone
    color: 'white'
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: 'auto', gap: '10px' }}>
      <button 
        onClick={onPrev} 
        disabled={isFirst}
        onMouseEnter={() => setHoveredBtn('prev')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={getPrevStyle()}
      >
        ← Prev
      </button>
      
      <button 
        onClick={onFlag}
        onMouseEnter={() => setHoveredBtn('flag')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={getFlagStyle()}
      >
        {isFlagged ? '⚑ Flagged' : '⚑ Flag'}
      </button>
      
      <button 
        onClick={onSaveNext}
        onMouseEnter={() => setHoveredBtn('savenext')}
        onMouseLeave={() => setHoveredBtn(null)}
        style={getSaveNextStyle()}
      >
        {isLast ? 'Save' : 'Save & Next →'}
      </button>
    </div>
  );
}