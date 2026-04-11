package com.example.Ecommerce.service;

import com.example.Ecommerce.model.OrderTracking;
import com.example.Ecommerce.repository.OrderTrackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrackingService {

    private final OrderTrackingRepository repository;

    public List<OrderTracking> getTracking(Long orderId) {

        return repository.findByOrderIdOrderByTimestampAsc(orderId);
    }
}
