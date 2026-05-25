package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.exception.ResourceNotFoundException;
import com.gsr.homeocare.model.Consultation;
import com.gsr.homeocare.model.PaymentStatus;
import com.gsr.homeocare.repository.ConsultationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class ConsultationService {

    public static final String DEFAULT_DOCTOR = "Dr. GSR Teja";
    public static final double DEFAULT_FEE = 500.0;

    private final ConsultationRepository consultationRepository;
    private final MongoProperties mongoProperties;

    public ConsultationService(ConsultationRepository consultationRepository, MongoProperties mongoProperties) {
        this.consultationRepository = consultationRepository;
        this.mongoProperties = mongoProperties;
    }

    public List<Consultation> getAllConsultations() {
        return consultationRepository.findByOrganizationIdOrderByDateDesc(mongoProperties.getOrganizationId());
    }

    public List<Consultation> getByPhone(String phone) {
        return consultationRepository.findByOrganizationIdAndPhoneOrderByDateDesc(
                mongoProperties.getOrganizationId(), normalizePhone(phone));
    }

    public Consultation createConsultation(Consultation consultation) {
        consultation.setOrganizationId(mongoProperties.getOrganizationId());
        consultation.setMode("online");
        consultation.setPhone(normalizePhone(consultation.getPhone()));
        if (consultation.getDoctorName() == null || consultation.getDoctorName().isBlank()) {
            consultation.setDoctorName(DEFAULT_DOCTOR);
        }
        if (consultation.getConsultationFee() == null) {
            consultation.setConsultationFee(DEFAULT_FEE);
        }
        if (consultation.getPaymentStatus() == null) {
            consultation.setPaymentStatus(PaymentStatus.Pending);
        }
        return consultationRepository.save(consultation);
    }

    public Consultation getConsultationById(String id) {
        return consultationRepository.findById(id)
                .filter(c -> mongoProperties.getOrganizationId().equals(c.getOrganizationId()))
                .orElseThrow(() -> new ResourceNotFoundException("Consultation not found with id: " + id));
    }

    public Consultation updateConsultation(String id, Map<String, Object> body) {
        Consultation c = getConsultationById(id);
        if (body.containsKey("doctorName")) {
            c.setDoctorName(String.valueOf(body.get("doctorName")));
        }
        if (body.containsKey("nextFollowUpDate") && body.get("nextFollowUpDate") != null) {
            c.setNextFollowUpDate(java.time.LocalDate.parse(String.valueOf(body.get("nextFollowUpDate"))));
        }
        if (body.containsKey("paymentStatus")) {
            c.setPaymentStatus(PaymentStatus.valueOf(String.valueOf(body.get("paymentStatus"))));
        }
        if (body.containsKey("consultationFee")) {
            c.setConsultationFee(Double.valueOf(String.valueOf(body.get("consultationFee"))));
        }
        return consultationRepository.save(c);
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.replaceAll("\\s+", "").trim();
    }
}
