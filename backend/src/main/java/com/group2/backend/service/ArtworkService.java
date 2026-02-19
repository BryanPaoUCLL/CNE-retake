package com.group2.backend.service;

import com.group2.backend.dto.ArtworkCreateDto;
import com.group2.backend.dto.ArtworkDto;
import com.group2.backend.dto.ArtworkSummaryDto;
import com.group2.backend.dto.ArtworkUpdateDto;
import com.group2.backend.exception.service.ServiceException;
import com.group2.backend.model.Account;
import com.group2.backend.model.Artwork;
import com.group2.backend.repository.ArtworkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ArtworkService {

    private final ArtworkRepository artworkRepository;
    private final AuthService authService;

    public Page<ArtworkSummaryDto> listArtworks(int page, int size, String sort) {
        Pageable pageable = buildPageable(page, size, sort);
        return artworkRepository.findAll(pageable).map(Artwork::toSummaryDto);
    }

    public ArtworkDto getArtwork(Long id) {
        Artwork artwork = artworkRepository.findById(id)
            .orElseThrow(() -> new ServiceException("Artwork not found", HttpStatus.NOT_FOUND));

        artwork.setViews(artwork.getViews() + 1);
        Artwork saved = artworkRepository.save(artwork);
        return saved.toDto();
    }

    public ArtworkDto createArtwork(ArtworkCreateDto body) {
        validateCreateBody(body);
        Account creator = authService.getAccountFromRequest();

        Artwork toCreate = Artwork.builder()
            .title(body.getTitle().trim())
            .description(Optional.ofNullable(body.getDescription()).map(String::trim).orElse(null))
            .imageUrl(Optional.ofNullable(body.getImageUrl()).map(String::trim).orElse(null))
            .price(body.getPrice())
            .creator(creator)
            .build();

        Artwork saved = artworkRepository.save(toCreate);
        return saved.toDto();
    }

    public ArtworkDto updateArtwork(Long id, ArtworkUpdateDto body) {
        Artwork artwork = artworkRepository.findById(id)
            .orElseThrow(() -> new ServiceException("Artwork not found", HttpStatus.NOT_FOUND));
        Account caller = authService.getAccountFromRequest();
        if (artwork.getCreator() == null || !caller.getId().equals(artwork.getCreator().getId())) {
            throw new ServiceException("Forbidden", HttpStatus.FORBIDDEN);
        }

        if (body.getTitle() != null && !body.getTitle().isBlank()) {
            artwork.setTitle(body.getTitle().trim());
        }
        if (body.getDescription() != null) {
            String trimmed = body.getDescription().trim();
            artwork.setDescription(trimmed.isEmpty() ? null : trimmed);
        }
        if (body.getPrice() != null) {
            artwork.setPrice(body.getPrice());
        }
        if (body.getImageUrl() != null) {
            String trimmed = body.getImageUrl().trim();
            artwork.setImageUrl(trimmed.isEmpty() ? null : trimmed);
        }

        Artwork saved = artworkRepository.save(artwork);
        return saved.toDto();
    }

    public void deleteArtwork(Long id) {
        Artwork artwork = artworkRepository.findById(id)
            .orElseThrow(() -> new ServiceException("Artwork not found", HttpStatus.NOT_FOUND));
        Account caller = authService.getAccountFromRequest();
        if (artwork.getCreator() == null || !caller.getId().equals(artwork.getCreator().getId())) {
            throw new ServiceException("Forbidden", HttpStatus.FORBIDDEN);
        }
        artworkRepository.delete(artwork);
    }

    public List<ArtworkSummaryDto> search(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }
        return artworkRepository.findByTitleContainingIgnoreCase(query.trim())
            .stream()
            .map(Artwork::toSummaryDto)
            .toList();
    }

    public List<ArtworkSummaryDto> trending() {
        return artworkRepository.findTop10ByOrderByViewsDesc()
            .stream()
            .map(Artwork::toSummaryDto)
            .toList();
    }

    public List<ArtworkSummaryDto> listByAccount(Integer accountId) {
        return artworkRepository.findByCreatorId(accountId)
            .stream()
            .map(Artwork::toSummaryDto)
            .toList();
    }

    private Pageable buildPageable(int page, int size, String sort) {
        Sort sortSpec = parseSort(sort);
        return PageRequest.of(Math.max(page, 0), Math.max(size, 1), sortSpec);
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.unsorted();
        }

        String[] parts = sort.split(",");
        if (parts.length == 2) {
            Sort.Direction direction = Sort.Direction.fromOptionalString(parts[1].trim()).orElse(Sort.Direction.ASC);
            return Sort.by(direction, parts[0].trim());
        }

        return Sort.by(sort.trim());
    }

    private void validateCreateBody(ArtworkCreateDto body) {
        if (body == null) {
            throw new ServiceException("Artwork payload is required", HttpStatus.BAD_REQUEST);
        }
        if (body.getTitle() == null || body.getTitle().isBlank()) {
            throw new ServiceException("Artwork title is required", HttpStatus.BAD_REQUEST);
        }
        if (body.getPrice() == null) {
            throw new ServiceException("Artwork price is required", HttpStatus.BAD_REQUEST);
        }
    }
}
