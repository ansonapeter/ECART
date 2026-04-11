package com.example.Ecommerce.service;

import com.example.Ecommerce.model.Order;
import com.example.Ecommerce.model.OrderStatus;
import com.example.Ecommerce.model.OrderTracking;
import com.example.Ecommerce.model.Payment;
import com.example.Ecommerce.repository.OrderRepository;
import com.example.Ecommerce.repository.OrderTrackingRepository;
import com.example.Ecommerce.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderTrackingRepository orderTrackingRepository;


    @Transactional
    public Payment makePayment(Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // ✅ Prevent invalid payments
        if (order.getStatus() == OrderStatus.PAID) {
            throw new RuntimeException("Order already paid");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException("Cancelled order cannot be paid");
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("Delivered order cannot be paid");
        }

        // ✅ Create payment
        Payment payment = new Payment();

        payment.setOrderId(orderId);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus("SUCCESS");
        payment.setTransactionId(UUID.randomUUID().toString());

        Payment savedPayment = paymentRepository.save(payment);

        // ✅ Update order status
        order.setStatus(OrderStatus.PAID);

        order.setEstimatedDeliveryDate(LocalDate.now().plusDays(5));

        orderRepository.save(order);

        // ✅ Save tracking
        saveTracking(orderId, OrderStatus.PAID);

        return savedPayment;
    }


    public Payment getPayment(Long orderId) {

        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }


    // ✅ Clean reusable tracking method
    private void saveTracking(Long orderId, OrderStatus status) {

        OrderTracking tracking = new OrderTracking();

        tracking.setOrderId(orderId);
        tracking.setStatus(status);
        tracking.setTimestamp(LocalDateTime.now());

        orderTrackingRepository.save(tracking);
    }
    @Transactional
    public Payment refundPayment(Long orderId) {

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        payment.setStatus("REFUNDED");

        Payment saved = paymentRepository.save(payment);

        // Update order status
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.REFUNDED);

        orderRepository.save(order);

        // tracking
        saveTracking(orderId, OrderStatus.REFUNDED);

        return saved;
    }
}
