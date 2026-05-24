package com.gsr.homeocare.controller;

import com.gsr.homeocare.config.MongoProperties;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class HealthController {

    private final MongoTemplate mongoTemplate;
    private final MongoProperties mongoProperties;

    public HealthController(MongoTemplate mongoTemplate, MongoProperties mongoProperties) {
        this.mongoTemplate = mongoTemplate;
        this.mongoProperties = mongoProperties;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", "UP");
        body.put("application", "GSR Homeocare System");
        body.put("organizationId", mongoProperties.getOrganizationId());

        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            body.put("database", "CONNECTED");
            body.put("databaseProduct", "MongoDB");
            body.put("databaseName", mongoTemplate.getDb().getName());
        } catch (Exception e) {
            body.put("database", "DISCONNECTED");
            body.put("databaseError", e.getMessage());
            return ResponseEntity.status(503).body(body);
        }

        return ResponseEntity.ok(body);
    }
}
