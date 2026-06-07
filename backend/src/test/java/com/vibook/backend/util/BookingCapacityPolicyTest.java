package com.vibook.backend.util;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class BookingCapacityPolicyTest {

    @Test
    void remainingCapacity_neverNegative() {
        assertThat(BookingCapacityPolicy.remainingCapacity(10, 7)).isEqualTo(3);
        assertThat(BookingCapacityPolicy.remainingCapacity(10, 10)).isZero();
        assertThat(BookingCapacityPolicy.remainingCapacity(10, 15)).isZero();
    }
}
