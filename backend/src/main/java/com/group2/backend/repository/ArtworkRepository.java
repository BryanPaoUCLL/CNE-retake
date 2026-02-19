package com.group2.backend.repository;

import com.group2.backend.model.Artwork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, Long> {
	List<Artwork> findByTitleContainingIgnoreCase(String query);

	List<Artwork> findTop10ByOrderByViewsDesc();

	List<Artwork> findByCreatorId(Integer creatorId);
}
