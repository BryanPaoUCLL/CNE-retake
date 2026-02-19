package com.group2.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;

import com.group2.backend.exception.model.ModelException;


@Entity
@Table(name = "tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    @NotBlank
    @Builder.Default
    private String uid = "";

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Account account;

    /**
     * Check if this token is expired
     * @return true if expired, false otherwise
     */
    public boolean isExpired() {
        return expiresAt != null && expiresAt.isBefore(Instant.now());
    }

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
        validateState();
    }

    @PreUpdate
    void onUpdate() {
        validateState();
    }

    private void validateState() {
        if (uid == null || uid.trim().isEmpty()) {
            throw new ModelException("Token UID is required");
        }
        uid = uid.trim();
        if (account == null) {
            throw new ModelException("Token requires an account");
        }
        if (expiresAt != null && expiresAt.isBefore(createdAt != null ? createdAt : Instant.now())) {
            throw new ModelException("Token expiration must be after creation");
        }
    }
}
