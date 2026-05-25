package com.gsr.homeocare.controller;

import com.gsr.homeocare.model.FollowUp;
import com.gsr.homeocare.service.FollowUpService;
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
@RequestMapping("/api/followups")
@CrossOrigin(origins = "*")
public class FollowUpController {

    private final FollowUpService followUpService;

    public FollowUpController(FollowUpService followUpService) {
        this.followUpService = followUpService;
    }

    @GetMapping
    public ResponseEntity<List<FollowUp>> list(@RequestParam(required = false) String phone) {
        if (phone != null && !phone.isBlank()) {
            return ResponseEntity.ok(followUpService.listByPhone(phone));
        }
        return ResponseEntity.ok(followUpService.listAll());
    }

    @PostMapping
    public ResponseEntity<FollowUp> create(@Valid @RequestBody FollowUp followUp) {
        return ResponseEntity.status(HttpStatus.CREATED).body(followUpService.create(followUp));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FollowUp> update(@PathVariable String id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(followUpService.update(id, body));
    }
}
