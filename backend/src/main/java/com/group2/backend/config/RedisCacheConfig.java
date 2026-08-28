package com.group2.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import tools.jackson.databind.jsontype.BasicPolymorphicTypeValidator;

import java.time.Duration;
import java.util.Map;

@Configuration
@ConditionalOnProperty(name = "app.cache.type", havingValue = "redis")
public class RedisCacheConfig implements CachingConfigurer {
    private static final Logger LOGGER = LoggerFactory.getLogger(RedisCacheConfig.class);
    private final RedisConnectionFactory connectionFactory;

    public RedisCacheConfig(RedisConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Bean
    @Override
    public CacheManager cacheManager() {
        GenericJacksonJsonRedisSerializer valueSerializer = valueSerializer();

        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
            .disableCachingNullValues()
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(valueSerializer));

        Map<String, RedisCacheConfiguration> caches = Map.of(
            "tagSuggestions", defaults.entryTtl(Duration.ofMinutes(5)),
            "popularTags", defaults.entryTtl(Duration.ofMinutes(15)),
            "trendingArtworks", defaults.entryTtl(Duration.ofMinutes(10)),
            "accountArtworks", defaults.entryTtl(Duration.ofMinutes(5)),
            "likeCounts", defaults.entryTtl(Duration.ofMinutes(2)),
            "accounts", defaults.entryTtl(Duration.ofMinutes(15)),
            "allAccounts", defaults.entryTtl(Duration.ofMinutes(15))
        );

        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(defaults.entryTtl(Duration.ofMinutes(5)))
            .withInitialCacheConfigurations(caches)
            .enableStatistics()
            .build();
    }

    static GenericJacksonJsonRedisSerializer valueSerializer() {
        BasicPolymorphicTypeValidator trustedCacheTypes = BasicPolymorphicTypeValidator.builder()
            .allowIfSubType("com.group2.backend.dto.")
            .allowIfSubType("java.util.")
            .allowIfSubType("java.time.")
            .allowIfSubType("java.math.")
            .build();

        return GenericJacksonJsonRedisSerializer.builder()
            .enableDefaultTyping(trustedCacheTypes)
            .build();
    }

    @Bean
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                logFailure("read", exception, cache, key);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                logFailure("write", exception, cache, key);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                logFailure("evict", exception, cache, key);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                logFailure("clear", exception, cache, null);
            }
        };
    }

    private void logFailure(String operation, RuntimeException exception, Cache cache, Object key) {
        LOGGER.warn(
            "Redis cache {} failed for cache={} key={}; continuing without cache",
            operation,
            cache.getName(),
            key,
            exception
        );
    }
}
