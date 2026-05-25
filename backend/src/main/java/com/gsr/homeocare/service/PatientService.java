package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.dto.PatientDetail;
import com.gsr.homeocare.dto.PatientSummary;
import com.gsr.homeocare.model.Consultation;
import com.gsr.homeocare.model.Order;
import com.gsr.homeocare.model.User;
import com.gsr.homeocare.repository.ConsultationRepository;
import com.gsr.homeocare.repository.OrderRepository;
import com.gsr.homeocare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final UserRepository userRepository;
    private final ConsultationRepository consultationRepository;
    private final OrderRepository orderRepository;
    private final PrescriptionService prescriptionService;
    private final FollowUpService followUpService;
    private final FeedbackService feedbackService;
    private final MongoProperties mongoProperties;

    public PatientService(
            UserRepository userRepository,
            ConsultationRepository consultationRepository,
            OrderRepository orderRepository,
            PrescriptionService prescriptionService,
            FollowUpService followUpService,
            FeedbackService feedbackService,
            MongoProperties mongoProperties) {
        this.userRepository = userRepository;
        this.consultationRepository = consultationRepository;
        this.orderRepository = orderRepository;
        this.prescriptionService = prescriptionService;
        this.followUpService = followUpService;
        this.feedbackService = feedbackService;
        this.mongoProperties = mongoProperties;
    }

    public List<PatientSummary> listPatients() {
        String orgId = mongoProperties.getOrganizationId();
        Map<String, PatientSummary> map = new LinkedHashMap<>();

        for (User user : userRepository.findByOrganizationId(orgId)) {
            if (user.getPhone() == null) continue;
            String phone = normalize(user.getPhone());
            map.put(phone, new PatientSummary(phone, user.getName(), user.getEmail(), 0, 0, 0));
        }

        for (Consultation c : consultationRepository.findByOrganizationIdOrderByDateDesc(orgId)) {
            String phone = normalize(c.getPhone());
            PatientSummary s = map.computeIfAbsent(phone, p -> new PatientSummary(p, c.getName(), null, 0, 0, 0));
            if (s.getName() == null || s.getName().isBlank()) s.setName(c.getName());
            s.setConsultationCount(s.getConsultationCount() + 1);
        }

        for (Order o : orderRepository.findByOrganizationIdOrderByCreatedAtDesc(orgId)) {
            if (o.getPhone() == null) continue;
            String phone = normalize(o.getPhone());
            PatientSummary s = map.computeIfAbsent(phone, p -> new PatientSummary(p, o.getCustomerName(), o.getEmail(), 0, 0, 0));
            if (s.getName() == null || s.getName().isBlank()) s.setName(o.getCustomerName());
            s.setOrderCount(s.getOrderCount() + 1);
        }

        for (var p : prescriptionService.listAll()) {
            String phone = normalize(p.getPatientPhone());
            PatientSummary s = map.computeIfAbsent(phone, ph -> new PatientSummary(ph, p.getPatientName(), null, 0, 0, 0));
            s.setPrescriptionCount(s.getPrescriptionCount() + 1);
        }

        return map.values().stream()
                .sorted(Comparator.comparing(PatientSummary::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .collect(Collectors.toList());
    }

    public PatientDetail getPatientDetail(String phone) {
        String normalized = normalize(phone);
        String orgId = mongoProperties.getOrganizationId();

        PatientDetail detail = new PatientDetail();
        detail.setPhone(normalized);

        userRepository.findByPhoneAndOrganizationId(normalized, orgId).ifPresent(u -> {
            detail.setName(u.getName());
            detail.setEmail(u.getEmail());
        });

        List<Consultation> consultations = consultationRepository
                .findByOrganizationIdAndPhoneOrderByDateDesc(orgId, normalized);
        detail.setConsultations(consultations);
        if ((detail.getName() == null || detail.getName().isBlank()) && !consultations.isEmpty()) {
            detail.setName(consultations.get(0).getName());
        }

        List<Order> orders = orderRepository.findByOrganizationIdAndPhoneOrderByCreatedAtDesc(orgId, normalized);
        detail.setOrders(orders);

        detail.setPrescriptions(prescriptionService.listByPhone(normalized));
        detail.setFollowUps(followUpService.listByPhone(normalized));
        detail.setFeedback(feedbackService.listByPhone(normalized));

        return detail;
    }

    private String normalize(String phone) {
        return phone == null ? "" : phone.replaceAll("\\s+", "").trim();
    }
}
