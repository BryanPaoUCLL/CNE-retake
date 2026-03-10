package com.group2.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtworkDto {
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String thumbnailUrl;
    private BigDecimal price;
    private int views;
    private Instant createdAt;
    private AccountSummaryDto creator;
    private List<ArtworkImageDto> images;
}
