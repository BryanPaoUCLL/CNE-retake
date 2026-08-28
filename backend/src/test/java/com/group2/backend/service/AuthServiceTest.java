package com.group2.backend.service;

import com.group2.backend.model.Account;
import com.group2.backend.model.Token;
import com.group2.backend.repository.AccountRepository;
import com.group2.backend.repository.TokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TokenRepository tokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(accountRepository, tokenRepository, passwordEncoder);
    }

    @Test
    void authenticateAcceptsUsernameWhenEmailDoesNotMatch() {
        Account account = account("artist", "artist@example.com");
        when(accountRepository.findByEmail("artist")).thenReturn(Optional.empty());
        when(accountRepository.findByUsername("artist")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("secret", account.getPassword())).thenReturn(true);
        when(tokenRepository.save(any(Token.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String tokenUid = authService.authenticate(" artist ", "secret", 3600);

        assertNotNull(tokenUid);
        verify(accountRepository).findByEmail("artist");
        verify(accountRepository).findByUsername("artist");
    }

    @Test
    void authenticateStillAcceptsEmailWithoutUsernameLookup() {
        Account account = account("artist", "artist@example.com");
        when(accountRepository.findByEmail("artist@example.com")).thenReturn(Optional.of(account));
        when(passwordEncoder.matches("secret", account.getPassword())).thenReturn(true);
        when(tokenRepository.save(any(Token.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String tokenUid = authService.authenticate("artist@example.com", "secret", 3600);

        assertNotNull(tokenUid);
        verify(accountRepository, never()).findByUsername(any());
    }

    private Account account(String username, String email) {
        return Account.builder()
            .id("account-id")
            .username(username)
            .email(email)
            .password("$2a$10$encodedPassword")
            .build();
    }
}
