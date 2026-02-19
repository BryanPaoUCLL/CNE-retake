package com.group2.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;


import java.time.Instant;
import java.util.List;

import com.group2.backend.dto.AccountDto;
import com.group2.backend.dto.AccountSummaryDto;

@Entity
@Table(name = "accounts")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;


    @Column(length = 50, nullable = false)
    @NotBlank
    @Size(max = 50)
    private String username;

    @Column(length = 100, nullable = false)
    @NotBlank
    @Email
    @Size(max = 100)
    private String email;

    @Column(nullable = false)
    @NotBlank
    private String password;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @Singular
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Token> tokens;





    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true)
    @Singular
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Artwork> artworks;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Singular
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Purchase> purchases;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true)
    @Singular
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ArtworkLike> likes;

    /**
     * Convert to AccountDto
     */
    public AccountDto toDto() {
        return AccountDto.builder()
            .id(this.id)
            .username(this.username)
            .email(this.email)
            .build();
    }

    /**
	 * Convert to AccountSummaryDto
	 */
	public AccountSummaryDto toSummaryDto() {
		return AccountSummaryDto.builder()
			.id(this.id)
			.username(this.username)
			.build();
	}

    @PrePersist
    void onCreate() {
        validateState();
        Instant now = Instant.now();
        if (createdAt == null) {
            createdAt = now;
        }
        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    void onUpdate() {
        validateState();
        updatedAt = Instant.now();
    }

    private void validateState() {
    }

}
