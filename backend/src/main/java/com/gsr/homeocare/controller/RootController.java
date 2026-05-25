package com.gsr.homeocare.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("service", "GSR Homeocare API");
        body.put("status", "running");
        body.put("message", "This is the backend API only. Open your website on Netlify, not this URL.");
        body.put("healthCheck", "/api/health");
        body.put("websiteNote", "Deploy frontend to Netlify — e.g. https://gsr-homeocare.netlify.app");
        return ResponseEntity.ok(body);
    }
}
