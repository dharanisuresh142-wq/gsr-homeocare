package com.gsr.homeocare.auth;

import com.gsr.homeocare.model.UserRole;

import java.time.Instant;

public class AuthSession {

    private final String token;
    private final String userId;
    private final String name;
    private final String phone;
    private final UserRole role;
    private final Instant expiresAt;

    public AuthSession(String token, String userId, String name, String phone, UserRole role, Instant expiresAt) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.role = role;
        this.expiresAt = expiresAt;
    }

    public String getToken() {
        return token;
    }

    public String getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getPhone() {
        return phone;
    }

    public UserRole getRole() {
        return role;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
}
