package com.preptracker.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;




@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${brevo.sender-email}")
    private String senderEmail;

    @Value("${brevo.sender-name}")
    private String senderName;

    public void sendOtpEmail(String toEmail, String otp){
        RestTemplate restTemplate = new RestTemplate();

        String body = """
                {
                    "sender":{"name":"%s", "email":"%s"},
                    "to":[{"email":"%s"}],
                    "subject":"PrepEdge-Email Verification OTP",
                    "htmlContent":"<h2>OTP: <strong>%s</strong></h2><p>This OTP expires in 10 mins</p>"
                }
                """.formatted(senderName, senderEmail, toEmail, otp);

        HttpHeaders header=new HttpHeaders();
        header.setContentType(MediaType.APPLICATION_JSON);
        header.set("api-key",apiKey);

        HttpEntity<String> entity = new HttpEntity<>(body,header);

        try {
            var response = restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    entity,
                    String.class
            );
            System.out.println("Brevo response status: " + response.getStatusCode());
            System.out.println("Brevo response body: " + response.getBody());
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }
}
