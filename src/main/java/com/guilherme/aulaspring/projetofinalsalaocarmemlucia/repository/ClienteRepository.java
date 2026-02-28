package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
