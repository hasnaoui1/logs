package com.example.ps.controller;

import com.example.ps.entities.Log;
import com.example.ps.service.LogService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageHandler;
import org.springframework.messaging.MessagingException;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
@RequiredArgsConstructor
public class MqttMessageHandler implements MessageHandler {

    private final LogService logService;

    private static final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public static void addEmitter(SseEmitter emitter) {
        emitters.add(emitter);
    }

    public static void removeEmitter(SseEmitter emitter) {
        emitters.remove(emitter);
    }

    @Override
    public void handleMessage(Message<?> message) throws MessagingException {
        String payload = message.getPayload().toString();
        System.out.println("📩 MQTT RECEIVED: " + payload);

        String[] parts = payload.split("\\|", 3);

        Long robotId = Long.parseLong(parts[0]);
        String timestampStr = parts[1];
        String fullMessage = parts[2];

        // Extract log type between brackets: [INFO], [ERROR], [WARNING], [EVENT]
        String logType = "INFO"; // default fallback
        String logMessage = fullMessage;

        if (fullMessage.startsWith("[") && fullMessage.contains("]")) {
            int endIndex = fullMessage.indexOf("]");
            logType = fullMessage.substring(1, endIndex); // removes brackets
            logMessage = fullMessage.substring(endIndex + 2); // skip "] "
        }

        Log log = logService.saveLog(
                robotId,
                logMessage,
                logType,
                LocalDateTime.now());

        // SSE dispatch
        com.example.ps.dto.LogResponse response = new com.example.ps.dto.LogResponse(
                log.getId(),
                log.getMessage(),
                log.getType(),
                log.getTimestamp(),
                log.getRobot() != null ? log.getRobot().getId() : null,
                log.getSession() != null ? log.getSession().getId() : null);

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name("log").data(response));
            } catch (Exception e) {
                emitters.remove(emitter);
            }
        }
    }

}
