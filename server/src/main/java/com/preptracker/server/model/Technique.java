package com.preptracker.server.model;

// A reusable technique tag that can be attached to a question, e.g. "Two Pointers", "Sliding Window".

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "techniques")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Technique {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}
