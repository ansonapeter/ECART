package com.example.Ecommerce.controller;

import com.example.Ecommerce.model.Payment;
import com.example.Ecommerce.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/{orderId}")
    public Payment makePayment(@PathVariable Long orderId) {

        return paymentService.makePayment(orderId);
    }

    @GetMapping("/{orderId}")
    public Payment getPayment(@PathVariable Long orderId) {

        return paymentService.getPayment(orderId);
    }
}
