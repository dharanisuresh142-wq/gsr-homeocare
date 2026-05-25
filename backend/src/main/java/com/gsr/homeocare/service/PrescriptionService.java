package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.exception.ResourceNotFoundException;
import com.gsr.homeocare.model.Prescription;
import com.gsr.homeocare.repository.PrescriptionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final MongoProperties mongoProperties;

    public PrescriptionService(PrescriptionRepository prescriptionRepository, MongoProperties mongoProperties) {
        this.prescriptionRepository = prescriptionRepository;
        this.mongoProperties = mongoProperties;
    }

    public List<Prescription> listAll() {
        return prescriptionRepository.findByOrganizationIdOrderByCreatedAtDesc(mongoProperties.getOrganizationId());
    }

    public List<Prescription> listByPhone(String phone) {
        return prescriptionRepository.findByOrganizationIdAndPatientPhoneOrderByCreatedAtDesc(
                mongoProperties.getOrganizationId(), normalizePhone(phone));
    }

    public Prescription create(Prescription prescription) {
        prescription.setOrganizationId(mongoProperties.getOrganizationId());
        prescription.setPatientPhone(normalizePhone(prescription.getPatientPhone()));
        if (prescription.getCreatedAt() == null) {
            prescription.setCreatedAt(LocalDateTime.now());
        }
        return prescriptionRepository.save(prescription);
    }

    public Prescription getById(String id) {
        return prescriptionRepository.findById(id)
                .filter(p -> mongoProperties.getOrganizationId().equals(p.getOrganizationId()))
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("\\s+", "").trim();
    }
}
