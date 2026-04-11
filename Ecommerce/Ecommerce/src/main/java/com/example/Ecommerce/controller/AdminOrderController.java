package com.example.Ecommerce.controller;

import com.example.Ecommerce.dto.AdminOrderResponse;
import com.example.Ecommerce.dto.UpdateOrderStatusRequest;
import com.example.Ecommerce.model.Order;
import com.example.Ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    // ✅ FIXED: Now maps totalAmount and items so Admin panel shows real prices
    @GetMapping
    public List<AdminOrderResponse> getAllOrders() {

        return orderService.getAllOrders()
                .stream()
                .map(order -> AdminOrderResponse.builder()
                        .id(order.getId())
                        .status(order.getStatus().name())
                        .userEmail(order.getUserEmail())
                        .totalAmount(order.getTotalAmount())       // ← was missing
                        .items(                                     // ← was missing
                                order.getItems() == null ? List.of() :
                                        order.getItems().stream()
                                                .map(item -> AdminOrderResponse.AdminOrderItemResponse.builder()
                                                        .productName(item.getProductName())
                                                        .quantity(item.getQuantity())
                                                        .price(item.getPrice())
                                                        .build())
                                                .toList()
                        )
                        .build())
                .toList();
    }

    // Generic status update
    @PutMapping("/{orderId}/status")
    public Order updateStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateOrderStatus(orderId, request.getStatus());
    }

    // Confirm order (starts auto shipping flow)
    @PutMapping("/{orderId}/confirm")
    public Order confirmOrder(@PathVariable Long orderId) {
        return orderService.confirmAndStartFlow(orderId);
    }

    // Ship order
    @PutMapping("/{orderId}/ship")
    public Order shipOrder(@PathVariable Long orderId) {
        return orderService.shipOrder(orderId);
    }

    // Verify delivery OTP
    @PutMapping("/verify-delivery")
    public Order verifyDelivery(
            @RequestParam Long orderId,
            @RequestParam String otp
    ) {
        return orderService.verifyDeliveryOtp(orderId, otp);
    }

    @PutMapping("/{orderId}/verify-otp")
    public Order verifyOtp(
            @PathVariable Long orderId,
            @RequestParam String otp
    ) {
        return orderService.verifyDeliveryOtp(orderId, otp);
    }

    // Receive return & process refund
    @PutMapping("/{orderId}/receive-return")
    public Order receiveReturnedProduct(@PathVariable Long orderId) {
        return orderService.receiveReturnedProduct(orderId);
    }

    @GetMapping("/test")
    public String test() {
        return "Admin working";
    }
}
