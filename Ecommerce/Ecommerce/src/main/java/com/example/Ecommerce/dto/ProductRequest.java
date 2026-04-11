package com.example.Ecommerce.dto;

import lombok.Data;

@Data
public class ProductRequest {

    private String title;
    private String description;
    private Double price;
    private Integer stock;
    private String category;
    private String image;
}