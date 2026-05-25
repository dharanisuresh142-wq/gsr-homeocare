package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.exception.ResourceNotFoundException;
import com.gsr.homeocare.model.FollowUp;
import com.gsr.homeocare.repository.FollowUpRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FollowUpService {

    private final FollowUpRepository followUpRepository;
    private final MongoProperties mongoProperties;

    public FollowUpService(FollowUpRepository followUpRepository, MongoProperties mongoProperties) {
        this.followUpRepository = followUpRepository;
        this.mongoProperties = mongoProperties;
    }

    public List<FollowUp> listAll() {
        return followUpRepository.findByOrganizationIdOrderByScheduledDateAsc(mongoProperties.getOrganizationId());
    }

    public List<FollowUp> listByPhone(String phone) {
        return followUpRepository.findByOrganizationIdAndPatientPhoneOrderByScheduledDateAsc(
                mongoProperties.getOrganizationId(), normalizePhone(phone));
    }

    public FollowUp create(FollowUp followUp) {
        followUp.setOrganizationId(mongoProperties.getOrganizationId());
        followUp.setPatientPhone(normalizePhone(followUp.getPatientPhone()));
        if (followUp.getStatus() == null || followUp.getStatus().isBlank()) {
            followUp.setStatus("Scheduled");
        }
        return followUpRepository.save(followUp);
    }

    public FollowUp update(String id, Map<String, String> body) {
        FollowUp existing = followUpRepository.findById(id)
                .filter(f -> mongoProperties.getOrganizationId().equals(f.getOrganizationId()))
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up not found"));
        if (body.containsKey("status")) {
            existing.setStatus(body.get("status"));
        }
        if (body.containsKey("notes")) {
            existing.setNotes(body.get("notes"));
        }
        if (body.containsKey("doctorName")) {
            existing.setDoctorName(body.get("doctorName"));
        }
        return followUpRepository.save(existing);
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("\\s+", "").trim();
    }
}
