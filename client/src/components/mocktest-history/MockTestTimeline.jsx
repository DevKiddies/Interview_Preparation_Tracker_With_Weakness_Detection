import MockTestCard from "./MockTestCard";

function MockTestTimeline({ tests, onViewAnalysis }) {
  if (!tests || tests.length === 0) return null;

  return (
    <div className="space-y-3">
      {tests.map((test) => (
        <MockTestCard key={test.id} test={test} onViewAnalysis={onViewAnalysis} />
      ))}
    </div>
  );
}

export default MockTestTimeline;
