package com.group2.backend.config;

import com.group2.backend.dto.AccountDto;
import com.group2.backend.dto.ArtworkSummaryDto;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class RedisCacheConfigTest {

    private final GenericJacksonJsonRedisSerializer serializer =
        RedisCacheConfig.valueSerializer();

    @Test
    void roundTripsSingleDtoWithItsConcreteType() {
        AccountDto account = AccountDto.builder()
            .id("account-1")
            .username("redis-user")
            .email("redis@example.com")
            .build();

        Object restored = serializer.deserialize(serializer.serialize(account));

        assertThat(restored).isInstanceOf(AccountDto.class);
        assertThat((AccountDto) restored).isEqualTo(account);
    }

    @Test
    void roundTripsDtoCollectionWithElementTypes() {
        ArtworkSummaryDto artwork = ArtworkSummaryDto.builder()
            .id("artwork-1")
            .title("Redis test")
            .price(BigDecimal.TEN)
            .createdAt(Instant.parse("2026-08-28T20:00:00Z"))
            .tags(List.of("Cloud"))
            .build();
        List<ArtworkSummaryDto> cachedValue = new ArrayList<>(List.of(artwork));

        Object restored = serializer.deserialize(serializer.serialize(cachedValue));

        assertThat(restored).isInstanceOf(List.class);
        assertThat((List<?>) restored).hasSize(1);
        assertThat(((List<?>) restored).getFirst()).isInstanceOf(ArtworkSummaryDto.class);
    }
}
