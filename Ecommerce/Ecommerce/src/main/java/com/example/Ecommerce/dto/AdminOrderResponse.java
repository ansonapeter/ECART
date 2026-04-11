package com.example.Ecommerce.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class AdminOrderResponse {

    private Long id;
    private String status;
    private String userEmail;

    // ✅ FIXED: Added missing fields that were causing ₹0 display in Admin panel
    private Double totalAmount;
    private List<AdminOrderItemResponse> items;

    // Inner DTO for order items
    @Getter
    @Builder
    public static class AdminOrderItemResponse {
        private String productName;
        private Integer quantity;
        private Double price;
    }
}
