package com.gsr.homeocare.controller;

import com.gsr.homeocare.model.Prescription;
import com.gsr.homeocare.service.PrescriptionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "*")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    @GetMapping
    public ResponseEntity<List<Prescription>> list(@RequestParam(required = false) String phone) {
        if (phone != null && !phone.isBlank()) {
            return ResponseEntity.ok(prescriptionService.listByPhone(phone));
        }
        return ResponseEntity.ok(prescriptionService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> get(@PathVariable String id) {
        return ResponseEntity.ok(prescriptionService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Prescription> create(@Valid @RequestBody Prescription prescription) {
        return ResponseEntity.status(HttpStatus.CREATED).body(prescriptionService.create(prescription));
    }
}
