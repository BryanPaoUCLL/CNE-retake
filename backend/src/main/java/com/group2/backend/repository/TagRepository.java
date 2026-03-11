package com.group2.backend.repository;

import com.group2.backend.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    Optional<Tag> findByNormalizedName(String normalizedName);

    List<Tag> findByNormalizedNameIn(Set<String> normalizedNames);

    List<Tag> findTop30ByOrderByUsageCountDescNameAsc();

    List<Tag> findTop10ByOrderByUsageCountDescNameAsc();

    List<Tag> findTop20ByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCaseOrderByUsageCountDescNameAsc(
        String nameQuery,
        String descriptionQuery
    );
}
