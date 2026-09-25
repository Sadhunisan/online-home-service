package com.fixly.controller;

import com.fixly.model.ServiceCategory;
import com.fixly.repository.ServiceCategoryRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceCategoryController {

    private final ServiceCategoryRepository repository;

    public ServiceCategoryController(ServiceCategoryRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<ServiceCategory> listAll() {
        return repository.findAll();
    }
}
