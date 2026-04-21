package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

//Essa camada faz algumas implementações de metodos que podemos usar para fazer o CRUD entre o front e banco, nessa camda posso criar alguns metdoos coplementares
public interface AgendamentoRepository extends JpaRepository<Agendamento, Long> {
}
