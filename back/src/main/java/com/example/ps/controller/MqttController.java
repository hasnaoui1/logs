package com.example.ps.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.MessageChannel;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mqtt")
@RequiredArgsConstructor
public class MqttController {

    private final MessageChannel mqttOutboundChannel;

    @PostMapping("/publish")
    public String publish(@RequestParam String message) {
        mqttOutboundChannel.send(MessageBuilder.withPayload(message).build());
        return "Message published: " + message;
    }
}
