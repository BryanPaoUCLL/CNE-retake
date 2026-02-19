package com.group2.backend.repository;

import com.group2.backend.model.ArtworkLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ArtworkLikeRepository extends JpaRepository<ArtworkLike, Long> {
    Optional<ArtworkLike> findByAccountIdAndArtworkId(Integer accountId, Long artworkId);

    long countByArtworkId(Long artworkId);

    void deleteByAccountIdAndArtworkId(Integer accountId, Long artworkId);
}
