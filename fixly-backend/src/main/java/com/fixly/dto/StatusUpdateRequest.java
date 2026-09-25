package com.fixly.dto;

import jakarta.validation.constraints.NotBlank;

public class StatusUpdateRequest {
    @NotBlank
    private String status; // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
