package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.FollowUp;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowUpRepository extends MongoRepository<FollowUp, String> {

    List<FollowUp> findByOrganizationIdAndPatientPhoneOrderByScheduledDateAsc(String organizationId, String phone);

    List<FollowUp> findByOrganizationIdOrderByScheduledDateAsc(String organizationId);
}
