package com.gsr.homeocare.controller;

import com.gsr.homeocare.auth.AuthContext;
import com.gsr.homeocare.auth.AuthSession;
import com.gsr.homeocare.dto.ChatSendRequest;
import com.gsr.homeocare.exception.ForbiddenException;
import com.gsr.homeocare.model.ChatMessage;
import com.gsr.homeocare.model.UserRole;
import com.gsr.homeocare.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public ResponseEntity<List<ChatMessage>> getMessages(@RequestParam String phone) {
        assertCanAccessThread(phone);
        return ResponseEntity.ok(chatService.getThreadMessages(phone));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<Map<String, Object>>> inbox() {
        requireAdmin();
        return ResponseEntity.ok(chatService.getInboxThreads());
    }

    @PostMapping
    public ResponseEntity<ChatMessage> send(@Valid @RequestBody ChatSendRequest request) {
        String role = resolveSenderRole(request.getPhone());
        ChatMessage saved = chatService.sendMessage(request, role);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private String resolveSenderRole(String phone) {
        AuthSession session = AuthContext.get();
        if (session == null) {
            return "CUSTOMER";
        }
        if (session.getRole() == UserRole.ADMIN) {
            return "ADMIN";
        }
        if (session.getPhone() != null
                && ChatService.normalizeThreadId(session.getPhone()).equals(ChatService.normalizeThreadId(phone))) {
            return "CUSTOMER";
        }
        throw new ForbiddenException("You can only send messages from your own phone number");
    }

    private void assertCanAccessThread(String phone) {
        AuthSession session = AuthContext.get();
        if (session == null) {
            return; // customer chat page uses phone only
        }
        if (session.getRole() == UserRole.ADMIN) {
            return;
        }
        if (session.getPhone() != null
                && ChatService.normalizeThreadId(session.getPhone()).equals(ChatService.normalizeThreadId(phone))) {
            return;
        }
        throw new ForbiddenException("You can only view your own chat");
    }

    private void requireAdmin() {
        AuthSession session = AuthContext.get();
        if (session == null || session.getRole() != UserRole.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }
    }
}
