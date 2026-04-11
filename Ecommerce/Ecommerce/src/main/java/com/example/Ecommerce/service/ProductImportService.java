package com.example.Ecommerce.service;

import com.example.Ecommerce.model.Product;
import com.example.Ecommerce.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URL;

@Service
@RequiredArgsConstructor
public class ProductImportService {

    private final ProductRepository productRepository;

    public void importProducts() {

        try {

            String url = "https://dummyjson.com/products?limit=200";

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(new URL(url));
            JsonNode products = root.get("products"); // 🔥 IMPORTANT

            productRepository.deleteAll(); // clear old data

            for (JsonNode node : products) {

                Product product = Product.builder()
                        .id(node.get("id").asLong())
                        .title(node.get("title").asText())
                        .description(node.get("description").asText())
                        .price(node.get("price").asDouble())
                        .category(node.get("category").asText())
                        .image(node.get("thumbnail").asText()) // 🔥 use thumbnail
                        .stock(10)
                        .build();

                productRepository.save(product);
            }

            System.out.println("DummyJSON Products imported successfully");

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Import failed");
        }
    }
}