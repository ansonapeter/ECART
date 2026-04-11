package com.example.Ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;   // ✅ instead of User entity

    private Long productId;
    private String title;
    private Double price;
    private String image;
    private String category;

    private int quantity;
}