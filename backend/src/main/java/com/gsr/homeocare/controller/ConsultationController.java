package com.gsr.homeocare.controller;

import com.gsr.homeocare.model.Consultation;
import com.gsr.homeocare.model.PaymentStatus;
import com.gsr.homeocare.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultations")
@CrossOrigin(origins = "*")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }

    @GetMapping
    public ResponseEntity<List<Consultation>> getConsultations(@RequestParam(required = false) String phone) {
        if (phone != null && !phone.isBlank()) {
            return ResponseEntity.ok(consultationService.getByPhone(phone));
        }
        return ResponseEntity.ok(consultationService.getAllConsultations());
    }

    @PostMapping
    public ResponseEntity<Consultation> createConsultation(@Valid @RequestBody Consultation consultation) {
        Consultation saved = consultationService.createConsultation(consultation);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/book")
    public ResponseEntity<Consultation> bookWithPayment(@RequestBody Map<String, Object> body) {
        Consultation c = new Consultation();
        c.setName(String.valueOf(body.get("name")));
        c.setPhone(String.valueOf(body.get("phone")));
        c.setProblem(String.valueOf(body.get("problem")));
        c.setDate(java.time.LocalDate.parse(String.valueOf(body.get("date"))));
        if (body.get("doctorName") != null) {
            c.setDoctorName(String.valueOf(body.get("doctorName")));
        }
        if (body.get("consultationFee") != null) {
            c.setConsultationFee(Double.valueOf(String.valueOf(body.get("consultationFee"))));
        }
        if (body.get("paymentMethod") != null) {
            c.setPaymentMethod(String.valueOf(body.get("paymentMethod")));
        }
        boolean payNow = Boolean.TRUE.equals(body.get("payNow"));
        c.setPaymentStatus(payNow ? PaymentStatus.Paid : PaymentStatus.Pending);
        Consultation saved = consultationService.createConsultation(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Consultation> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(consultationService.updateConsultation(id, body));
    }
}
