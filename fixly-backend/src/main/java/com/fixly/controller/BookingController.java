package com.fixly.controller;

import com.fixly.dto.BookingRequest;
import com.fixly.dto.StatusUpdateRequest;
import com.fixly.model.*;
import com.fixly.repository.BookingRepository;
import com.fixly.repository.ProviderRepository;
import com.fixly.repository.ServiceCategoryRepository;
import com.fixly.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;

    public BookingController(BookingRepository bookingRepository,
                              UserRepository userRepository,
                              ProviderRepository providerRepository,
                              ServiceCategoryRepository serviceCategoryRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.providerRepository = providerRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
    }

    // The JwtAuthFilter sets principal = email, credentials = userId
    private User currentUser(Authentication auth) {
        String email = (String) auth.getPrincipal();
        return userRepository.findByEmail(email).orElseThrow();
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody BookingRequest req, Authentication auth) {
        User customer = currentUser(auth);

        ServiceCategory category = serviceCategoryRepository.findById(req.getServiceCategoryId()).orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unknown serviceCategoryId"));
        }

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setServiceCategory(category);
        booking.setAddress(req.getAddress());
        booking.setNotes(req.getNotes());
        booking.setPreferredDate(req.getPreferredDate());
        booking.setPreferredTime(req.getPreferredTime());
        booking.setStatus(BookingStatus.PENDING);

        // Auto-assign the first available provider in that category (simple matching for now)
        List<Provider> matches = providerRepository.findByServiceCategoryId(category.getId());
        matches.stream().filter(Provider::getAvailable).findFirst().ifPresent(p -> {
            booking.setProvider(p);
            booking.setStatus(BookingStatus.CONFIRMED);
        });

        bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(booking));
    }

    @GetMapping("/my")
    public List<Map<String, Object>> myBookings(Authentication auth) {
        User user = currentUser(auth);

        if (user.getRole() == Role.PROVIDER) {
            Provider provider = providerRepository.findByUserId(user.getId()).orElse(null);
            if (provider == null) return List.of();
            return bookingRepository.findByProviderIdOrderByCreatedAtDesc(provider.getId())
                    .stream().map(this::toDto).collect(Collectors.toList());
        }

        return bookingRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                           @Valid @RequestBody StatusUpdateRequest req,
                                           Authentication auth) {
        User user = currentUser(auth);
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Booking not found"));
        }

        boolean isOwner = booking.getCustomer().getId().equals(user.getId());
        boolean isAssignedProvider = booking.getProvider() != null
                && booking.getProvider().getUser().getId().equals(user.getId());

        if (!isOwner && !isAssignedProvider) {
            return ResponseEntity.status(403).body(Map.of("error", "Not authorized to update this booking"));
        }

        try {
            booking.setStatus(BookingStatus.valueOf(req.getStatus().toUpperCase()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
        }

        bookingRepository.save(booking);
        return ResponseEntity.ok(toDto(booking));
    }

    private Map<String, Object> toDto(Booking b) {
        return Map.of(
                "id", b.getId(),
                "service", b.getServiceCategory().getName(),
                "provider", b.getProvider() == null ? "Not yet assigned" : b.getProvider().getUser().getName(),
                "address", b.getAddress(),
                "notes", b.getNotes() == null ? "" : b.getNotes(),
                "preferredDate", b.getPreferredDate() == null ? "" : b.getPreferredDate(),
                "preferredTime", b.getPreferredTime() == null ? "" : b.getPreferredTime(),
                "status", b.getStatus().name(),
                "createdAt", b.getCreatedAt().toString()
        );
    }
}
