package com.gsr.homeocare.service;

import com.gsr.homeocare.auth.AuthSession;
import com.gsr.homeocare.auth.AuthTokenStore;
import com.gsr.homeocare.config.AuthProperties;
import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.dto.AuthResponse;
import com.gsr.homeocare.dto.LoginRequest;
import com.gsr.homeocare.dto.RegisterRequest;
import com.gsr.homeocare.model.User;
import com.gsr.homeocare.model.UserRole;
import com.gsr.homeocare.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private static final long SESSION_HOURS = 24;

    private final UserRepository userRepository;
    private final AuthTokenStore tokenStore;
    private final PasswordEncoder passwordEncoder;
    private final AuthProperties authProperties;
    private final MongoProperties mongoProperties;

    public AuthService(
            UserRepository userRepository,
            AuthTokenStore tokenStore,
            PasswordEncoder passwordEncoder,
            AuthProperties authProperties,
            MongoProperties mongoProperties) {
        this.userRepository = userRepository;
        this.tokenStore = tokenStore;
        this.passwordEncoder = passwordEncoder;
        this.authProperties = authProperties;
        this.mongoProperties = mongoProperties;
    }

    public AuthResponse register(RegisterRequest request) {
        String phone = normalizePhone(request.getPhone());
        String orgId = mongoProperties.getOrganizationId();

        if (userRepository.findByPhoneAndOrganizationId(phone, orgId).isPresent()) {
            throw new IllegalArgumentException("Phone number already registered. Please login.");
        }

        User user = new User();
        user.setOrganizationId(orgId);
        user.setName(request.getName().trim());
        user.setPhone(phone);
        user.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.CUSTOMER);

        User saved = userRepository.save(user);
        return createSession(saved.getId(), saved.getName(), saved.getPhone(), UserRole.CUSTOMER);
    }

    public AuthResponse login(LoginRequest request) {
        if ("admin".equalsIgnoreCase(request.getLoginType())) {
            return loginAdmin(request);
        }
        return loginCustomer(request);
    }

    private AuthResponse loginAdmin(LoginRequest request) {
        String username = request.getUsername().trim();
        if (!authProperties.getAdminUsername().equals(username)
                || !authProperties.getAdminPassword().equals(request.getPassword())) {
            throw new IllegalArgumentException("Invalid admin username or password");
        }
        return createSession("admin", "GSR Admin", null, UserRole.ADMIN);
    }

    private AuthResponse loginCustomer(LoginRequest request) {
        String phone = normalizePhone(request.getUsername());
        String orgId = mongoProperties.getOrganizationId();

        User user = userRepository.findByPhoneAndOrganizationId(phone, orgId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid phone or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid phone or password");
        }

        return createSession(user.getId(), user.getName(), user.getPhone(), UserRole.CUSTOMER);
    }

    public void logout(String token) {
        tokenStore.remove(token);
    }

    public AuthResponse me(AuthSession session) {
        return new AuthResponse(
                session.getToken(),
                session.getUserId(),
                session.getName(),
                session.getPhone(),
                session.getRole()
        );
    }

    private AuthResponse createSession(String userId, String name, String phone, UserRole role) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(SESSION_HOURS * 3600);
        AuthSession session = new AuthSession(token, userId, name, phone, role, expiresAt);
        tokenStore.save(session);
        return new AuthResponse(token, userId, name, phone, role);
    }

    private String normalizePhone(String phone) {
        return phone.replaceAll("\\s+", "").trim();
    }
}
