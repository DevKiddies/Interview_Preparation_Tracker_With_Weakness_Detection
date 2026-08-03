// adminQuestionsData.js — categoriesData is display metadata (label/color per
// category) used by the admin weakness-analysis view. Every other export this
// file used to have (topics, techniques, companies, question seed data) has
// since been replaced by real GET calls against the admin API and was removed.

export const categoriesData = [
  { id: 1, name: "DSA",        label: "Data Structures & Algorithms", color: "blue" },
  { id: 2, name: "Algorithms", label: "Algorithms",                   color: "indigo" },
  { id: 3, name: "Database",   label: "Database",                     color: "teal" },
  { id: 4, name: "Web Tech",   label: "Web Technologies",             color: "amber" },
  { id: 5, name: "OOP",        label: "Object-Oriented Programming",  color: "purple" },
  { id: 6, name: "Aptitude",   label: "Aptitude",                     color: "emerald" },
];
