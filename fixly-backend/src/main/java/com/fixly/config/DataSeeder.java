package com.fixly.config;

import com.fixly.model.ServiceCategory;
import com.fixly.repository.ServiceCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final ServiceCategoryRepository repository;

    public DataSeeder(ServiceCategoryRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) return;

        repository.save(new ServiceCategory("Electrical", "fa-solid fa-bolt"));
        repository.save(new ServiceCategory("Plumbing", "fa-solid fa-faucet-drip"));
        repository.save(new ServiceCategory("Cleaning", "fa-solid fa-broom"));
        repository.save(new ServiceCategory("AC Repair", "fa-solid fa-snowflake"));
        repository.save(new ServiceCategory("Painting", "fa-solid fa-paint-roller"));
        repository.save(new ServiceCategory("Carpentry", "fa-solid fa-hammer"));
        repository.save(new ServiceCategory("Pest Control", "fa-solid fa-bug"));
        repository.save(new ServiceCategory("Appliance Repair", "fa-solid fa-blender"));
    }
}
