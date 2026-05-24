package com.gsr.homeocare.config;

import com.gsr.homeocare.model.Product;
import com.gsr.homeocare.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner seedProducts(ProductRepository productRepository, MongoProperties mongoProperties) {
        return args -> {
            String orgId = mongoProperties.getOrganizationId();
            if (productRepository.countByOrganizationId(orgId) == 0) {
                productRepository.save(createProduct(orgId,
                        "Arnica Montana 30C",
                        249.0,
                        "Homeopathic remedy for bruises, muscle soreness, and minor injuries.",
                        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400"
                ));
                productRepository.save(createProduct(orgId,
                        "Physiotherapy Massage Oil",
                        399.0,
                        "Natural herbal oil for pain relief and muscle relaxation.",
                        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400"
                ));
                productRepository.save(createProduct(orgId,
                        "Immunity Booster Drops",
                        199.0,
                        "Daily homeopathic drops to support natural immunity.",
                        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400"
                ));
            }
        };
    }

    private Product createProduct(String orgId, String name, Double price, String description, String image) {
        Product product = new Product();
        product.setOrganizationId(orgId);
        product.setName(name);
        product.setPrice(price);
        product.setDescription(description);
        product.setImage(image);
        return product;
    }
}
