package com.example.ps.dto;

import java.time.LocalDateTime;

public record LogResponse(
        Long id,
        String message,
        String type,
        LocalDateTime timestamp,
        Long robotId,
        Long sessionId) {
}
