package com.example.Ecommerce.controller;

import com.example.Ecommerce.dto.ProductRequest;
import com.example.Ecommerce.model.Product;
import com.example.Ecommerce.service.ProductImportService;
import com.example.Ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductImportService productImportService;

    // ADMIN adds product manually
    @PostMapping
    public Product addProduct(@RequestBody ProductRequest request) {
        return productService.addProduct(request);
    }

    // PUBLIC — get all products
    @GetMapping
    public List<Product> getProducts() {
        return productService.getAllProducts();
    }

    // ✅ NEW — PUBLIC — get single product by ID (needed for ProductDetail page)
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // IMPORT EXTERNAL PRODUCTS
    @PostMapping("/import")
    public String importProducts() {
        productImportService.importProducts();
        return "External products imported successfully!";
    }
}
