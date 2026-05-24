package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends MongoRepository<Order, String> {

    Optional<Order> findByIdAndOrganizationId(String id, String organizationId);

    List<Order> findByOrganizationIdOrderByCreatedAtDesc(String organizationId);

    List<Order> findByPhoneAndOrganizationIdOrderByCreatedAtDesc(String phone, String organizationId);
}
