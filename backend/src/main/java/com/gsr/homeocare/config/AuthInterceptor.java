package com.gsr.homeocare.config;

import com.gsr.homeocare.auth.AuthContext;
import com.gsr.homeocare.auth.AuthSession;
import com.gsr.homeocare.auth.AuthTokenStore;
import com.gsr.homeocare.exception.ForbiddenException;
import com.gsr.homeocare.exception.UnauthorizedException;
import com.gsr.homeocare.model.UserRole;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final AuthTokenStore tokenStore;

    public AuthInterceptor(AuthTokenStore tokenStore) {
        this.tokenStore = tokenStore;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (isPublic(path, method)) {
            return true;
        }

        if ("/api/auth/me".equals(path)) {
            AuthSession meSession = resolveSession(request);
            if (meSession == null) {
                throw new UnauthorizedException("Please login to continue");
            }
            AuthContext.set(meSession);
            return true;
        }

        AuthSession session = resolveSession(request);
        if (session == null) {
            throw new UnauthorizedException("Please login to continue");
        }
        AuthContext.set(session);

        if (requiresAdmin(path, method, request) && session.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }

        if (path.startsWith("/api/orders") && "GET".equals(method)) {
            String phone = request.getParameter("phone");
            if (phone != null && !phone.isBlank() && session.getRole() == UserRole.CUSTOMER) {
                String normalized = phone.replaceAll("\\s+", "").trim();
                if (session.getPhone() != null && !session.getPhone().equals(normalized)) {
                    throw new ForbiddenException("You can only view your own orders");
                }
            }
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        AuthContext.clear();
    }

    private boolean isPublic(String path, String method) {
        if ("/".equals(path) || path.startsWith("/api/health") || path.startsWith("/api/auth/")) {
            return true;
        }
        if (path.startsWith("/api/products") && "GET".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/orders") && "POST".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/consultations") && "POST".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/orders/") && "GET".equals(method)) {
            return true;
        }
        return false;
    }

    private boolean requiresAdmin(String path, String method, HttpServletRequest request) {
        if (path.startsWith("/api/products") && ("POST".equals(method) || "DELETE".equals(method))) {
            return true;
        }
        if (path.startsWith("/api/consultations") && "GET".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/orders") && "PUT".equals(method)) {
            return true;
        }
        if (path.startsWith("/api/orders") && "GET".equals(method)) {
            String phone = request.getParameter("phone");
            return phone == null || phone.isBlank();
        }
        return false;
    }

    private AuthSession resolveSession(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return tokenStore.find(header.substring(7)).orElse(null);
        }
        return null;
    }
}
