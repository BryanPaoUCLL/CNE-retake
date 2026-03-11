package com.group2.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tag_aliases", indexes = {
    @Index(name = "idx_tag_alias_normalized", columnList = "normalized_alias", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TagAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String alias;

    @Column(name = "normalized_alias", nullable = false, length = 64, unique = true)
    private String normalizedAlias;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Tag tag;
}
