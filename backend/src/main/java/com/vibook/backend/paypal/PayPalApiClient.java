package com.vibook.backend.paypal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.vibook.backend.config.PayPalProperties;
import com.vibook.backend.exception.PayPalApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

@Component
public class PayPalApiClient {

    private final PayPalProperties properties;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public PayPalApiClient(PayPalProperties properties, RestClient paypalRestClient, ObjectMapper objectMapper) {
        this.properties = properties;
        this.restClient = paypalRestClient;
        this.objectMapper = objectMapper;
    }

    public PayPalOrderCreated createOrder(
        BigDecimal amount,
        String currency,
        String referenceId,
        String returnUrl,
        String cancelUrl
    ) {
        properties.requireSandbox();
        String token = fetchAccessToken();
        String amountValue = formatAmount(amount);

        ObjectNode body = objectMapper.createObjectNode();
        body.put("intent", "CAPTURE");
        ObjectNode purchaseUnit = objectMapper.createObjectNode();
        purchaseUnit.put("reference_id", referenceId);
        ObjectNode amountNode = objectMapper.createObjectNode();
        amountNode.put("currency_code", currency);
        amountNode.put("value", amountValue);
        purchaseUnit.set("amount", amountNode);
        ArrayNode units = objectMapper.createArrayNode();
        units.add(purchaseUnit);
        body.set("purchase_units", units);

        ObjectNode appContext = objectMapper.createObjectNode();
        appContext.put("return_url", returnUrl);
        appContext.put("cancel_url", cancelUrl);
        appContext.put("user_action", "PAY_NOW");
        body.set("application_context", appContext);

        try {
            JsonNode response = restClient
                .post()
                .uri("/v2/checkout/orders")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

            if (response == null || !response.hasNonNull("id")) {
                throw new PayPalApiException("PayPal create order returned an empty response");
            }
            String orderId = response.get("id").asText();
            String approvalUrl = extractLink(response, "approve");
            if (!StringUtils.hasText(approvalUrl)) {
                throw new PayPalApiException("PayPal create order did not return an approval URL");
            }
            return new PayPalOrderCreated(orderId, approvalUrl, summarize(response));
        } catch (RestClientResponseException ex) {
            throw new PayPalApiException(formatPayPalFailure("create order", ex), ex);
        }
    }

    public PayPalOrderCaptured captureOrder(String paypalOrderId) {
        properties.requireSandbox();
        String token = fetchAccessToken();
        try {
            JsonNode response = restClient
                .post()
                .uri("/v2/checkout/orders/{orderId}/capture", paypalOrderId)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .retrieve()
                .body(JsonNode.class);

            if (response == null) {
                throw new PayPalApiException("PayPal capture returned an empty response");
            }
            String status = response.path("status").asText("");
            String captureId = response
                .path("purchase_units")
                .path(0)
                .path("payments")
                .path("captures")
                .path(0)
                .path("id")
                .asText(null);
            return new PayPalOrderCaptured(paypalOrderId, captureId, status, summarize(response));
        } catch (RestClientResponseException ex) {
            throw new PayPalApiException(formatPayPalFailure("capture order", ex), ex);
        }
    }

    private String fetchAccessToken() {
        if (!properties.isConfigured()) {
            throw new PayPalApiException("PayPal sandbox credentials are not configured on the server");
        }
        properties.requireSandbox();
        String basic = Base64.getEncoder()
            .encodeToString((properties.clientId() + ":" + properties.clientSecret()).getBytes(StandardCharsets.UTF_8));
        try {
            JsonNode response = restClient
                .post()
                .uri("/v1/oauth2/token")
                .header(HttpHeaders.AUTHORIZATION, "Basic " + basic)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=client_credentials")
                .retrieve()
                .body(JsonNode.class);
            if (response == null || !response.hasNonNull("access_token")) {
                throw new PayPalApiException("PayPal OAuth token response was empty");
            }
            return response.get("access_token").asText();
        } catch (RestClientResponseException ex) {
            throw new PayPalApiException("PayPal OAuth token request failed: " + ex.getStatusCode(), ex);
        }
    }

    private static String extractLink(JsonNode response, String rel) {
        JsonNode links = response.get("links");
        if (links == null || !links.isArray()) {
            return null;
        }
        for (JsonNode link : links) {
            if (rel.equals(link.path("rel").asText()) && link.hasNonNull("href")) {
                return link.get("href").asText();
            }
        }
        return null;
    }

    private static String formatAmount(BigDecimal amount) {
        return amount.setScale(2, RoundingMode.HALF_UP).toPlainString();
    }

    private String summarize(JsonNode node) {
        try {
            String json = objectMapper.writeValueAsString(node);
            return json.length() > 1900 ? json.substring(0, 1900) + "…" : json;
        } catch (Exception e) {
            return node.toString();
        }
    }

    private String formatPayPalFailure(String action, RestClientResponseException ex) {
        String issue = extractPayPalIssue(ex.getResponseBodyAsString());
        if ("CURRENCY_NOT_SUPPORTED".equals(issue) || "UNSUPPORTED_PAYEE_CURRENCY".equals(issue)) {
            return "PayPal does not support this currency. Sandbox checkout uses USD for JOD bookings.";
        }
        if (StringUtils.hasText(issue)) {
            return "PayPal could not " + action + " (" + issue + "). Please try again.";
        }
        return "PayPal could not " + action + ". Please try again.";
    }

    private String extractPayPalIssue(String body) {
        if (!StringUtils.hasText(body)) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode details = root.path("details");
            if (details.isArray() && !details.isEmpty()) {
                String issue = details.get(0).path("issue").asText(null);
                if (StringUtils.hasText(issue)) {
                    return issue;
                }
            }
            return root.path("name").asText(null);
        } catch (Exception ignored) {
            return null;
        }
    }
}
