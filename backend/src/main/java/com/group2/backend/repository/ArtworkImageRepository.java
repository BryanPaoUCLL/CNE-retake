package com.group2.backend.repository;

import com.group2.backend.model.ArtworkImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtworkImageRepository extends JpaRepository<ArtworkImage, Long> {

    List<ArtworkImage> findByArtworkIdOrderBySortOrderAsc(Long artworkId);

    Optional<ArtworkImage> findByArtworkIdAndIsMainImageTrue(Long artworkId);

    Optional<ArtworkImage> findByArtworkIdAndId(Long artworkId, Long id);

    long countByArtworkId(Long artworkId);

    @Query("select coalesce(max(ai.sortOrder), -1) from ArtworkImage ai where ai.artwork.id = :artworkId")
    int findMaxSortOrderByArtworkId(Long artworkId);
}
