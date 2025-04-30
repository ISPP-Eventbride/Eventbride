package com.eventbride.payment;

import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class PayoutService {

        private final WebClient webClient;
        private final String clientId = "AZecc585M4DHHTjRRQIE8WzjGyPHAivtXaKZ3Ha_NFhYg5jadGb6hb0Syj_feAMayO29y2aZEeWRTeaY";
        private final String clientSecret = "EDVUuskhR664IuDJ9rH0p7ooTm5MdNbwluptaLWSgIGrw3lxLDUFtozzgBS1Igjp0Cnkaa5gBEA1ja5d";
        private final String baseUrl = "https://api.sandbox.paypal.com";

        public PayoutService(WebClient.Builder webClientBuilder) {
                this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        }

        public String getAccessToken() {
                String credentials = Base64.getEncoder().encodeToString((clientId + ":" + clientSecret).getBytes());

                MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
                body.add("grant_type", "client_credentials");

                return webClient.post()
                                .uri("/v1/oauth2/token")
                                .header("Authorization", "Basic " + credentials)
                                .header("Content-Type", "application/x-www-form-urlencoded")
                                .bodyValue(body)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .map(token -> (String) token.get("access_token"))
                                .block();
        }

        public void sendPayout(String receiverEmail, Double amount) {
                String accessToken = getAccessToken();

                Map<String, Object> payoutRequest = new HashMap<>();
                payoutRequest.put("sender_batch_header", Map.of(
                                "sender_batch_id", UUID.randomUUID().toString(),
                                "email_subject", "Has recibido los fondos retirados",
                                "email_message", "Has recibido los fondos retirados a través de Eventbride."));
                payoutRequest.put("items", List.of(
                                Map.of(
                                                "recipient_type", "EMAIL",
                                                "amount", Map.of(
                                                                "value", String.format(Locale.US, "%.2f", amount),
                                                                "currency", "EUR"),
                                                "receiver", receiverEmail,
                                                "note", "Gracias por usar Eventbride.",
                                                "sender_item_id", UUID.randomUUID().toString())));

                try {
                        webClient.post()
                                        .uri("/v1/payments/payouts")
                                        .header("Authorization", "Bearer " + accessToken)
                                        .header("Content-Type", "application/json")
                                        .bodyValue(payoutRequest)
                                        .retrieve()
                                        .bodyToMono(Map.class)
                                        .block();
                } catch (Exception e) {
                        throw new RuntimeException("Error al enviar el pago a PayPal: " + e.getMessage(), e);
                }
        }
}
