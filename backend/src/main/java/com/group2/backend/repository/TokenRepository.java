package com.group2.backend.repository;

import com.group2.backend.model.Token;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TokenRepository extends JpaRepository<Token, Integer> {
    

    Optional<Token> findByUid(String uid);

    @EntityGraph(attributePaths = {"account"})
    Optional<Token> findWithAccountByUid(String uid);

    List<Token> findByAccountId(Integer accountId);

    void deleteByUid(String uid);

    void deleteByAccountId(Integer accountId);

    List<Token> findByExpiresAtBefore(Instant expiresAt);

    int deleteByExpiresAtBefore(Instant expiresAt);

    boolean existsByUid(String uid);
}
