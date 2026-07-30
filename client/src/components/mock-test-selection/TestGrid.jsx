import TestCard from "./TestCard";

function TestGrid({ tests }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {tests.map((test) => (
                <TestCard key={test.id} test={test} />
            ))}
        </div>
    );
}

export default TestGrid;
