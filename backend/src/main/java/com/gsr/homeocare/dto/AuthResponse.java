package com.gsr.homeocare.dto;

import com.gsr.homeocare.model.UserRole;

public class AuthResponse {

    private String token;
    private String userId;
    private String name;
    private String phone;
    private UserRole role;

    public AuthResponse(String token, String userId, String name, String phone, UserRole role) {
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.role = role;
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
}
