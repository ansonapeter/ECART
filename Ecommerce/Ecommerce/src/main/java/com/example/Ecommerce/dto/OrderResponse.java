package com.example.Ecommerce.dto;

import com.example.Ecommerce.model.OrderStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class OrderResponse {

    private Long orderId;

    private Double totalAmount;

    private OrderStatus status;

    private LocalDate estimatedDeliveryDate;

    private List<OrderItemResponse> items;
}
