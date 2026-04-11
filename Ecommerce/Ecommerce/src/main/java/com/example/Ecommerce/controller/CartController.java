package com.example.Ecommerce.controller;

import com.example.Ecommerce.dto.CartRequest;
import com.example.Ecommerce.model.CartItem;
import com.example.Ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public CartItem addToCart(
            @Valid @RequestBody CartRequest request,
            Authentication authentication
    ) {

        String email = authentication.getName();

        return cartService.addToCart(email, request);
    }

    @GetMapping
    public List<CartItem> viewCart(Authentication authentication) {

        return cartService.getUserCart(authentication);
    }

    @PutMapping("/{id}")
    public CartItem updateCart(
            @PathVariable Long id,
            @RequestBody CartRequest request
    ) {
        return cartService.updateCart(id, request.getQuantity());
    }

    @DeleteMapping("/{id}")
    public void remove(@PathVariable Long id) {

        cartService.removeFromCart(id);
    }
}
