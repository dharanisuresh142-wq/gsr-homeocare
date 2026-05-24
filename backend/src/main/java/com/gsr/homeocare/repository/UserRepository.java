package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByPhoneAndOrganizationId(String phone, String organizationId);
}
