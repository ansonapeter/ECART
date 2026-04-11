package com.example.Ecommerce.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "order_tracking")
public class OrderTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    /**
     * FIX: Added columnDefinition = "VARCHAR(50)" to prevent
     * "Data truncated for column 'status'" error.
     *
     * Root cause: JPA with EnumType.STRING generates a VARCHAR column
     * that may default to a small length (e.g., VARCHAR(20) on some
     * MySQL versions). Enum values like "OUT_FOR_DELIVERY" (16 chars)
     * and "RETURN_INITIATED" (16 chars) were exceeding the column size.
     *
     * Fix: Explicitly define VARCHAR(50) which safely holds all
     * OrderStatus enum values (longest is 16 characters).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "VARCHAR(50)")
    private OrderStatus status;

    private LocalDateTime timestamp;
}
