package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
    UserDetails findByEmail(String email);
    Optional<Funcionario> findByResetToken(String token);
}
