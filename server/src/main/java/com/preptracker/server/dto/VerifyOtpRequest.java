package com.preptracker.server.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class VerifyOtpRequest {
    @NotBlank(message="OTP Not Filled!")
    private String otp;
}
