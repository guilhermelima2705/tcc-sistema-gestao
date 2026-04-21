package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.Status;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

//A camada model serão as classes do nosso sistema, onde nela vão ter as nossas entidades e tabelas que vão esta no banco de dados
//No spring boot utilizamos annotations para classificar e facilitar na hora de escrever o codigo, tem algumas annotations que importam alguns codigos e metodos

@Entity     //defini que essa classe é uma entidade para o banco
@Table(name="agendamento")   //define o nome como vai ser salvo no banco
@Data  //essa annotation serve para criar get/set, hash code e equals e os contrutores e forma automatica
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
