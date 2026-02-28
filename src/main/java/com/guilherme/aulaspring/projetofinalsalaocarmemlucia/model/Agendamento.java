package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.Status;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Entity
@Table(name="agendamento")
@Data
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;
    @Column(name = "data_hora")
    private LocalDateTime dataHora;
    @ManyToOne
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;
    @ManyToOne
    @JoinColumn(name = "servico_id")
    private Servico servico;
    @ManyToOne
    @JoinColumn(name = "funcionario_id")
    private Funcionario funcionario;
    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private Status status;

    public Agendamento() {
    }

    public Agendamento(Long id, LocalDateTime dataHora, Cliente cliente, Servico servico, Funcionario funcionario, Status status) {
        this.id = id;
        this.dataHora = dataHora;
        this.cliente = cliente;
        this.servico = servico;
        this.funcionario = funcionario;
        this.status = status;
    }
}
