package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

// Este é o "tradutor" do sistema. Ele conecta o Spring Security ao seu banco de dados.
// Quando alguém tenta logar, o Spring pede para esta classe buscar o funcionário no seu repositório.
@Service
@RequiredArgsConstructor
public class AuthorizationService implements UserDetailsService {
    private final FuncionarioRepository repository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return repository.findByEmail(username);
    }
}