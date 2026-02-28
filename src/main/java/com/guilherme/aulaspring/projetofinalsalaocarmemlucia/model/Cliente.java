package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;


import jakarta.persistence.*;
import lombok.Data;

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
    @Column(name="telefone", length = 10, nullable = false)
   private String telefone;
    @Column(name="cpf", length = 10, nullable = true)
   private String cpf;
    @Column(name="observacoes", length = 300, nullable = true)
   private String observacoes;


    public Cliente() {
    }

    public Cliente(Long id, String nome, String telefone, String cpf, String observacoes) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.cpf = cpf;
        this.observacoes = observacoes;
    }


}
