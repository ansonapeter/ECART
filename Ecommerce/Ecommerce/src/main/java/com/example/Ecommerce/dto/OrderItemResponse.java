package com.example.Ecommerce.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {

    private String productName;

    private Integer quantity;

    private Double price;
}
