package com.example.Ecommerce.controller;

import com.example.Ecommerce.service.ProductImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class ProductImportController {

    private final ProductImportService importService;

    @PostMapping("/import")
    public String importProducts() throws Exception {

        importService.importProducts();

        return "Products imported successfully";
    }

}
