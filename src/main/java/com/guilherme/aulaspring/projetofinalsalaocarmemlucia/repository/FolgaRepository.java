package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Folga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FolgaRepository extends JpaRepository<Folga, Long> {

    // ✨ Busca todas as folgas futuras de um funcionário específico
    @Query("SELECT f.dataBloqueio FROM Folga f WHERE f.funcionario.id = :funcionarioId AND f.dataBloqueio >= :hoje")
    List<LocalDate> buscarDatasDeFolgaDoFuncionario(@Param("funcionarioId") Long funcionarioId, @Param("hoje") LocalDate hoje);
}