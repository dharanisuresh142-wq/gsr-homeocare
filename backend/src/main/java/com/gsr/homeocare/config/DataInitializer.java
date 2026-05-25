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
                        "MED-ARNICA-30C",
                        "Arnica Montana 30C",
                        249.0,
                        "Homeopathic remedy for bruises, muscle soreness, and minor injuries.",
                        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400",
                        "4 drops under tongue, 3 times daily — morning, afternoon, and night."
                ));
                productRepository.save(createProduct(orgId,
                        "MED-BELL-30C",
                        "Belladonna 30C",
                        279.0,
                        "Homeopathic medicine for fever, headache, and sudden inflammation.",
                        "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400",
                        "5 drops in half glass water, every 4 hours until symptoms improve."
                ));
                productRepository.save(createProduct(orgId,
                        "MED-IMMUNITY-01",
                        "Immunity Booster Drops",
                        199.0,
                        "Daily homeopathic drops to support natural immunity.",
                        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400",
                        "10 drops in water — morning on empty stomach and at bedtime."
                ));
            }
        };
    }

    private Product createProduct(String orgId, String medicineId, String name, Double price, String description, String image, String usage) {
        Product product = new Product();
        product.setOrganizationId(orgId);
        product.setMedicineId(medicineId);
        product.setName(name);
        product.setPrice(price);
        product.setDescription(description);
        product.setImage(image);
        product.setUsageInstructions(usage);
        return product;
    }
}
