package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.CategoriaFuncionario;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="funcionario")
@Data
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;
    @Column(name="nome", length = 100, nullable = false)
    private String nome;
    @Column(name="email", length = 50, nullable = true)
    private String email;
    @Column(name="senha", length = 6, nullable = false)
    private String senha;
    @Column(name="papel", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private CategoriaFuncionario papel;

    public Funcionario() {
    }

    public Funcionario(Long id, String nome, String email, String senha, CategoriaFuncionario papel) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.papel = papel;
    }
}
