package com.example.Ecommerce.controller;

import com.example.Ecommerce.dto.OrderResponse;
import com.example.Ecommerce.dto.UpdateOrderStatusRequest;
import com.example.Ecommerce.model.Order;
import com.example.Ecommerce.model.OrderStatus;
import com.example.Ecommerce.repository.OrderRepository;
import com.example.Ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @PostMapping
    public Order placeOrder(Authentication authentication) {

        return orderService.placeOrder(authentication);

    }

    @GetMapping
    public List<OrderResponse> getOrders(Authentication authentication) {
        return orderService.getUserOrders(authentication);
    }


    @GetMapping("/all")
    public List<Order> getAllOrders() {
        return orderService.getAllOrders();
    }


    @PutMapping("/status")
    public Order updateOrderStatus(
            @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateOrderStatus(
                request.getOrderId(),
                request.getStatus()
        );
    }

    @PostMapping("/{orderId}/cancel")
    public Order cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        return orderService.cancelOrder(orderId, authentication);
    }


    @PostMapping("/{orderId}/return-product")
    public ResponseEntity<?> returnProduct(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                orderService.returnProduct(orderId, authentication)
        );
    }

    @PutMapping("/{orderId}/receive-return")
    public ResponseEntity<?> receiveReturnedProduct(@PathVariable Long orderId) {

        return ResponseEntity.ok(
                orderService.receiveReturnedProduct(orderId)
        );
    }

}
