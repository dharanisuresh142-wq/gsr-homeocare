package com.gsr.homeocare.auth;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class AuthTokenStore {

    private final Map<String, AuthSession> sessions = new ConcurrentHashMap<>();

    public void save(AuthSession session) {
        sessions.put(session.getToken(), session);
    }

    public Optional<AuthSession> find(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        AuthSession session = sessions.get(token);
        if (session == null) {
            return Optional.empty();
        }
        if (session.isExpired()) {
            sessions.remove(token);
            return Optional.empty();
        }
        return Optional.of(session);
    }

    public void remove(String token) {
        if (token != null) {
            sessions.remove(token);
        }
    }
}
