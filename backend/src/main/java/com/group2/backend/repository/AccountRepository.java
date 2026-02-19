package com.group2.backend.repository;

import com.group2.backend.model.Account;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface AccountRepository extends JpaRepository<Account, Integer> {
    
    Optional<Account> findByEmail(String email);

    Optional<Account> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
    
    @EntityGraph(attributePaths = {"tokens"})
    Optional<Account> findWithTokensById(Integer id);


    
}
