package com.example.ps.controller;

import com.example.ps.dto.LogRequest;
import com.example.ps.entities.Log;
import com.example.ps.security.JwtUtil;
import com.example.ps.service.LogService;
import com.example.ps.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
<<<<<<< HEAD

=======
>>>>>>> 42135d9 (added MQTT)
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import static org.springframework.http.HttpStatus.FORBIDDEN;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/logs")
public class LogController {

    private final LogService logService;
    private final JwtUtil jwtService;
    private final NotificationService notificationService;

    private final List<SseEmitter> logEmitters = new CopyOnWriteArrayList<>();

    @Autowired
    public LogController(LogService logService, JwtUtil jwtService, NotificationService notificationService) {
        this.logService = logService;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Log>> getAllLogs() {
        return ResponseEntity.ok(logService.getAllLogs());
    }

    @GetMapping("/{robotId}")
    public ResponseEntity<List<Log>> getLogsByRobot(@PathVariable Long robotId) {
        return ResponseEntity.ok(logService.getLogsByRobotId(robotId));
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamLogs(@RequestParam String token) {
        if (!jwtService.isTokenValid(token)) {
            throw new ResponseStatusException(FORBIDDEN, "Invalid token");
        }

        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
<<<<<<< HEAD
        logEmitters.add(emitter);

        emitter.onCompletion(() -> logEmitters.remove(emitter));
        emitter.onTimeout(() -> logEmitters.remove(emitter));
=======
        com.example.ps.mqtt.MqttMessageHandler.addEmitter(emitter);

        emitter.onCompletion(() -> com.example.ps.mqtt.MqttMessageHandler.removeEmitter(emitter));
        emitter.onTimeout(() -> com.example.ps.mqtt.MqttMessageHandler.removeEmitter(emitter));
        emitter.onError(e -> com.example.ps.mqtt.MqttMessageHandler.removeEmitter(emitter));
>>>>>>> 42135d9 (added MQTT)

        return emitter;
    }

<<<<<<< HEAD
=======


>>>>>>> 42135d9 (added MQTT)
    @PostMapping
    public ResponseEntity<Log> receiveLog(@RequestBody LogRequest request, @RequestParam String token) {
        if (!jwtService.isTokenValid(token)) {
            throw new ResponseStatusException(FORBIDDEN, "Invalid token");
        }

        Log savedLog = logService.saveLog(
                request.robotId,
                request.message,
                request.type,
                request.timestamp
        );
        if ("ERROR".equalsIgnoreCase(request.type)) {
            notificationService.createNotification("Error from Robot ID " + request.robotId + ": " + request.message);
        }

        for (SseEmitter emitter : logEmitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("log")
                        .data(savedLog));
            } catch (Exception e) {
                logEmitters.remove(emitter);
            }
        }

        return ResponseEntity.ok(savedLog);
    }




    private Process currentProcess;

    @PostMapping("/run")
    public ResponseEntity<String> runScript(@RequestBody Boolean status) {
        if (status) {
            if (currentProcess != null && currentProcess.isAlive()) {
                return ResponseEntity.ok("Script already running");
            }
            try {
                ProcessBuilder pb = new ProcessBuilder("python3", "src/main/resources/scripts/script.py");
                currentProcess = pb.start();
                return ResponseEntity.ok("Script started");
            } catch (IOException e) {
                return ResponseEntity.status(500).body("Error starting script: " + e.getMessage());
            }
        } else {
            if (currentProcess != null && currentProcess.isAlive()) {
                currentProcess.destroy();
                return ResponseEntity.ok("Script stopped because robot is inactive");
            } else {
                return ResponseEntity.ok("No script is running");
            }
        }
    }
    @DeleteMapping("/robot/{robotId}")
    public ResponseEntity<Void> deleteLogsByRobot(@PathVariable Long robotId) {
        logService.deleteLogsByRobotId(robotId);
        return ResponseEntity.noContent().build();
    }


}

