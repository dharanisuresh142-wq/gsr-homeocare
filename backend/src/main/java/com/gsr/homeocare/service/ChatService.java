package com.gsr.homeocare.service;

import com.gsr.homeocare.config.MongoProperties;
import com.gsr.homeocare.dto.ChatSendRequest;
import com.gsr.homeocare.model.ChatMessage;
import com.gsr.homeocare.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final MongoProperties mongoProperties;

    public ChatService(ChatMessageRepository chatMessageRepository, MongoProperties mongoProperties) {
        this.chatMessageRepository = chatMessageRepository;
        this.mongoProperties = mongoProperties;
    }

    public static String normalizeThreadId(String phone) {
        return phone.replaceAll("\\s+", "").trim();
    }

    public List<ChatMessage> getThreadMessages(String phone) {
        String threadId = normalizeThreadId(phone);
        return chatMessageRepository.findByOrganizationIdAndThreadIdOrderBySentAtAsc(
                mongoProperties.getOrganizationId(), threadId);
    }

    public List<Map<String, Object>> getInboxThreads() {
        return chatMessageRepository.findByOrganizationIdOrderBySentAtDesc(mongoProperties.getOrganizationId())
                .stream()
                .collect(Collectors.groupingBy(ChatMessage::getThreadId, LinkedHashMap::new, Collectors.toList()))
                .entrySet()
                .stream()
                .map(entry -> {
                    ChatMessage latest = entry.getValue().stream()
                            .max(Comparator.comparing(ChatMessage::getSentAt))
                            .orElse(entry.getValue().get(0));
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("threadId", entry.getKey());
                    row.put("lastMessage", latest.getMessage());
                    row.put("senderName", latest.getSenderName());
                    row.put("sentAt", latest.getSentAt());
                    row.put("count", entry.getValue().size());
                    return row;
                })
                .toList();
    }

    public ChatMessage sendMessage(ChatSendRequest request, String senderRole) {
        ChatMessage msg = new ChatMessage();
        msg.setOrganizationId(mongoProperties.getOrganizationId());
        msg.setThreadId(normalizeThreadId(request.getPhone()));
        msg.setSenderName(request.getName().trim());
        msg.setSenderRole(senderRole);
        msg.setChannel(request.getChannel() != null ? request.getChannel() : "APP");
        msg.setMessage(request.getMessage().trim());
        msg.setSentAt(Instant.now());
        return chatMessageRepository.save(msg);
    }
}
