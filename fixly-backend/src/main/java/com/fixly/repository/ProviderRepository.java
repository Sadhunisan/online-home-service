package com.fixly.repository;

import com.fixly.model.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProviderRepository extends JpaRepository<Provider, Long> {
    List<Provider> findByServiceCategoryId(Long serviceCategoryId);
    Optional<Provider> findByUserId(Long userId);
}
