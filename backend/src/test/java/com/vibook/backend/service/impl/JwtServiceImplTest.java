package com.vibook.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class JwtServiceImplTest {

    @Test
    void resolveKeyBytes_usesUtf8ForPlainTextSecret() {
        byte[] bytes = JwtServiceImpl.resolveKeyBytes("change-me-in-production-vibook-key");
        assertThat(bytes).hasSize(34);
        assertThat(new String(bytes)).isEqualTo("change-me-in-production-vibook-key");
    }

    @Test
    void resolveKeyBytes_decodesBase64WhenPrefixed() {
        byte[] bytes = JwtServiceImpl.resolveKeyBytes(
            "base64:bXktc3VwZXItc2VjcmV0LWtleS1mb3Itdmlib29rLWp3dC1zaWduaW5nLXRva2Vucy0xMjM0NTY3ODkw"
        );
        assertThat(bytes.length).isGreaterThanOrEqualTo(32);
        assertThat(new String(bytes)).contains("vibook");
    }

    @Test
    void resolveKeyBytes_rejectsInvalidBase64Prefix() {
        assertThatThrownBy(() -> JwtServiceImpl.resolveKeyBytes("base64:not-valid-base64!!!"))
            .isInstanceOf(IllegalStateException.class)
            .hasMessageContaining("not valid Base64");
    }
}
