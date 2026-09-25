package com.fixly.controller;

import com.fixly.model.Provider;
import com.fixly.repository.ProviderRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    private final ProviderRepository providerRepository;

    public ProviderController(ProviderRepository providerRepository) {
        this.providerRepository = providerRepository;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) Long serviceCategoryId) {
        List<Provider> providers = serviceCategoryId != null
                ? providerRepository.findByServiceCategoryId(serviceCategoryId)
                : providerRepository.findAll();

        return providers.stream().map(this::toDto).collect(Collectors.toList());
    }

    private Map<String, Object> toDto(Provider p) {
        return Map.of(
                "id", p.getId(),
                "name", p.getUser().getName(),
                "serviceCategory", p.getServiceCategory().getName(),
                "city", p.getCity() == null ? "" : p.getCity(),
                "rating", p.getRating(),
                "jobsCompleted", p.getJobsCompleted(),
                "available", p.getAvailable()
        );
    }
}
