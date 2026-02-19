package com.group2.backend.model;

import com.group2.backend.dto.AccountSummaryDto;
import com.group2.backend.dto.ArtworkSummaryDto;
import com.group2.backend.dto.PurchaseDto;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Purchase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "purchase_price", precision = 19, scale = 2)
    @NotNull
    private BigDecimal purchasePrice;

    @Column(name = "purchase_date")
    private Instant purchaseDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Account buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "artwork_id", nullable = false)
    @NotNull
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Artwork artwork;

    public PurchaseDto toDto() {
        AccountSummaryDto buyerDto = buyer != null ? buyer.toSummaryDto() : null;
        ArtworkSummaryDto artworkDto = artwork != null ? artwork.toSummaryDto() : null;

        return PurchaseDto.builder()
            .id(this.id)
            .purchasePrice(this.purchasePrice)
            .purchaseDate(this.purchaseDate)
            .buyer(buyerDto)
            .artwork(artworkDto)
            .build();
    }

    @PrePersist
    void onCreate() {
        if (purchaseDate == null) purchaseDate = Instant.now();
        validateState();
    }

    @PreUpdate
    void onUpdate() {
        validateState();
    }

    private void validateState() {
        if (purchasePrice == null) throw new IllegalStateException("Purchase price is required");
        if (buyer == null) throw new IllegalStateException("Purchase requires a buyer");
        if (artwork == null) throw new IllegalStateException("Purchase requires an artwork");
    }
}
