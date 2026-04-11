package com.example.Ecommerce.service;

import com.example.Ecommerce.dto.ProductRequest;
import com.example.Ecommerce.model.Product;
import com.example.Ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Product addProduct(ProductRequest request) {
        Product product = Product.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(request.getCategory())
                .image(request.getImage())
                .build();
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // ✅ NEW — get single product by ID for ProductDetail page
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
}
