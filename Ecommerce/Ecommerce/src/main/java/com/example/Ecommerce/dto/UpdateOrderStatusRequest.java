package com.example.Ecommerce.dto;

import com.example.Ecommerce.model.OrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {

    private Long orderId;
    private OrderStatus status;

}
