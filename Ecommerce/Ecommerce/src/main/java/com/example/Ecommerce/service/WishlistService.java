package com.example.Ecommerce.service;

import com.example.Ecommerce.model.Product;
import com.example.Ecommerce.model.WishlistItem;
import com.example.Ecommerce.repository.ProductRepository;
import com.example.Ecommerce.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final ProductRepository      productRepository;

    // GET all wishlist items for a user
    @Transactional(readOnly = true)
    public List<WishlistItem> getUserWishlist(String email) {
        return wishlistItemRepository.findByUserEmail(email);
    }

    // ADD product to wishlist (idempotent — no duplicate if already in wishlist)
    @Transactional
    public WishlistItem addToWishlist(String email, Long productId) {

        // Return existing item if already wishlisted
        return wishlistItemRepository
                .findByUserEmailAndProductId(email, productId)
                .orElseGet(() -> {

                    Product product = productRepository.findById(productId)
                            .orElseThrow(() -> new RuntimeException("Product not found: " + productId));

                    WishlistItem item = WishlistItem.builder()
                            .userEmail(email)
                            .productId(product.getId())
                            .title(product.getTitle())
                            .price(product.getPrice())
                            .image(product.getImage())
                            .category(product.getCategory())
                            .build();

                    return wishlistItemRepository.save(item);
                });
    }

    // REMOVE a specific item by its wishlist row id
    @Transactional
    public void removeFromWishlist(Long wishlistItemId) {
        wishlistItemRepository.deleteById(wishlistItemId);
    }

    // REMOVE by productId (used from product detail / dashboard)
    @Transactional
    public void removeByProductId(String email, Long productId) {
        wishlistItemRepository.deleteByUserEmailAndProductId(email, productId);
    }

    // CHECK if a product is already in the wishlist
    @Transactional(readOnly = true)
    public boolean isWishlisted(String email, Long productId) {
        return wishlistItemRepository.existsByUserEmailAndProductId(email, productId);
    }
}
