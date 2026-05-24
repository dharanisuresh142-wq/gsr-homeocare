package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {

    List<Product> findByOrganizationId(String organizationId);

    long countByOrganizationId(String organizationId);
}
