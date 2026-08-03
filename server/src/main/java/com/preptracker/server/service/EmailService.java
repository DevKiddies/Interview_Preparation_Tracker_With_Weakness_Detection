package com.preptracker.server.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.preptracker.server.dto.ContactRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;

import java.util.List;
import java.util.Map;

// Sends transactional emails via Brevo's REST API (https://api.brevo.com).
// Handles OTP verification, password reset OTP, and Contact Us form messages.
// Brevo credentials and sender identity are read from application.properties
// and injected via @Value.
@Service
@RequiredArgsConstructor
public class EmailService {
    @Value("${brevo.api-key}")
    private String apiKey;

    @Value("${brevo.sender-email}")
    private String senderEmail;

    @Value("${brevo.sender-name}")
    private String senderName;

    @Value("${contact.recipient-email}")
    private String contactRecipientEmail;

    public void sendPasswordResetEmail(String toEmail, String otp) {
        RestTemplate restTemplate = new RestTemplate();

        String body = """
                {
                    "sender":{"name":"%s", "email":"%s"},
                    "to":[{"email":"%s"}],
                    "subject":"PrepEdge - Password Reset OTP",
                    "htmlContent":"<h2>Password Reset</h2><p>Your OTP to reset your password is: <strong>%s</strong></p><p>This OTP expires in 15 minutes. If you did not request a password reset, please ignore this email.</p>"
                }
                """.formatted(senderName, senderEmail, toEmail, otp);

        HttpHeaders header = new HttpHeaders();
        header.setContentType(MediaType.APPLICATION_JSON);
        header.set("api-key", apiKey);

        HttpEntity<String> entity = new HttpEntity<>(body, header);

        try {
            var response = restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    entity,
                    String.class
            );
            System.out.println("Brevo response status: " + response.getStatusCode());
        } catch (Exception e) {
            System.out.println("Password reset email sending failed: " + e.getMessage());
            throw new RuntimeException("Failed to send password reset email: " + e.getMessage());
        }
    }

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

    // Contact Us form submissions come from anonymous, free-text input, unlike the
    // numeric OTPs above — built as a JSON object via ObjectMapper (not string
    // formatting) so quotes/newlines/backslashes in a user's message can't break or
    // inject into the request payload. HTML-escaped separately since it's rendered
    // as htmlContent. replyTo is set to the sender so the team can just hit "Reply".
    public void sendContactMessage(ContactRequest request) {
        RestTemplate restTemplate = new RestTemplate();
        ObjectMapper mapper = new ObjectMapper();

        String htmlContent = "<h2>New message from the Contact Us form</h2>"
                + "<p><strong>Name:</strong> " + HtmlUtils.htmlEscape(request.getName()) + "</p>"
                + "<p><strong>Email:</strong> " + HtmlUtils.htmlEscape(request.getEmail()) + "</p>"
                + "<p><strong>Subject:</strong> " + HtmlUtils.htmlEscape(request.getSubject()) + "</p>"
                + "<p><strong>Message:</strong></p>"
                + "<p>" + HtmlUtils.htmlEscape(request.getMessage()).replace("\n", "<br>") + "</p>";

        Map<String, Object> body = Map.of(
                "sender", Map.of("name", senderName, "email", senderEmail),
                "to", List.of(Map.of("email", contactRecipientEmail)),
                "replyTo", Map.of("email", request.getEmail(), "name", request.getName()),
                "subject", "PrepEdge Contact Form: " + request.getSubject(),
                "htmlContent", htmlContent
        );

        HttpHeaders header = new HttpHeaders();
        header.setContentType(MediaType.APPLICATION_JSON);
        header.set("api-key", apiKey);

        try {
            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(body), header);
            var response = restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    entity,
                    String.class
            );
            System.out.println("Brevo response status: " + response.getStatusCode());
        } catch (Exception e) {
            System.out.println("Contact message sending failed: " + e.getMessage());
            throw new RuntimeException("Failed to send message: " + e.getMessage());
        }
    }
}
