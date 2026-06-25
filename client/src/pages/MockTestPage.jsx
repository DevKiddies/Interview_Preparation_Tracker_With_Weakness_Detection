// src/pages/MockTestPage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // 1. Import useNavigate
import QuizHeader from "../components/ui/QuizHeader";
import QuizQuestionCard from "../components/ui/QuizQuestionCard";
import QuizSidebarNavigator from "../components/ui/QuizSidebarNavigator";
import QuizFooterControls from "../components/ui/QuizFooterControls";

export default function MockTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate(); // 2. Initialize the navigation control hook

  const [questions] = useState(()=>
      Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      text: `[Test #${testId}] What is the time complexity of finding an element in a hash map (average case) for problem #${i + 1}?`,
      options: ["O(1)", "O(n)", "O(log n)", "O(n²)"],
      category: "Arrays",
      difficulty: "Easy",
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [statuses, setStatuses] = useState([]);
  const [timeLeft, setTimeLeft] = useState(5400);
  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          navigate("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000)
    return () => clearInterval(timerId);
  }, [navigate]);

  const currentQuestion = questions[currentIndex];
  const isCurrentFlagged = statuses[currentIndex] === "flagged";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      {/* 3. Pass the redirect action function down to header */}
      <QuizHeader
        timeLeft={timeLeft}
        total={questions.length}
        statuses={statuses}
        testId={testId}
        onFinish={() => {
          if (
            window.confirm(
              "Are you sure you want to complete and submit this assessment?",
            )
          ) {
            navigate("/dashboard");
          }
        }}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div
          style={{
            flex: 3,
            display: "flex",
            flexDirection: "column",
            padding: "20px",
            overflowY: "auto",
          }}
        >
          <QuizQuestionCard
            question={currentQuestion}
            index={currentIndex}
            selectedOption={selectedAnswers[currentIndex]}
            onSelect={(opt) =>
              setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: opt }))
            }
          />
          <QuizFooterControls
            onPrev={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            onFlag={() =>
              setStatuses((prev) => {
                const u = [...prev];
                u[currentIndex] =
                  u[currentIndex] === "flagged" ? "unvisited" : "flagged";
                return u;
              })
            }
            /* CHOOSE ONE OF THE UPDATED ON-SAVE-NEXT OPTIONS BELOW */
            onSaveNext={() => {
              setStatuses((prev) => {
                const u = [...prev];

                if (selectedAnswers[currentIndex]) {
                  // If they chose an answer, it's officially answered
                  u[currentIndex] = "answered";
                } else if (u[currentIndex] === "flagged") {
                  // If no answer but it was already flagged, KEEP IT FLAGGED!
                  u[currentIndex] = "flagged";
                } else {
                  // Otherwise, it counts as skipped/unanswered
                  u[currentIndex] = "skipped";
                }

                return u;
              });

              // Automatically advance to the next item
              if (currentIndex < questions.length - 1) {
                setCurrentIndex((prev) => prev + 1);
              }
            }}
            isFirst={currentIndex === 0}
            isLast={currentIndex === questions.length - 1}
            isFlagged={isCurrentFlagged}
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
