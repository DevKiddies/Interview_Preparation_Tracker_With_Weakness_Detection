import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../components/confidence/PageHeader";
import Breadcrumb from "../components/confidence/Breadcrumb";
import ConfidenceSummary from "../components/confidence/ConfidenceSummary";
import ConfidenceTable from "../components/confidence/ConfidenceTable";
import EmptyState from "../components/confidence/EmptyState";
import {
  topicConfidence,
  categoryTopics,
  topicTechniques,
} from "../data/dashboardData";

function findEntity(level, id) {
  const numId = Number(id);
  if (level === "category") return topicConfidence.find((c) => c.id === numId) || null;
  if (level === "topic") {
    for (const topics of Object.values(categoryTopics)) {
      const found = topics.find((t) => t.id === numId);
      if (found) return found;
    }
    return null;
  }
  if (level === "technique") {
    for (const techniques of Object.values(topicTechniques)) {
      const found = techniques.find((t) => t.id === numId);
      if (found) return found;
    }
    return null;
  }
  return null;
}

function findCategoryForTopic(topicId) {
  const numId = Number(topicId);
  for (const [catId, topics] of Object.entries(categoryTopics)) {
    if (topics.some((t) => t.id === numId)) return Number(catId);
  }
  return null;
}

function findTopicForTechnique(techniqueId) {
  const numId = Number(techniqueId);
  for (const [topicId, techniques] of Object.entries(topicTechniques)) {
    if (techniques.some((t) => t.id === numId)) return Number(topicId);
  }
  return null;
}

const CHILD_MAP = { category: "topic", topic: "technique", technique: null };
const CHILD_LABEL_MAP = { category: "Topics", topic: "Techniques", technique: "Details" };

export default function ConfidenceExplorerPage() {
  const { level, id } = useParams();
  const navigate = useNavigate();

  const entity = findEntity(level, id);
  const childLevel = CHILD_MAP[level];

  let children = [];
  if (level === "category") children = categoryTopics[Number(id)] || [];
  else if (level === "topic") children = topicTechniques[Number(id)] || [];

  const sortedChildren = [...children].sort((a, b) => a.confidence - b.confidence);

  let breadcrumbItems = [{ label: "Dashboard", to: "/dashboard" }];

  if (level === "category") {
    breadcrumbItems.push({ label: entity?.name || "Category" });
  } else if (level === "topic") {
    const catId = findCategoryForTopic(id);
    const catName = catId ? topicConfidence.find((c) => c.id === catId)?.name : null;
    if (catName) breadcrumbItems.push({ label: catName, to: `/confidence/category/${catId}` });
    breadcrumbItems.push({ label: entity?.name || "Topic" });
  } else if (level === "technique") {
    const tId = findTopicForTechnique(id);
    const tEntity = tId ? findEntity("topic", tId) : null;
    const cId = tId ? findCategoryForTopic(tId) : null;
    const cName = cId ? topicConfidence.find((c) => c.id === cId)?.name : null;
    if (cName) breadcrumbItems.push({ label: cName, to: `/confidence/category/${cId}` });
    if (tEntity) breadcrumbItems.push({ label: tEntity.name, to: `/confidence/topic/${tId}` });
    breadcrumbItems.push({ label: entity?.name || "Technique" });
  }

  const handleItemClick = (item, nextLevel) => {
    if (nextLevel) {
      navigate(`/confidence/${nextLevel}/${item.id}`);
    }
  };

  if (!entity) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
          <PageHeader />
          <div className="mt-6">
            <EmptyState />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-200 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <PageHeader />

        <div className="mt-2">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <div className="mt-4">
          <ConfidenceSummary
            title={entity.name}
            confidence={entity.confidence}
            childrenCount={sortedChildren.length}
            childrenLabel={CHILD_LABEL_MAP[level] || "Items"}
            questions={entity.questions ?? entity.questionCount}
          />
        </div>

        <div className="mt-5">
          {sortedChildren.length > 0 ? (
            <ConfidenceTable
              items={sortedChildren}
              childLevel={childLevel}
              onItemClick={handleItemClick}
            />
          ) : (
            level !== "technique" && <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}
