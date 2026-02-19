package com.group2.backend.service;

import com.group2.backend.dto.PurchaseDto;
import com.group2.backend.exception.service.ServiceException;
import com.group2.backend.model.Account;
import com.group2.backend.model.Artwork;
import com.group2.backend.model.Purchase;
import com.group2.backend.repository.ArtworkRepository;
import com.group2.backend.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ArtworkRepository artworkRepository;
    private final AuthService authService;

    public PurchaseDto createPurchase(Long artworkId) {
        Artwork artwork = artworkRepository.findById(artworkId)
            .orElseThrow(() -> new ServiceException("Artwork not found", HttpStatus.NOT_FOUND));
        Account buyer = authService.getAccountFromRequest();

        if (artwork.getCreator() != null && buyer.getId().equals(artwork.getCreator().getId())) {
            throw new ServiceException("Cannot purchase your own artwork", HttpStatus.BAD_REQUEST);
        }

        Purchase purchase = Purchase.builder()
            .artwork(artwork)
            .buyer(buyer)
            .purchasePrice(artwork.getPrice())
            .build();

        Purchase saved = purchaseRepository.save(purchase);
        return saved.toDto();
    }

    @Transactional(readOnly = true)
    public List<PurchaseDto> getMyPurchases() {
        Account buyer = authService.getAccountFromRequest();
        return purchaseRepository.findByBuyerId(buyer.getId())
            .stream()
            .map(Purchase::toDto)
            .toList();
    }
}
