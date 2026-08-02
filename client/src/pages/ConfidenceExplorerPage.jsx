import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageHeader from "../components/confidence/PageHeader";
import Breadcrumb from "../components/confidence/Breadcrumb";
import ConfidenceSummary from "../components/confidence/ConfidenceSummary";
import ConfidenceTable from "../components/confidence/ConfidenceTable";
import EmptyState from "../components/confidence/EmptyState";
import API_BASE from "../utils/api";
import { getCachedDashboard, setCachedDashboard } from "../utils/dashboardCache";

const CHILD_MAP = { category: "topic", topic: "technique", technique: null };
const CHILD_LABEL_MAP = { category: "Topics", topic: "Techniques", technique: "Details" };

// Flatten the backend tree into a lookup table so any level can be resolved
// from the URL path instantly: key = `${level}:${id}`.
function indexTree(tree) {
  const index = new Map();
  if (!tree?.categories) return index;

  for (const category of tree.categories) {
    index.set(`category:${category.id}`, { node: category, trail: [] });
    for (const topic of category.children || []) {
      index.set(`topic:${topic.id}`, { node: topic, trail: [{ name: category.name, to: `/confidence/category/${category.id}` }] });
      for (const technique of topic.children || []) {
        index.set(`technique:${technique.id}`, {
          node: technique,
          trail: [
            { name: category.name, to: `/confidence/category/${category.id}` },
            { name: topic.name, to: `/confidence/topic/${topic.id}` },
          ],
        });
      }
    }
  }
  return index;
}

export default function ConfidenceExplorerPage() {
  const { level, id } = useParams();
  const navigate = useNavigate();

  const [tree, setTree] = useState(() => getCachedDashboard()?.confidenceTree ?? null);
  const [loading, setLoading] = useState(tree === null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch(`${API_BASE}/api/users/me/dashboard/confidence-tree`, {
      headers: { Authorization: `Bearer ${token}` },
    })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data) => {
          setTree(data);
          setCachedDashboard({ ...getCachedDashboard(), confidenceTree: data });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
            <PageHeader />
            <div className="mt-6 flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            </div>
          </div>
        </div>
    );
  }

  const index = indexTree(tree);
  const entry = index.get(`${level}:${id}`);
  const entity = entry?.node ?? null;
  const childLevel = CHILD_MAP[level];

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

  const children = (entity.children || []).map((c) => ({
    id: c.id,
    name: c.name,
    confidence: c.confidence,
    questions: c.questionCount,
  }));

  // Sort weakest first so the explorer immediately surfaces what needs work.
  const sortedChildren = [...children].sort((a, b) => {
    const ca = a.confidence == null ? Infinity : a.confidence;
    const cb = b.confidence == null ? Infinity : b.confidence;
    return ca - cb;
  });

  const breadcrumbItems = [
    { label: "Dashboard", to: "/dashboard" },
    ...(entry?.trail || []).map((t) => ({ label: t.name, to: t.to })),
    { label: entity.name },
  ];

  const handleItemClick = (item, nextLevel) => {
    if (nextLevel) {
      navigate(`/confidence/${nextLevel}/${item.id}`);
    }
  };

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
                questions={entity.questionCount}
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
