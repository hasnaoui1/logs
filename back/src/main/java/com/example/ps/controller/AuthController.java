package com.example.ps.controller;

import com.example.ps.dto.AuthResponse;
import com.example.ps.dto.LoginRequest;
import com.example.ps.dto.SignupRequest;
import com.example.ps.security.JwtAuthFilter;
import com.example.ps.security.JwtUtil;
import com.example.ps.service.UserService;
import lombok.*;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")

@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final JwtAuthFilter jwtAuthFilter;

    @CrossOrigin(origins = "http://localhost:5173")



    @PostMapping("/signup")

    public String signup(@RequestBody SignupRequest request) {
        userService.signup(request.getEmail(), request.getPassword());
        return "User registered successfully";
    }




    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            UserDetails user = (UserDetails) authentication.getPrincipal();
            String token = jwtUtil.generateToken(user);

            return ResponseEntity.ok(new AuthResponse(token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }catch (InternalAuthenticationServiceException e) {
            return ResponseEntity.status(404).body("Email not found");
        }
    }




    @GetMapping("/info")
    public ResponseEntity<String> info() {

        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext()
                .getAuthentication()
                .getPrincipal();

        return ResponseEntity.ok( userDetails.getUsername());
    }

}

