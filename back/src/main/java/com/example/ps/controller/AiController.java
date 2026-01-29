package com.example.ps.controller;

import com.example.ps.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final AiService aiService;

    @PostMapping("/analyze")
    public ResponseEntity<String> analyzeLogs(@RequestParam("file") MultipartFile file) {
        try {
            String content = new BufferedReader(
                    new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))
                    .lines()
                    .collect(Collectors.joining("\n"));

            String analysis = aiService.analyzeLogs(content);
            return ResponseEntity.ok(analysis);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"Failed to read file\"}");
        }
    }
}
