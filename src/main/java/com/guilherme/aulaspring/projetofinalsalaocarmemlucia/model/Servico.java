package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="servico")
@Data
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id", nullable = false)
    private Long id;
    @Column(name="nome", length = 100, nullable = false)
    private String nome;
    @Column(name="valor", length = 10, nullable = false)
    private Double valor;
    @Column(name="temposervico")
    private Integer duracaoMinutos;

    public Servico() {
    }

    public Servico(Long id, String nome, Double valor, Integer duracaoMinutos) {
        this.id = id;
        this.nome = nome;
        this.valor = valor;
        this.duracaoMinutos = duracaoMinutos;
    }

}
