package com.example.Ecommerce.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private double totalAmount;

    /**
     * FIX: Added columnDefinition = "VARCHAR(50)" to prevent
     * "Data truncated for column 'status'" in the orders table.
     * Same root cause as OrderTracking — MySQL defaulting to
     * a small VARCHAR that can't hold longer enum values.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "VARCHAR(50)")
    private OrderStatus status;

    private LocalDate estimatedDeliveryDate;

    private String deliveryOtp;
    private boolean otpVerified = false;

    private LocalDate createdDate;

    @OneToMany(
            mappedBy = "order",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @JsonManagedReference
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
}
