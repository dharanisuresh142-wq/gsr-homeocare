package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.Feedback;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {

    List<Feedback> findByOrganizationIdAndPatientPhoneOrderByCreatedAtDesc(String organizationId, String phone);

    List<Feedback> findByOrganizationIdOrderByCreatedAtDesc(String organizationId);
}
