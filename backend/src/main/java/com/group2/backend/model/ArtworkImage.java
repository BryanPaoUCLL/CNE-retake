package com.group2.backend.model;

import com.group2.backend.dto.ArtworkImageDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "artwork_images", indexes = {
    @Index(name = "idx_artwork_images_artwork_id", columnList = "artwork_id"),
    @Index(name = "idx_artwork_images_artwork_sort", columnList = "artwork_id, sort_order"),
    @Index(name = "idx_artwork_images_artwork_main", columnList = "artwork_id, is_main_image")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtworkImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Artwork artwork;

    @Column(name = "blob_name", nullable = false, length = 500)
    @NotBlank
    @Size(max = 500)
    private String blobName;

    @Column(name = "original_file_name", nullable = false, length = 255)
    @NotBlank
    @Size(max = 255)
    private String originalFileName;

    @Column(name = "mime_type", nullable = false, length = 100)
    @NotBlank
    @Size(max = 100)
    private String mimeType;

    @Column(name = "file_size_bytes", nullable = false)
    private long fileSizeBytes;

    @Column(nullable = false)
    private int width;

    @Column(nullable = false)
    private int height;

    @Column(name = "thumbnail_blob_name", nullable = false, length = 500)
    @NotBlank
    @Size(max = 500)
    private String thumbnailBlobName;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Column(name = "is_main_image", nullable = false)
    @Builder.Default
    private boolean isMainImage = false;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public ArtworkImageDto toDto(String imageUrl, String thumbnailUrl) {
        return ArtworkImageDto.builder()
            .id(this.id)
            .artworkId(this.artwork != null ? this.artwork.getId() : null)
            .blobName(this.blobName)
            .originalFileName(this.originalFileName)
            .mimeType(this.mimeType)
            .fileSizeBytes(this.fileSizeBytes)
            .width(this.width)
            .height(this.height)
            .thumbnailBlobName(this.thumbnailBlobName)
            .sortOrder(this.sortOrder)
            .isMainImage(this.isMainImage)
            .createdAt(this.createdAt)
            .url(imageUrl)
            .thumbnailUrl(thumbnailUrl)
            .build();
    }
}
