package com.example.Ecommerce.service;

import com.example.Ecommerce.dto.CartRequest;
import com.example.Ecommerce.model.CartItem;
import com.example.Ecommerce.model.Product;
import com.example.Ecommerce.model.User;
import com.example.Ecommerce.repository.CartItemRepository;
import com.example.Ecommerce.repository.ProductRepository;
import com.example.Ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public CartItem updateCart(Long id, int quantity) {

        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        item.setQuantity(quantity);

        return cartItemRepository.save(item);
    }

    @Transactional   // ✅ IMPORTANT FIX
    public CartItem addToCart(String email, CartRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository
                .findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem existingCartItem =
                cartItemRepository.findByUserEmailAndProductId(
                        email, product.getId()
                ).orElse(null);

        if (existingCartItem != null) {

            existingCartItem.setQuantity(
                    existingCartItem.getQuantity() + request.getQuantity()
            );

            return cartItemRepository.save(existingCartItem);
        }

        CartItem cartItem = CartItem.builder()
                .userEmail(email)
                .productId(product.getId())
                .title(product.getTitle())
                .price(product.getPrice())
                .image(product.getImage())
                .category(product.getCategory())
                .quantity(request.getQuantity())
                .build();
        return cartItemRepository.save(cartItem);
    }

    @Transactional(readOnly = true)
    public List<CartItem> getUserCart(Authentication authentication) {

        String email = authentication.getName();

        return cartItemRepository.findByUserEmail(email);
    }



    public void removeFromCart(Long cartItemId) {

        cartItemRepository.deleteById(cartItemId);

    }

}
