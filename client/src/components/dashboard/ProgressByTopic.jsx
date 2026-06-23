import ProgressBar from "../ui/ProgressBar";

export default function ProgressByTopic({ topics }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Your Progress by Topic
      </h4>
      <div className="flex flex-col gap-4">
        {topics.map((topic) => (
          <ProgressBar key={topic.topic} label={topic.topic} value={topic.value} />
        ))}
      </div>
    </div>
  );
}
