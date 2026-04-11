package com.example.Ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    private Long id;   // ✅ Use external API ID (NO auto generation)

    private String title;   // ✅ match DummyJSON

    @Column(columnDefinition = "TEXT")
    private String description;

    private Double price;

    private Integer stock;

    private String category;

    private String image;   // ✅ rename from imageUrl → image
}