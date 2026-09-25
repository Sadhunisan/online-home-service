package com.fixly.controller;

import com.fixly.config.JwtUtil;
import com.fixly.dto.AuthResponse;
import com.fixly.dto.LoginRequest;
import com.fixly.dto.RegisterRequest;
import com.fixly.model.Provider;
import com.fixly.model.Role;
import com.fixly.model.ServiceCategory;
import com.fixly.model.User;
import com.fixly.repository.ProviderRepository;
import com.fixly.repository.ServiceCategoryRepository;
import com.fixly.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository,
                           ProviderRepository providerRepository,
                           ServiceCategoryRepository serviceCategoryRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "An account with that email already exists."));
        }

        Role role;
        try {
            role = Role.valueOf(req.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "role must be CUSTOMER or PROVIDER"));
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user.setRole(role);
        userRepository.save(user);

        if (role == Role.PROVIDER) {
            if (req.getServiceCategoryId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "serviceCategoryId is required for providers"));
            }
            ServiceCategory category = serviceCategoryRepository.findById(req.getServiceCategoryId())
                    .orElse(null);
            if (category == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Unknown serviceCategoryId"));
            }
            Provider provider = new Provider();
            provider.setUser(user);
            provider.setServiceCategory(category);
            provider.setCity(req.getCity());
            providerRepository.save(provider);
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getName(), user.getRole().name()));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail()).orElse(null);
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId(), user.getRole().name());
        return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getName(), user.getRole().name()));
    }
}
