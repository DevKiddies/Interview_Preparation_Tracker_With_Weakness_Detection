import { useState, useEffect } from 'react';
import QuizHeader from '../components/ui/QuizHeader';
import QuizQuestionCard from '../components/ui/QuizQuestionCard';
import QuizSidebarNavigator from '../components/ui/QuizSidebarNavigator';
import QuizFooterControls from '../components/ui/QuizFooterControls';

export default function QuizPage() {
  // Mock data structure representing database records
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // Stores { questionIndex: choice }
  const [statuses, setStatuses] = useState([]); // Stores 'unvisited', 'answered', 'flagged'
  const [timeLeft, setTimeLeft] = useState(5400); // 90 minutes in seconds
  const [loading, setLoading] = useState(true);

  // 1. Fetch data on page load
  useEffect(() => {
    // Simulating an API call to fetch interview questions
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      text: `What is the time complexity of finding an element in a hash map (average case) for problem #${i + 1}?`,
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      category: "Arrays",
      difficulty: "Easy"
    }));
    
    setQuestions(mockData);
    setStatuses(Array(mockData.length).fill('unvisited'));
    setLoading(false);
  }, []);

  // 2. Countdown Timer Effect with Cleanup
  useEffect(() => {
    if (loading || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup to prevent memory leaks
  }, [timeLeft, loading]);

  if (loading) return <div>Loading Assessment...</div>;

  const currentQuestion = questions[currentIndex];

  // Action Handlers
  const handleSelectOption = (option) => {
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: option }));
  };

  const handleSaveAndNext = () => {
    setStatuses(prev => {
      const updated = [...prev];
      updated[currentIndex] = selectedAnswers[currentIndex] ? 'answered' : 'skipped';
      return updated;
    });

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleFlag = () => {
    setStatuses(prev => {
      const updated = [...prev];
      updated[currentIndex] = 'flagged';
      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif' }}>
      <QuizHeader timeLeft={timeLeft} total={questions.length} statuses={statuses} />
      
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 3, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <QuizQuestionCard 
            question={currentQuestion} 
            index={currentIndex} 
            selectedOption={selectedAnswers[currentIndex]} 
            onSelect={handleSelectOption} 
          />
          <QuizFooterControls 
            onPrev={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            onFlag={handleFlag}
            onSaveNext={handleSaveAndNext}
            isFirst={currentIndex === 0}
            isLast={currentIndex === questions.length - 1}
          />
        </div>
        
        <QuizSidebarNavigator 
          total={questions.length} 
          currentIndex={currentIndex} 
          statuses={statuses} 
          onNavigate={(idx) => setCurrentIndex(idx)} 
        />
      </div>
    </div>
  );
}