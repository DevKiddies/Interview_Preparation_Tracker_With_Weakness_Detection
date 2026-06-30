package com.preptracker.server.config;

// Populates the database with a default set of MCQ questions the first time the app starts.
// It checks if any questions already exist before inserting, so it's completely safe to run
// on every restart — it won't duplicate data.

import com.preptracker.server.model.Question;
import com.preptracker.server.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final QuestionRepository questionRepository;

    @Override
    public void run(String... args) {
        // Idempotent — skips seeding if any questions already exist, safe to run on every startup
        if (questionRepository.count() > 0) return;

        questionRepository.saveAll(List.of(
            q("What is the average-case time complexity of a HashMap lookup?",
              "O(n)", "O(1)", "O(log n)", "O(n²)", "B", "HashMaps", "Easy", "DSA"),

            q("Which array operation is O(n) in the worst case?",
              "Access by index", "Append at end", "Insert at beginning", "Read length", "C", "Arrays", "Easy", "DSA"),

            q("What is the time complexity of binary search on a sorted array?",
              "O(n)", "O(n²)", "O(n log n)", "O(log n)", "D", "Searching", "Easy", "DSA"),

            q("Which of the following resolves hash collisions using linked lists?",
              "Open addressing", "Linear probing", "Separate chaining", "Quadratic probing", "C", "HashMaps", "Medium", "DSA"),

            q("Which sorting algorithm guarantees O(n log n) in all cases?",
              "QuickSort", "BubbleSort", "Merge Sort", "Insertion Sort", "C", "Sorting", "Medium", "DSA"),

            q("What is the best-case time complexity of Insertion Sort?",
              "O(n²)", "O(n log n)", "O(n)", "O(1)", "C", "Sorting", "Easy", "DSA"),

            q("Which sorting algorithm is most efficient for nearly-sorted data?",
              "Merge Sort", "Selection Sort", "QuickSort", "Insertion Sort", "D", "Sorting", "Medium", "DSA"),

            q("What is the worst-case time complexity of QuickSort?",
              "O(n log n)", "O(n²)", "O(n)", "O(log n)", "B", "Sorting", "Medium", "DSA"),

            q("Which tree traversal visits nodes in Left → Root → Right order?",
              "Preorder", "Postorder", "Level-order", "Inorder", "D", "Trees", "Easy", "DSA"),

            q("What is the height of a balanced binary tree with n nodes?",
              "O(n)", "O(n²)", "O(log n)", "O(1)", "C", "Trees", "Easy", "DSA"),

            q("What property does an AVL tree always maintain?",
              "All leaves at same level", "Height difference of any node's subtrees is at most 1",
              "Every node has exactly 2 children", "Nodes are stored in sorted level order", "B", "Trees", "Medium", "DSA"),

            q("Which traversal of a BST produces elements in sorted ascending order?",
              "Preorder", "Postorder", "Inorder", "Level-order", "C", "Trees", "Easy", "DSA"),

            q("Which data structure is used internally by BFS (Breadth First Search)?",
              "Stack", "Queue", "Priority Queue", "Linked List", "B", "Graphs", "Easy", "DSA"),

            q("What is the time complexity of DFS on a graph with V vertices and E edges?",
              "O(V)", "O(E)", "O(V * E)", "O(V + E)", "D", "Graphs", "Medium", "DSA"),

            q("Which algorithm finds the shortest path in a graph with non-negative weights?",
              "DFS", "BFS", "Dijkstra's", "Bellman-Ford", "C", "Graphs", "Medium", "DSA"),

            q("Which graph representation is most space-efficient for sparse graphs?",
              "Adjacency Matrix", "Incidence Matrix", "Adjacency List", "Edge Set Matrix", "C", "Graphs", "Medium", "DSA"),

            q("Which data structure follows LIFO (Last In First Out)?",
              "Queue", "Stack", "Deque", "Priority Queue", "B", "Data Structures", "Easy", "DSA"),

            q("What is the time complexity of extracting the minimum from a min-heap?",
              "O(1)", "O(n)", "O(log n)", "O(n log n)", "C", "Heaps", "Medium", "DSA"),

            q("What is the key idea behind dynamic programming?",
              "Always pick the locally optimal choice", "Break into sub-problems and memoize overlapping results",
              "Explore all possible paths via backtracking", "Divide into independent halves recursively", "B", "Dynamic Programming", "Medium", "DSA"),

            q("What is the space complexity of a naive recursive Fibonacci implementation?",
              "O(1)", "O(log n)", "O(2ⁿ)", "O(n)", "D", "Recursion", "Medium", "DSA")
        ));
    }

    private Question q(String text,
                       String a, String b, String c, String d,
                       String correct,
                       String category, String difficulty, String topic) {
        Question q = new Question();
        q.setText(text);
        q.setOptionA(a);
        q.setOptionB(b);
        q.setOptionC(c);
        q.setOptionD(d);
        q.setCorrectAnswer(correct);
        q.setCategory(category);
        q.setDifficulty(difficulty);
        q.setTopic(topic);
        return q;
    }
}
