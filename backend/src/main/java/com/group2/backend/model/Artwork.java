package com.group2.backend.model;

import com.group2.backend.dto.AccountSummaryDto;
import com.group2.backend.dto.ArtworkDto;
import com.group2.backend.dto.ArtworkImageDto;
import com.group2.backend.dto.ArtworkSummaryDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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

    @Column(name = "artwork_year")
    private Integer year;

    @Column
    @Builder.Default
    private int views = 0;

    @Column(nullable = false)
    @Builder.Default
    private boolean sold = false;

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

    @OneToMany(mappedBy = "artwork", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    @Singular
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ArtworkImage> images;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "artwork_tag_refs",
        joinColumns = @JoinColumn(name = "artwork_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private List<Tag> tags = new ArrayList<>();

    public ArtworkDto toDto() {
        AccountSummaryDto creatorDto = creator != null ? creator.toSummaryDto() : null;
        List<ArtworkImageDto> imageDtos = images == null
            ? List.of()
            : images.stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .map(image -> image.toDto(null, null))
                .toList();

        ArtworkImageDto mainImage = imageDtos.stream()
            .filter(ArtworkImageDto::isMainImage)
            .findFirst()
            .orElseGet(() -> imageDtos.isEmpty() ? null : imageDtos.get(0));

        return ArtworkDto.builder()
            .id(this.id)
            .title(this.title)
            .description(this.description)
            .imageUrl(mainImage != null ? mainImage.getUrl() : null)
            .thumbnailUrl(mainImage != null ? mainImage.getThumbnailUrl() : null)
            .price(this.price)
            .year(this.year)
            .views(this.views)
            .sold(this.sold)
            .createdAt(this.createdAt)
            .creator(creatorDto)
            .images(imageDtos)
            .tags(this.tags != null ? this.tags.stream().map(Tag::getName).toList() : List.of())
            .build();
    }

    public ArtworkSummaryDto toSummaryDto() {
        AccountSummaryDto creatorDto = creator != null ? creator.toSummaryDto() : null;
        ArtworkImage mainImage = images == null
            ? null
            : images.stream()
                .sorted((a, b) -> Integer.compare(a.getSortOrder(), b.getSortOrder()))
                .filter(ArtworkImage::isMainImage)
                .findFirst()
                .orElseGet(() -> images.isEmpty() ? null : images.get(0));

        return ArtworkSummaryDto.builder()
            .id(this.id)
            .title(this.title)
            .imageUrl(mainImage != null ? mainImage.getBlobName() : null)
            .thumbnailUrl(mainImage != null ? mainImage.getThumbnailBlobName() : null)
            .price(this.price)
            .year(this.year)
            .views(this.views)
            .sold(this.sold)
            .createdAt(this.createdAt)
            .creator(creatorDto)
            .tags(this.tags != null ? this.tags.stream().map(Tag::getName).collect(Collectors.toList()) : List.of())
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
