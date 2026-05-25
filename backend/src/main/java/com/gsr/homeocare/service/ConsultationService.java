package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.exception.ResourceNotFoundException;
import com.gsr.homeocare.model.Consultation;
import com.gsr.homeocare.repository.ConsultationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final MongoProperties mongoProperties;

    public ConsultationService(ConsultationRepository consultationRepository, MongoProperties mongoProperties) {
        this.consultationRepository = consultationRepository;
        this.mongoProperties = mongoProperties;
    }

    public List<Consultation> getAllConsultations() {
        return consultationRepository.findByOrganizationIdOrderByDateDesc(mongoProperties.getOrganizationId());
    }

    public Consultation createConsultation(Consultation consultation) {
        consultation.setOrganizationId(mongoProperties.getOrganizationId());
        consultation.setMode("online");
        return consultationRepository.save(consultation);
    }

    public Consultation getConsultationById(String id) {
        return consultationRepository.findById(id)
                .filter(c -> mongoProperties.getOrganizationId().equals(c.getOrganizationId()))
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + id));
    }
}
