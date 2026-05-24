package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.exception.ResourceNotFoundException;
import com.gsr.homeocare.model.Product;
import com.gsr.homeocare.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final MongoProperties mongoProperties;

    public ProductService(ProductRepository productRepository, MongoProperties mongoProperties) {
        this.productRepository = productRepository;
        this.mongoProperties = mongoProperties;
    }

    public List<Product> getAllProducts() {
        return productRepository.findByOrganizationId(mongoProperties.getOrganizationId());
    }

    public Product createProduct(Product product) {
        product.setOrganizationId(mongoProperties.getOrganizationId());
        return productRepository.save(product);
    }

    public Product getProductById(String id) {
        return productRepository.findById(id)
                .filter(p -> mongoProperties.getOrganizationId().equals(p.getOrganizationId()))
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
}
