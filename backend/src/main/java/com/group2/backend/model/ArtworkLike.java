package com.group2.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "artwork_likes", uniqueConstraints = {@UniqueConstraint(columnNames = {"account_id", "artwork_id"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArtworkLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Artwork artwork;

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
        if (account == null) throw new IllegalStateException("ArtworkLike requires an account");
        if (artwork == null) throw new IllegalStateException("ArtworkLike requires an artwork");
    }
}
