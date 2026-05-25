package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.Prescription;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrescriptionRepository extends MongoRepository<Prescription, String> {

    List<Prescription> findByOrganizationIdAndPatientPhoneOrderByCreatedAtDesc(String organizationId, String phone);

    List<Prescription> findByOrganizationIdOrderByCreatedAtDesc(String organizationId);
}
