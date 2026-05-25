package com.gsr.homeocare.controller;

import com.gsr.homeocare.dto.PatientDetail;
import com.gsr.homeocare.dto.PatientSummary;
import com.gsr.homeocare.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "*")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    public ResponseEntity<List<PatientSummary>> list() {
        return ResponseEntity.ok(patientService.listPatients());
    }

    @GetMapping("/{phone}")
    public ResponseEntity<PatientDetail> detail(@PathVariable String phone) {
        return ResponseEntity.ok(patientService.getPatientDetail(phone));
    }
}
