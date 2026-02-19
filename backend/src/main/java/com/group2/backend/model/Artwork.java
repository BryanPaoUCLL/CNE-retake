package com.group2.backend.model;

import com.group2.backend.dto.AccountSummaryDto;
import com.group2.backend.dto.ArtworkDto;
import com.group2.backend.dto.ArtworkSummaryDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "artworks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Artwork {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    @NotBlank
    @Size(max = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 19, scale = 2)
    @NotNull
    private BigDecimal price;

    @Column(name = "image_url")
    private String imageUrl;

    @Column
    @Builder.Default
    private int views = 0;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Account creator;

    @OneToMany(mappedBy = "artwork", cascade = CascadeType.ALL, orphanRemoval = true)
    @Singular
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Purchase> purchases;

    @OneToMany(mappedBy = "artwork", cascade = CascadeType.ALL, orphanRemoval = true)
    @Singular
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ArtworkLike> likes;

    public ArtworkDto toDto() {
        AccountSummaryDto creatorDto = creator != null ? creator.toSummaryDto() : null;
        return ArtworkDto.builder()
            .id(this.id)
            .title(this.title)
            .description(this.description)
            .imageUrl(this.imageUrl)
            .price(this.price)
            .views(this.views)
            .createdAt(this.createdAt)
            .creator(creatorDto)
            .build();
    }

    public ArtworkSummaryDto toSummaryDto() {
        AccountSummaryDto creatorDto = creator != null ? creator.toSummaryDto() : null;
        return ArtworkSummaryDto.builder()
            .id(this.id)
            .title(this.title)
            .imageUrl(this.imageUrl)
            .price(this.price)
            .views(this.views)
            .createdAt(this.createdAt)
            .creator(creatorDto)
            .build();
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        validateState();
    }

    @PreUpdate
    void onUpdate() {
        validateState();
    }

    private void validateState() {
        if (title == null || title.trim().isEmpty()) throw new IllegalStateException("Artwork title is required");
        if (price == null) throw new IllegalStateException("Artwork price is required");
        if (creator == null) throw new IllegalStateException("Artwork requires a creator account");
    }
}
