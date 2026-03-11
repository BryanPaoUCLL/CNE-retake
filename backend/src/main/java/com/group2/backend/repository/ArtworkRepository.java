package com.group2.backend.repository;

import com.group2.backend.model.Artwork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtworkRepository extends JpaRepository<Artwork, Long> {
	List<Artwork> findByTitleContainingIgnoreCase(String query);

	@Query("select distinct a from Artwork a join a.tags t where lower(t.name) like lower(concat('%', :tag, '%'))")
	List<Artwork> findByTagNameContainingIgnoreCase(@Param("tag") String tag);

	@Query("select distinct a from Artwork a join a.tags t where t.id = :tagId")
	List<Artwork> findByTagId(@Param("tagId") Long tagId);

	List<Artwork> findTop10ByOrderByViewsDesc();

	List<Artwork> findByCreatorId(Integer creatorId);
}
