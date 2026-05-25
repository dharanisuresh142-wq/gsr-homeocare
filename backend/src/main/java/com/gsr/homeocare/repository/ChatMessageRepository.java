package com.gsr.homeocare.repository;

import com.gsr.homeocare.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findByOrganizationIdAndThreadIdOrderBySentAtAsc(String organizationId, String threadId);

    List<ChatMessage> findByOrganizationIdOrderBySentAtDesc(String organizationId);
}
