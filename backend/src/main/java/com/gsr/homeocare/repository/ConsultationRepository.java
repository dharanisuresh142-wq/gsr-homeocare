package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.Consultation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends MongoRepository<Consultation, String> {

    List<Consultation> findByOrganizationIdOrderByDateDesc(String organizationId);

    List<Consultation> findByOrganizationIdAndPhoneOrderByDateDesc(String organizationId, String phone);
}
