package com.example.Ecommerce.service;

import com.example.Ecommerce.dto.OrderItemResponse;
import com.example.Ecommerce.dto.OrderResponse;
import com.example.Ecommerce.model.*;
import com.example.Ecommerce.repository.CartItemRepository;
import com.example.Ecommerce.repository.OrderRepository;
import com.example.Ecommerce.repository.OrderTrackingRepository;
import com.example.Ecommerce.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final CartItemRepository cartItemRepository;
    private final OrderRepository orderRepository;
    private final OrderTrackingRepository orderTrackingRepository;
    private final ProductRepository productRepository;
    private final EmailService emailService;

    // =========================
    // 🟢 PLACE ORDER
    // =========================
    @Transactional
    public Order placeOrder(Authentication authentication) {

        String email = authentication.getName();

        List<CartItem> cartItems = cartItemRepository.findByUserEmail(email);

        if (cartItems == null || cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        double totalAmount = cartItems.stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();

        Order order = new Order();
        order.setUserEmail(email);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.CREATED);

        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: " + product.getTitle()
                );
            }

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = OrderItem.builder()
                    .productId(cartItem.getProductId())
                    .productName(cartItem.getTitle())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getPrice())
                    .build();
            orderItems.add(orderItem);
        }

        // ✅ Set relation properly
        order.setItems(orderItems);
        orderItems.forEach(item -> item.setOrder(order));

        Order savedOrder = orderRepository.save(order);

        saveTracking(savedOrder.getId(), OrderStatus.CREATED);

        cartItemRepository.deleteByUserEmail(email);

        emailService.sendEmail(
                email,
                "Order Placed Successfully",
                "Your order #" + savedOrder.getId() +
                        " has been placed successfully.\n\n" +
                        "Total Amount: ₹" + savedOrder.getTotalAmount() +
                        "\nStatus: CREATED\n\n" +
                        "Please complete payment."
        );

        return savedOrder;
    }

    // =========================
    // 🟢 GET USER ORDERS
    // =========================
    public List<OrderResponse> getUserOrders(Authentication authentication) {

        if (authentication == null) {
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName();

        return orderRepository.findByUserEmail(email)
                .stream()
                .map(order -> OrderResponse.builder()
                        .orderId(order.getId())
                        .totalAmount(order.getTotalAmount())
                        .status(order.getStatus())
                        .estimatedDeliveryDate(order.getEstimatedDeliveryDate())
                        .items(order.getItems() == null ? List.of() :
                                order.getItems().stream()
                                        .map(item -> OrderItemResponse.builder()
                                                .productName(item.getProductName())
                                                .quantity(item.getQuantity())
                                                .price(item.getPrice())
                                                .build())
                                        .toList())
                        .build())
                .toList();
    }

    // =========================
    // 🟢 ADMIN UPDATE STATUS
    // =========================
    public Order updateOrderStatus(Long orderId, OrderStatus newStatus) {

        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() == OrderStatus.CANCELLED ||
                order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Order cannot be updated");
        }

        order.setStatus(newStatus);

        Order updated = orderRepository.save(order);

        saveTracking(orderId, newStatus);

        return updated;
    }

    // =========================
    // 🟢 ADMIN GET ALL ORDERS
    // =========================
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // =========================
    // 🟢 CANCEL ORDER
    // =========================
    @Transactional
    public Order cancelOrder(Long orderId, Authentication authentication) {

        String email = authentication.getName();
        Order order = getOrderOrThrow(orderId);

        if (!order.getUserEmail().equals(email)) {
            throw new RuntimeException("Not your order");
        }

        if (order.getStatus() == OrderStatus.SHIPPED ||
                order.getStatus() == OrderStatus.OUT_FOR_DELIVERY ||
                order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Cannot cancel after shipping");
        }

        OrderStatus previousStatus = order.getStatus();

        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }

        if (previousStatus == OrderStatus.PAID ||
                previousStatus == OrderStatus.CONFIRMED) {

            order.setStatus(OrderStatus.REFUNDED);
            saveTracking(orderId, OrderStatus.REFUNDED);

            emailService.sendEmail(
                    email,
                    "Refund Processed",
                    "Refund completed for order #" + orderId
            );

        } else {
            order.setStatus(OrderStatus.CANCELLED);
            saveTracking(orderId, OrderStatus.CANCELLED);
        }

        return orderRepository.save(order);
    }

    // =========================
    // 🟢 RETURN PRODUCT
    // =========================
    @Transactional
    public Order returnProduct(Long orderId, Authentication authentication) {

        String email = authentication.getName();

        Order order = getOrderOrThrow(orderId);

        if (!order.getUserEmail().equals(email)) {
            throw new RuntimeException("Not your order");
        }

        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new RuntimeException("Only delivered orders can be returned");
        }

        order.setStatus(OrderStatus.RETURN_INITIATED);

        saveTracking(orderId, OrderStatus.RETURN_INITIATED);

        emailService.sendEmail(
                email,
                "Return Initiated",
                "Return initiated for order #" + orderId
        );

        return orderRepository.save(order);
    }

    // =========================
    // 🟢 RECEIVE RETURN
    // =========================
    @Transactional
    public Order receiveReturnedProduct(Long orderId) {

        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() != OrderStatus.RETURN_INITIATED) {
            throw new RuntimeException("Return not initiated");
        }

        order.setStatus(OrderStatus.RETURN_RECEIVED);
        saveTracking(orderId, OrderStatus.RETURN_RECEIVED);

        order.setStatus(OrderStatus.REFUNDED);
        saveTracking(orderId, OrderStatus.REFUNDED);

        emailService.sendEmail(
                order.getUserEmail(),
                "Refund Processed",
                "Refund completed for order #" + orderId
        );

        return orderRepository.save(order);
    }

    // =========================
    // 🟢 CONFIRM ORDER
    // =========================
    @Transactional
    public Order confirmOrder(Long orderId) {

        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() != OrderStatus.PAID) {
            throw new RuntimeException("Only PAID orders can be confirmed");
        }

        order.setStatus(OrderStatus.CONFIRMED);

        Order saved = orderRepository.save(order);

        saveTracking(orderId, OrderStatus.CONFIRMED);

        emailService.sendEmail(
                order.getUserEmail(),
                "Order Confirmed",
                "Your order #" + orderId + " has been confirmed."
        );

        return saved;
    }

    // =========================
    // 🟢 CONFIRM + AUTO FLOW
    // =========================
    public Order confirmAndStartFlow(Long orderId) {
        Order confirmedOrder = confirmOrder(orderId);
        startAutoFlow(orderId);
        return confirmedOrder;
    }

    // =========================
    // 🟢 SHIP ORDER
    // =========================
    @Transactional
    public Order shipOrder(Long orderId) {

        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new RuntimeException("Only CONFIRMED orders can be shipped");
        }

        order.setStatus(OrderStatus.SHIPPED);

        Order saved = orderRepository.save(order);

        saveTracking(orderId, OrderStatus.SHIPPED);

        emailService.sendEmail(
                order.getUserEmail(),
                "Order Shipped",
                "Your order #" + orderId + " has been shipped."
        );

        return saved;
    }

    // =========================
    // 🟢 OUT FOR DELIVERY
    // =========================
    @Transactional
    public Order outForDelivery(Long orderId) {

        Order order = getOrderOrThrow(orderId);

        if (order.getStatus() != OrderStatus.SHIPPED) {
            throw new RuntimeException("Only SHIPPED orders allowed");
        }

        String otp = String.valueOf((int)(Math.random() * 9000) + 1000);

        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        order.setDeliveryOtp(otp);

        Order saved = orderRepository.save(order);

        saveTracking(orderId, OrderStatus.OUT_FOR_DELIVERY);

        emailService.sendEmail(
                order.getUserEmail(),
                "Delivery OTP",
                "Your OTP for order #" + orderId + " is: " + otp
        );

        return saved;
    }

    // =========================
    // 🟢 VERIFY DELIVERY
    // =========================
    @Transactional
    public Order verifyDeliveryOtp(Long orderId, String otp) {

        Order order = getOrderOrThrow(orderId);

        if (!order.getDeliveryOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        order.setOtpVerified(true);
        order.setStatus(OrderStatus.DELIVERED);

        Order saved = orderRepository.save(order);

        saveTracking(orderId, OrderStatus.DELIVERED);

        emailService.sendEmail(
                order.getUserEmail(),
                "Order Delivered",
                "Your order #" + orderId + " has been delivered."
        );

        return saved;
    }

    // =========================
    // 🟢 COMMON METHODS
    // =========================
    private Order getOrderOrThrow(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }

    private void saveTracking(Long orderId, OrderStatus status) {
        OrderTracking tracking = new OrderTracking();
        tracking.setOrderId(orderId);
        tracking.setStatus(status);
        tracking.setTimestamp(LocalDateTime.now());
        orderTrackingRepository.save(tracking);
    }

    // =========================
    // 🟢 AUTO FLOW
    // =========================
    @Async
    public void startAutoFlow(Long orderId) {
        try {
            Thread.sleep(10000);
            shipOrder(orderId);

            Thread.sleep(10000);
            outForDelivery(orderId);

        } catch (InterruptedException e) {
            log.error("Auto flow interrupted", e);
        }
    }
}