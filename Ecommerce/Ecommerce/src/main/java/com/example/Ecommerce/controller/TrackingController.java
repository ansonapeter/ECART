package com.example.Ecommerce.controller;

import com.example.Ecommerce.model.OrderTracking;
import com.example.Ecommerce.service.TrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
public class TrackingController {

    private final TrackingService service;

    @GetMapping("/{orderId}")
    public List<OrderTracking> getTracking(
            @PathVariable Long orderId) {

        return service.getTracking(orderId);
    }
}
