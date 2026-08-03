// CodingProblemsPage.jsx — Practice > Coding Problems. A curated, filterable
// list of the most commonly asked interview questions, grouped by topic.
// Every card links out to the original platform (LeetCode / HackerRank /
// GeeksforGeeks) so the user solves it there, not on PrepEdge.
//
// GeeksforGeeks problem URLs carry unpredictable numeric IDs (e.g.
// /problems/kadanes-algorithm-1587115620/1) that can't be reconstructed
// reliably from a title, so GfG entries link to GfG's own site search for
// the exact title instead of a hand-typed deep link — one extra click,
// but it never 404s. LeetCode and HackerRank use direct problem links.

import { useMemo, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";

const ALL = "All";
const PLATFORMS = ["All", "LeetCode", "HackerRank", "GeeksforGeeks"];
const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const gfg = (title) => `https://www.geeksforgeeks.org/?s=${encodeURIComponent(title)}`;

const topics = [
  {
    name: "Arrays & Hashing",
    questions: [
      { title: "Two Sum", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/two-sum/" },
      { title: "Contains Duplicate", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/contains-duplicate/" },
      { title: "Valid Anagram", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/valid-anagram/" },
      { title: "Group Anagrams", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/" },
      { title: "Top K Frequent Elements", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/top-k-frequent-elements/" },
      { title: "Product of Array Except Self", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/product-of-array-except-self/" },
      { title: "Valid Sudoku", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/valid-sudoku/" },
      { title: "Encode and Decode Strings", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/encode-and-decode-strings/" },
      { title: "Longest Consecutive Sequence", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-consecutive-sequence/" },
      { title: "Two Sum II - Input Array Is Sorted", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/" },
      { title: "Maximum Subarray", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-subarray/" },
      { title: "Rotate Array", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/rotate-array/" },
      { title: "Best Time to Buy and Sell Stock II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/" },
      { title: "Majority Element", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/majority-element/" },
      { title: "Missing Number", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/missing-number/" },
      { title: "Move Zeroes", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/move-zeroes/" },
      { title: "Single Number", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/single-number/" },
      { title: "Find All Duplicates in an Array", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/find-all-duplicates-in-an-array/" },
      { title: "Subarray Sum Equals K", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/subarray-sum-equals-k/" },
      { title: "Merge Sorted Array", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/merge-sorted-array/" },
    ],
  },
  {
    name: "Two Pointers",
    questions: [
      { title: "Valid Palindrome", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/valid-palindrome/" },
      { title: "3Sum", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/3sum/" },
      { title: "Container With Most Water", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/container-with-most-water/" },
      { title: "Trapping Rain Water", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/trapping-rain-water/" },
      { title: "4Sum", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/4sum/" },
      { title: "Sort Colors", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/sort-colors/" },
      { title: "Remove Duplicates from Sorted Array", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
      { title: "Remove Element", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/remove-element/" },
    ],
  },
  {
    name: "Sliding Window",
    questions: [
      { title: "Best Time to Buy and Sell Stock", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/" },
      { title: "Longest Substring Without Repeating Characters", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
      { title: "Longest Repeating Character Replacement", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-repeating-character-replacement/" },
      { title: "Minimum Window Substring", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-window-substring/" },
      { title: "Permutation in String", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/permutation-in-string/" },
      { title: "Sliding Window Maximum", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-maximum/" },
      { title: "Fruit Into Baskets", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/fruit-into-baskets/" },
      { title: "Find All Anagrams in a String", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/" },
    ],
  },
  {
    name: "Stack",
    questions: [
      { title: "Valid Parentheses", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/valid-parentheses/" },
      { title: "Min Stack", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/min-stack/" },
      { title: "Evaluate Reverse Polish Notation", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
      { title: "Generate Parentheses", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/generate-parentheses/" },
      { title: "Daily Temperatures", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/daily-temperatures/" },
      { title: "Car Fleet", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/car-fleet/" },
      { title: "Largest Rectangle in Histogram", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" },
      { title: "Next Greater Element I", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/next-greater-element-i/" },
      { title: "Asteroid Collision", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/asteroid-collision/" },
      { title: "Decode String", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/decode-string/" },
    ],
  },
  {
    name: "Binary Search",
    questions: [
      { title: "Binary Search", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/binary-search/" },
      { title: "Search in Rotated Sorted Array", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
      { title: "Search in Rotated Sorted Array II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/" },
      { title: "Find Minimum in Rotated Sorted Array", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
      { title: "Median of Two Sorted Arrays", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
      { title: "Koko Eating Bananas", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/koko-eating-bananas/" },
      { title: "Search a 2D Matrix", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/search-a-2d-matrix/" },
      { title: "Find First and Last Position of Element in Sorted Array", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/" },
      { title: "Capacity To Ship Packages Within D Days", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/" },
    ],
  },
  {
    name: "Linked List",
    questions: [
      { title: "Reverse Linked List", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-linked-list/" },
      { title: "Merge Two Sorted Lists", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/merge-two-sorted-lists/" },
      { title: "Linked List Cycle", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/linked-list-cycle/" },
      { title: "Reorder List", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/reorder-list/" },
      { title: "Remove Nth Node From End of List", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
      { title: "Copy List with Random Pointer", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/copy-list-with-random-pointer/" },
      { title: "Add Two Numbers", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/add-two-numbers/" },
      { title: "Merge k Sorted Lists", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/merge-k-sorted-lists/" },
      { title: "Reverse Nodes in k-Group", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
      { title: "LRU Cache", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/lru-cache/" },
      { title: "Palindrome Linked List", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/palindrome-linked-list/" },
      { title: "Odd Even Linked List", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/odd-even-linked-list/" },
    ],
  },
  {
    name: "Trees",
    questions: [
      { title: "Invert Binary Tree", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/invert-binary-tree/" },
      { title: "Maximum Depth of Binary Tree", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
      { title: "Same Tree", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/same-tree/" },
      { title: "Subtree of Another Tree", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/subtree-of-another-tree/" },
      { title: "Diameter of Binary Tree", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/diameter-of-binary-tree/" },
      { title: "Balanced Binary Tree", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/balanced-binary-tree/" },
      { title: "Validate Binary Search Tree", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/validate-binary-search-tree/" },
      { title: "Binary Tree Level Order Traversal", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
      { title: "Binary Tree Right Side View", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-right-side-view/" },
      { title: "Lowest Common Ancestor of a BST", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/" },
      { title: "Lowest Common Ancestor of a Binary Tree", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
      { title: "Kth Smallest Element in a BST", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/" },
      { title: "Construct Binary Tree from Preorder and Inorder Traversal", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/" },
      { title: "Binary Tree Maximum Path Sum", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
      { title: "Serialize and Deserialize Binary Tree", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/" },
      { title: "Binary Tree Inorder Traversal", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/binary-tree-inorder-traversal/" },
      { title: "Binary Tree Zigzag Level Order Traversal", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-zigzag-level-order-traversal/" },
      { title: "Path Sum", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/path-sum/" },
      { title: "Flatten Binary Tree to Linked List", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/" },
      { title: "Symmetric Tree", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/symmetric-tree/" },
    ],
  },
  {
    name: "Tries",
    questions: [
      { title: "Implement Trie (Prefix Tree)", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/implement-trie-prefix-tree/" },
      { title: "Design Add and Search Words Data Structure", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/" },
      { title: "Word Search II", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/word-search-ii/" },
    ],
  },
  {
    name: "Heap / Priority Queue",
    questions: [
      { title: "Kth Largest Element in an Array", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
      { title: "K Closest Points to Origin", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/k-closest-points-to-origin/" },
      { title: "Task Scheduler", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/task-scheduler/" },
      { title: "Find Median from Data Stream", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/find-median-from-data-stream/" },
      { title: "Last Stone Weight", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/last-stone-weight/" },
      { title: "Kth Largest Element in a Stream", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/kth-largest-element-in-a-stream/" },
      { title: "Top K Frequent Words", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/top-k-frequent-words/" },
    ],
  },
  {
    name: "Backtracking",
    questions: [
      { title: "Subsets", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/subsets/" },
      { title: "Combination Sum", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum/" },
      { title: "Combination Sum II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum-ii/" },
      { title: "Permutations", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/permutations/" },
      { title: "Subsets II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/subsets-ii/" },
      { title: "Word Search", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/word-search/" },
      { title: "Palindrome Partitioning", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/palindrome-partitioning/" },
      { title: "Letter Combinations of a Phone Number", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/" },
      { title: "N-Queens", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/n-queens/" },
    ],
  },
  {
    name: "Graphs",
    questions: [
      { title: "Number of Islands", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/" },
      { title: "Clone Graph", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/clone-graph/" },
      { title: "Course Schedule", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule/" },
      { title: "Course Schedule II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule-ii/" },
      { title: "Pacific Atlantic Water Flow", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/pacific-atlantic-water-flow/" },
      { title: "Rotting Oranges", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/rotting-oranges/" },
      { title: "Surrounded Regions", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/surrounded-regions/" },
      { title: "Word Ladder", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/word-ladder/" },
      { title: "Graph Valid Tree", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/graph-valid-tree/" },
      { title: "Number of Connected Components in an Undirected Graph", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/" },
      { title: "Redundant Connection", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/redundant-connection/" },
      { title: "Network Delay Time", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/network-delay-time/" },
      { title: "Cheapest Flights Within K Stops", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/" },
      { title: "Is Graph Bipartite?", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/is-graph-bipartite/" },
      { title: "Flood Fill", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/flood-fill/" },
    ],
  },
  {
    name: "Advanced Graphs",
    questions: [
      { title: "Reconstruct Itinerary", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/reconstruct-itinerary/" },
      { title: "Min Cost to Connect All Points", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/min-cost-to-connect-all-points/" },
      { title: "Swim in Rising Water", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/swim-in-rising-water/" },
      { title: "Alien Dictionary", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/alien-dictionary/" },
    ],
  },
  {
    name: "1D Dynamic Programming",
    questions: [
      { title: "Climbing Stairs", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/climbing-stairs/" },
      { title: "Min Cost Climbing Stairs", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/min-cost-climbing-stairs/" },
      { title: "House Robber", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber/" },
      { title: "House Robber II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/house-robber-ii/" },
      { title: "Longest Palindromic Substring", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-palindromic-substring/" },
      { title: "Palindromic Substrings", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/palindromic-substrings/" },
      { title: "Decode Ways", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/decode-ways/" },
      { title: "Coin Change", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/" },
      { title: "Maximum Product Subarray", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/maximum-product-subarray/" },
      { title: "Word Break", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/word-break/" },
      { title: "Longest Increasing Subsequence", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
      { title: "Partition Equal Subset Sum", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/partition-equal-subset-sum/" },
      { title: "Combination Sum IV", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/combination-sum-iv/" },
      { title: "Perfect Squares", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/perfect-squares/" },
    ],
  },
  {
    name: "2D Dynamic Programming",
    questions: [
      { title: "Unique Paths", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/unique-paths/" },
      { title: "Unique Paths II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/unique-paths-ii/" },
      { title: "Longest Common Subsequence", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/longest-common-subsequence/" },
      { title: "Best Time to Buy and Sell Stock with Cooldown", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/" },
      { title: "Coin Change II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/coin-change-ii/" },
      { title: "Target Sum", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/target-sum/" },
      { title: "Interleaving String", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/interleaving-string/" },
      { title: "Longest Increasing Path in a Matrix", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/longest-increasing-path-in-a-matrix/" },
      { title: "Distinct Subsequences", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/distinct-subsequences/" },
      { title: "Edit Distance", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/edit-distance/" },
      { title: "Burst Balloons", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/burst-balloons/" },
      { title: "Regular Expression Matching", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/regular-expression-matching/" },
      { title: "Maximal Square", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/maximal-square/" },
      { title: "Minimum Path Sum", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/minimum-path-sum/" },
    ],
  },
  {
    name: "Greedy",
    questions: [
      { title: "Jump Game", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/jump-game/" },
      { title: "Jump Game II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/jump-game-ii/" },
      { title: "Gas Station", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/gas-station/" },
      { title: "Hand of Straights", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/hand-of-straights/" },
      { title: "Partition Labels", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/partition-labels/" },
      { title: "Valid Parenthesis String", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/valid-parenthesis-string/" },
    ],
  },
  {
    name: "Intervals",
    questions: [
      { title: "Insert Interval", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/insert-interval/" },
      { title: "Merge Intervals", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/merge-intervals/" },
      { title: "Non-overlapping Intervals", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/non-overlapping-intervals/" },
      { title: "Meeting Rooms II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/meeting-rooms-ii/" },
      { title: "Minimum Interval to Include Each Query", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/minimum-interval-to-include-each-query/" },
    ],
  },
  {
    name: "Math & Bit Manipulation",
    questions: [
      { title: "Single Number II", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/single-number-ii/" },
      { title: "Number of 1 Bits", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/number-of-1-bits/" },
      { title: "Counting Bits", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/counting-bits/" },
      { title: "Reverse Bits", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/reverse-bits/" },
      { title: "Sum of Two Integers", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/sum-of-two-integers/" },
      { title: "Reverse Integer", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/reverse-integer/" },
      { title: "Palindrome Number", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/palindrome-number/" },
      { title: "Plus One", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/plus-one/" },
      { title: "Power of Two", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/power-of-two/" },
      { title: "Roman to Integer", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/roman-to-integer/" },
      { title: "Integer to Roman", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/integer-to-roman/" },
      { title: "Pow(x, n)", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/powx-n/" },
    ],
  },
  {
    name: "Strings",
    questions: [
      { title: "Longest Common Prefix", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/longest-common-prefix/" },
      { title: "String to Integer (atoi)", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/string-to-integer-atoi/" },
      { title: "Find the Index of the First Occurrence in a String", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/" },
      { title: "Zigzag Conversion", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/zigzag-conversion/" },
      { title: "Multiply Strings", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/multiply-strings/" },
      { title: "Compare Version Numbers", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/compare-version-numbers/" },
      { title: "Longest Palindrome", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/longest-palindrome/" },
      { title: "Isomorphic Strings", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/isomorphic-strings/" },
      { title: "Word Pattern", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/word-pattern/" },
      { title: "Ransom Note", platform: "LeetCode", difficulty: "Easy", url: "https://leetcode.com/problems/ransom-note/" },
    ],
  },
  {
    name: "Matrix",
    questions: [
      { title: "Rotate Image", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/rotate-image/" },
      { title: "Spiral Matrix", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/spiral-matrix/" },
      { title: "Set Matrix Zeroes", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/set-matrix-zeroes/" },
      { title: "Game of Life", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/game-of-life/" },
      { title: "Diagonal Traverse", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/diagonal-traverse/" },
    ],
  },
  {
    name: "Design",
    questions: [
      { title: "LFU Cache", platform: "LeetCode", difficulty: "Hard", url: "https://leetcode.com/problems/lfu-cache/" },
      { title: "Design Twitter", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/design-twitter/" },
      { title: "Insert Delete GetRandom O(1)", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/insert-delete-getrandom-o1/" },
      { title: "Design Circular Queue", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/design-circular-queue/" },
      { title: "Design Hit Counter", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/design-hit-counter/" },
      { title: "Design Underground System", platform: "LeetCode", difficulty: "Medium", url: "https://leetcode.com/problems/design-underground-system/" },
    ],
  },
  {
    name: "HackerRank — Problem Solving Warm-ups",
    questions: [
      { title: "Simple Array Sum", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/simple-array-sum/problem" },
      { title: "Diagonal Difference", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/diagonal-difference/problem" },
      { title: "Plus Minus", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/plus-minus/problem" },
      { title: "Staircase", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/staircase/problem" },
      { title: "Mini-Max Sum", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/mini-max-sum/problem" },
      { title: "Birthday Cake Candles", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/birthday-cake-candles/problem" },
      { title: "Time Conversion", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/time-conversion/problem" },
      { title: "Grading Students", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/grading/problem" },
      { title: "Apples and Oranges", platform: "HackerRank", difficulty: "Medium", url: "https://www.hackerrank.com/challenges/apples-and-oranges/problem" },
      { title: "Sales by Match", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/sales-by-match/problem" },
      { title: "Two Strings", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/two-strings/problem" },
      { title: "Sherlock and Anagrams", platform: "HackerRank", difficulty: "Medium", url: "https://www.hackerrank.com/challenges/sherlock-and-anagrams/problem" },
      { title: "Counting Valleys", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/counting-valleys/problem" },
      { title: "Electronics Shop", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/electronics-shop/problem" },
      { title: "Cats and a Mouse", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/cats-and-a-mouse/problem" },
      { title: "Drawing Book", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/drawing-book/problem" },
      { title: "Angry Professor", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/angry-professor/problem" },
      { title: "Beautiful Days at the Movies", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/beautiful-days-at-the-movies/problem" },
    ],
  },
  {
    name: "HackerRank — Interview Preparation Kit",
    questions: [
      { title: "Sock Merchant", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/sock-merchant/problem" },
      { title: "Array Manipulation", platform: "HackerRank", difficulty: "Hard", url: "https://www.hackerrank.com/challenges/crush/problem" },
      { title: "New Year Chaos", platform: "HackerRank", difficulty: "Medium", url: "https://www.hackerrank.com/challenges/new-year-chaos/problem" },
      { title: "Minimum Swaps 2", platform: "HackerRank", difficulty: "Medium", url: "https://www.hackerrank.com/challenges/minimum-swaps-2/problem" },
      { title: "Array Left Rotation", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/ctci-array-left-rotation/problem" },
      { title: "Hash Tables: Ransom Note", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/ctci-ransom-note/problem" },
      { title: "Balanced Brackets", platform: "HackerRank", difficulty: "Medium", url: "https://www.hackerrank.com/challenges/balanced-brackets/problem" },
      { title: "Queue using Two Stacks", platform: "HackerRank", difficulty: "Medium", url: "https://www.hackerrank.com/challenges/ctci-queue-using-two-stacks/problem" },
      { title: "Merge Two Sorted Linked Lists", platform: "HackerRank", difficulty: "Easy", url: "https://www.hackerrank.com/challenges/merge-two-sorted-linked-lists/problem" },
      { title: "Find the Running Median", platform: "HackerRank", difficulty: "Hard", url: "https://www.hackerrank.com/challenges/find-the-running-median/problem" },
    ],
  },
  {
    name: "GeeksforGeeks Classics",
    questions: [
      { title: "Kadane's Algorithm", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Kadane's Algorithm") },
      { title: "Reverse a Linked List", platform: "GeeksforGeeks", difficulty: "Easy", url: gfg("Reverse a Linked List") },
      { title: "Detect Loop in a Linked List", platform: "GeeksforGeeks", difficulty: "Easy", url: gfg("Detect Loop in a Linked List") },
      { title: "Boundary Traversal of a Binary Tree", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Boundary Traversal of binary tree") },
      { title: "Rat in a Maze Problem", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Rat in a Maze Problem") },
      { title: "Dijkstra's Shortest Path Algorithm", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Dijkstra's shortest path algorithm") },
      { title: "Floyd Warshall Algorithm", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Floyd Warshall Algorithm") },
      { title: "Longest Palindromic Substring", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Longest Palindromic Substring") },
      { title: "Egg Dropping Puzzle", platform: "GeeksforGeeks", difficulty: "Hard", url: gfg("Egg Dropping Puzzle") },
      { title: "N Queen Problem", platform: "GeeksforGeeks", difficulty: "Hard", url: gfg("N Queen Problem") },
      { title: "Detect Cycle in a Directed Graph", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Detect Cycle in a Directed Graph") },
      { title: "Topological Sort", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Topological Sort") },
      { title: "Minimum Spanning Tree (Kruskal's Algorithm)", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Kruskal's Minimum Spanning Tree Algorithm") },
      { title: "Longest Common Subsequence", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Longest Common Subsequence") },
      { title: "Subset Sum Problem", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Subset Sum Problem") },
      { title: "0/1 Knapsack Problem", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("0/1 Knapsack Problem") },
      { title: "Activity Selection Problem", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Activity Selection Problem") },
      { title: "Job Sequencing Problem", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Job Sequencing Problem") },
      { title: "Count Inversions of an Array", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Count Inversions of an Array") },
      { title: "Median of Two Sorted Arrays", platform: "GeeksforGeeks", difficulty: "Hard", url: gfg("Median of Two Sorted Arrays") },
      { title: "Rotate a Matrix by 90 Degrees", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Rotate a Matrix by 90 Degree") },
      { title: "Nth Fibonacci Number", platform: "GeeksforGeeks", difficulty: "Easy", url: gfg("Nth Fibonacci Number") },
      { title: "Check for Balanced Parentheses", platform: "GeeksforGeeks", difficulty: "Easy", url: gfg("Check for Balanced Parentheses") },
      { title: "Circular Queue Implementation", platform: "GeeksforGeeks", difficulty: "Medium", url: gfg("Circular Queue Implementation") },
      { title: "Trapping Rain Water", platform: "GeeksforGeeks", difficulty: "Hard", url: gfg("Trapping Rain Water") },
    ],
  },
];

const PLATFORM_META = {
  LeetCode: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    cta: "Solve on LeetCode",
  },
  HackerRank: {
    badge: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
    cta: "Solve on HackerRank",
  },
  GeeksforGeeks: {
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    cta: "Find it on GeeksforGeeks",
  },
};

const DIFFICULTY_META = {
  Easy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Hard: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
      }`}
    >
      {label}
    </button>
  );
}

function QuestionCard({ question }) {
  const platformMeta = PLATFORM_META[question.platform];
  return (
    <a
      href={question.url}
      target="_blank"
      rel="noopener noreferrer"
      title={platformMeta.cta}
      className="group flex flex-col justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all duration-150"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">
          {question.title}
        </h4>
        <ExternalLink
          size={14}
          className="shrink-0 mt-0.5 text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${platformMeta.badge}`}>
          {question.platform}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${DIFFICULTY_META[question.difficulty]}`}>
          {question.difficulty}
        </span>
      </div>
    </a>
  );
}

export default function CodingProblemsPage() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState(ALL);
  const [difficulty, setDifficulty] = useState(ALL);

  const totalCount = useMemo(
    () => topics.reduce((sum, t) => sum + t.questions.length, 0),
    [],
  );

  const filteredTopics = useMemo(() => {
    const q = search.trim().toLowerCase();
    return topics
      .map((t) => ({
        ...t,
        questions: t.questions.filter((question) => {
          if (platform !== ALL && question.platform !== platform) return false;
          if (difficulty !== ALL && question.difficulty !== difficulty) return false;
          if (q && !question.title.toLowerCase().includes(q) && !t.name.toLowerCase().includes(q)) {
            return false;
          }
          return true;
        }),
      }))
      .filter((t) => t.questions.length > 0);
  }, [search, platform, difficulty]);

  const shownCount = filteredTopics.reduce((sum, t) => sum + t.questions.length, 0);

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-200">
      {/* Header */}
      <section className="pt-16 pb-10 px-6 text-center">
        <span className="inline-block bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          Practice
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
          Coding Problems
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          {totalCount}+ of the most commonly asked interview questions,
          pulled from LeetCode, HackerRank, and GeeksforGeeks. Every card
          links straight to the original problem — solve it there.
        </p>
      </section>

      {/* Filters */}
      <div className="sticky top-15 z-30 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-y border-slate-100 dark:border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems or topics…"
              className="w-full pl-10 pr-9 py-2.5 rounded-full text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">
              Platform
            </span>
            {PLATFORMS.map((p) => (
              <FilterChip key={p} label={p} active={platform === p} onClick={() => setPlatform(p)} />
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-1">
              Difficulty
            </span>
            {DIFFICULTIES.map((d) => (
              <FilterChip key={d} label={d} active={difficulty === d} onClick={() => setDifficulty(d)} />
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col gap-12">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Showing {shownCount} of {totalCount} problems
          </p>

          {filteredTopics.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                No problems match those filters.
              </p>
            </div>
          )}

          {filteredTopics.map((t) => (
            <div key={t.name}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
                {t.name}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {t.questions.map((question) => (
                  <QuestionCard key={question.title + question.platform} question={question} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
