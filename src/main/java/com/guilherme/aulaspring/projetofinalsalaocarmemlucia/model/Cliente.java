package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;


import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name="cliente")
@Data
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
   private Long id;
    @Column(name="nome", length = 100, nullable = false)
   private String nome;
    @Column(name="telefone", length = 15, nullable = false)
   private String telefone;
    @Column(name="cpf", length = 10, nullable = true)
   private String cpf;
    @Column(name="data_nascimento", nullable = false)
    private LocalDate dataNascimento;
    @Column(name="ativo")
    private Boolean ativo = true;
    @Column(name="observacoes", length = 300, nullable = true)
   private String observacoes;


    public Cliente() {
    }

    public Cliente(Long id, String nome, String telefone, String cpf, LocalDate dataNascimento, Boolean ativo, String observacoes) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.cpf = cpf;
        this.dataNascimento = dataNascimento;
        this.ativo = ativo;
        this.observacoes = observacoes;
    }
}
