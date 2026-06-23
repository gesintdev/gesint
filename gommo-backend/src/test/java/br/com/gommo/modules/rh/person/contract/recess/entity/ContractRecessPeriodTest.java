package br.com.gommo.modules.rh.person.contract.recess.entity;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class ContractRecessPeriodTest {

    @Test
    void remainingDays_shouldSubtractUsedAndReservedBalances() {
        ContractRecessPeriod period = ContractRecessPeriod.builder()
                .entitledDays(20)
                .usedDays(5)
                .reservedDays(4)
                .build();

        assertThat(period.getRemainingDays()).isEqualTo(11);
    }
}
