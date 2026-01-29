package com.example.ps.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AiService {

        @Value("${gemini.api.key}")
        private String apiKey;

        private final RestTemplate restTemplate = new RestTemplate();

        public String analyzeLogs(String logs) {
                String safeKey = apiKey != null ? apiKey.trim() : "";

                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                                + safeKey;

                // ---------- Request Body ----------
                Map<String, Object> part = new HashMap<>();
                part.put(
                                "text",
                                "You are an expert Robot System Diagnostics AI. Analyze these logs deeply and provide a COMPREHENSIVE and DETAILED JSON response. "
                                                + "Use the following structure strictly as raw JSON (NO markdown): "
                                                + "{"
                                                + "\"sessions\":\"Detailed session lifecycle analysis with calculated total duration (HH:MM:SS)\","
                                                + "\"errors\":\"Root cause analysis or confirmation of correct behavior\","
                                                + "\"performance\":\"Latency and throughput analysis\","
                                                + "\"suggestedFixes\":\"Concrete technical fixes\""
                                                + "} "
                                                + "Logs:\n"
                                                + logs);

                Map<String, Object> content = new HashMap<>();
                content.put("parts", List.of(part));

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", List.of(content));

                // ---------- Headers ----------
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

                try {
                        return callGeminiApi(url, entity);
                } catch (Exception e) {
                        String errorMessage = e.getMessage() != null
                                        ? e.getMessage().replace("\"", "'").replace("\n", " ").replace("\r", " ")
                                        : "Unknown error";

                        return String.format(
                                        "{\"error\":\"Failed to analyze logs\",\"details\":\"%s\"}",
                                        errorMessage);
                }
        }

        private String callGeminiApi(String url, HttpEntity<Map<String, Object>> entity) {
                ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

                Map<String, Object> body = response.getBody();
                if (body == null || !body.containsKey("candidates")) {
                        throw new RuntimeException("Empty or invalid Gemini response");
                }

                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");

                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");

                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");

                return parts.get(0).get("text").toString();
        }
}
