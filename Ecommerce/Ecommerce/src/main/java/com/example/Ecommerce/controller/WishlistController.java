package com.example.Ecommerce.controller;

import com.example.Ecommerce.model.WishlistItem;
import com.example.Ecommerce.service.CartService;
import com.example.Ecommerce.service.WishlistService;
import com.example.Ecommerce.dto.CartRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;
    private final CartService     cartService;

    // GET /api/wishlist  — list all wishlist items for logged-in user
    @GetMapping
    public List<WishlistItem> getWishlist(Authentication authentication) {
        return wishlistService.getUserWishlist(authentication.getName());
    }

    // POST /api/wishlist/{productId}  — add product to wishlist
    @PostMapping("/{productId}")
    public WishlistItem addToWishlist(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        return wishlistService.addToWishlist(authentication.getName(), productId);
    }

    // DELETE /api/wishlist/{id}  — remove by wishlist row id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromWishlist(@PathVariable Long id) {
        wishlistService.removeFromWishlist(id);
        return ResponseEntity.ok().build();
    }

    // DELETE /api/wishlist/product/{productId}  — remove by product id
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> removeByProductId(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        wishlistService.removeByProductId(authentication.getName(), productId);
        return ResponseEntity.ok().build();
    }

    // GET /api/wishlist/check/{productId}  — check if product is wishlisted
    @GetMapping("/check/{productId}")
    public ResponseEntity<Map<String, Boolean>> checkWishlisted(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        boolean wishlisted = wishlistService.isWishlisted(
                authentication.getName(), productId
        );
        return ResponseEntity.ok(Map.of("wishlisted", wishlisted));
    }

    // POST /api/wishlist/{id}/move-to-cart  — move item from wishlist to cart
    @PostMapping("/{id}/move-to-cart")
    public ResponseEntity<String> moveToCart(
            @PathVariable Long id,
            Authentication authentication
    ) {
        // find the wishlist item
        var item = wishlistService.getUserWishlist(authentication.getName())
                .stream()
                .filter(w -> w.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Wishlist item not found"));

        // add to cart
        CartRequest cartRequest = new CartRequest();
        cartRequest.setProductId(item.getProductId());
        cartRequest.setQuantity(1);
        cartService.addToCart(authentication.getName(), cartRequest);

        // remove from wishlist
        wishlistService.removeFromWishlist(id);

        return ResponseEntity.ok("Moved to cart");
    }
}
