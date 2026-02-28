package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ServicoRepository extends JpaRepository<Servico, Long> {


}