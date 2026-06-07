package com.vibook.backend.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class BusinessEventUpsertRequestValidationTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void blankTitle_fails() {
        Set<ConstraintViolation<BusinessEventUpsertRequest>> violations =
            VALIDATOR.validate(sample().withTitle("   ").build());
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
    }

    @Test
    void titleShorterThanThree_fails() {
        Set<ConstraintViolation<BusinessEventUpsertRequest>> violations =
            VALIDATOR.validate(sample().withTitle("ab").build());
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("title"));
    }

    @Test
    void descriptionShorterThanTen_fails() {
        Set<ConstraintViolation<BusinessEventUpsertRequest>> violations =
            VALIDATOR.validate(sample().withDescription("short").build());
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("description"));
    }

    @Test
    void nullPriceJod_fails() {
        Set<ConstraintViolation<BusinessEventUpsertRequest>> violations =
            VALIDATOR.validate(sample().withPriceJod(null).build());
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("priceJod"));
    }

    @Test
    void negativePriceJod_fails() {
        Set<ConstraintViolation<BusinessEventUpsertRequest>> violations =
            VALIDATOR.validate(sample().withPriceJod(new BigDecimal("-0.01")).build());
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("priceJod"));
    }

    @Test
    void capacityGuestsLessThanOne_fails() {
        Set<ConstraintViolation<BusinessEventUpsertRequest>> violations =
            VALIDATOR.validate(sample().withCapacityGuests(0).build());
        assertThat(violations).anyMatch(v -> v.getPropertyPath().toString().equals("capacityGuests"));
    }

    private static SampleBuilder sample() {
        return new SampleBuilder();
    }

    private static final class SampleBuilder {
        private String title = "Summer brunch";
        private String description = "A long enough description for validation.";
        private BigDecimal priceJod = BigDecimal.ZERO;
        private Integer capacityGuests = 20;

        SampleBuilder withTitle(String title) {
            this.title = title;
            return this;
        }

        SampleBuilder withDescription(String description) {
            this.description = description;
            return this;
        }

        SampleBuilder withPriceJod(BigDecimal priceJod) {
            this.priceJod = priceJod;
            return this;
        }

        SampleBuilder withCapacityGuests(Integer capacityGuests) {
            this.capacityGuests = capacityGuests;
            return this;
        }

        BusinessEventUpsertRequest build() {
            return new BusinessEventUpsertRequest(
                title,
                1L,
                description,
                LocalDate.now().plusDays(2),
                List.of("10:00 AM"),
                2L,
                null,
                priceJod,
                "JOD",
                capacityGuests,
                true,
                null
            );
        }
    }
}
