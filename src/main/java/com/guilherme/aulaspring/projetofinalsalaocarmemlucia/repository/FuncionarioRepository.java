package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {
}
