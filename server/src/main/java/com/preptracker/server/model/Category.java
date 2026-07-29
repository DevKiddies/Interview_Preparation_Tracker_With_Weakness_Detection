package com.preptracker.server.model;

// Top-level subject grouping for questions, e.g. "DSA", "Database", "OOP".
// NOTE: the real Supabase `categories` table also has a `category_id` column whose
// purpose is unconfirmed (possibly an unused/legacy leftover) — it is deliberately
// not mapped here. Revisit if it turns out to be a parent-category FK.

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;
}
