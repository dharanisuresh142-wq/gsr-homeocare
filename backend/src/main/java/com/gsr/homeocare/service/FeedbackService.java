package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.model.Feedback;
import com.gsr.homeocare.repository.FeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final MongoProperties mongoProperties;

    public FeedbackService(FeedbackRepository feedbackRepository, MongoProperties mongoProperties) {
        this.feedbackRepository = feedbackRepository;
        this.mongoProperties = mongoProperties;
    }

    public List<Feedback> listAll() {
        return feedbackRepository.findByOrganizationIdOrderByCreatedAtDesc(mongoProperties.getOrganizationId());
    }

    public List<Feedback> listByPhone(String phone) {
        return feedbackRepository.findByOrganizationIdAndPatientPhoneOrderByCreatedAtDesc(
                mongoProperties.getOrganizationId(), normalizePhone(phone));
    }

    public Feedback create(Feedback feedback) {
        feedback.setOrganizationId(mongoProperties.getOrganizationId());
        feedback.setPatientPhone(normalizePhone(feedback.getPatientPhone()));
        if (feedback.getCreatedAt() == null) {
            feedback.setCreatedAt(LocalDateTime.now());
        }
        return feedbackRepository.save(feedback);
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("\\s+", "").trim();
    }
}
