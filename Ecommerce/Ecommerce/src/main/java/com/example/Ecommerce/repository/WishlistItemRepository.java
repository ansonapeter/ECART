package com.example.Ecommerce.repository;

import com.example.Ecommerce.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {

    List<WishlistItem>   findByUserEmail(String userEmail);

    Optional<WishlistItem> findByUserEmailAndProductId(String userEmail, Long productId);

    boolean existsByUserEmailAndProductId(String userEmail, Long productId);

    void deleteByUserEmailAndProductId(String userEmail, Long productId);
}
