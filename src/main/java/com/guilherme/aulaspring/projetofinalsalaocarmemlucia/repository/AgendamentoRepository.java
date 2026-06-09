package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

//Essa camada faz algumas implementações de metodos que podemos usar para fazer o CRUD entre o front e banco, nessa camda posso criar alguns metdoos coplementares
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
    @Query(value = """
        SELECT COUNT(a.id) FROM agendamento a 
        JOIN servico s ON s.id = a.servico_id 
        WHERE a.funcionario_id = :funcionarioId 
        AND a.status <> 'CANCELADO'
        AND :inicioNovo < TIMESTAMPADD(MINUTE, s.temposervico, a.data_hora)
        AND TIMESTAMPADD(MINUTE, :duracaoNova, :inicioNovo) > a.data_hora
    """, nativeQuery = true)
    Long contarConflitos(
            @Param("funcionarioId") Long funcionarioId,
            @Param("inicioNovo") LocalDateTime inicioNovo,
            @Param("duracaoNova") Integer duracaoNova
    );
    @Query("""
        SELECT a FROM Agendamento a 
        WHERE a.dataHora BETWEEN :inicio AND :fim 
        AND a.status <> 'CANCELADO'
        ORDER BY a.dataHora ASC
    """)
    List<Agendamento> buscarAgendamentosDoDia(
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}