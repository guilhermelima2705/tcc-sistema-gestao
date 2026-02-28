package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.CategoriaDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.TipoDeLancamento;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name="Financeiro")
@Data
public class LancamentoFinanceiro {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long Id;
    @Column(name="descricao", length = 200, nullable = true)
    private String descricao;
    @Column(name="valor", length = 10, nullable = false)
    private Double valor;
    @Column(name="lacamento", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoDeLancamento tipo;
    @Column(name="categoria", length = 50, nullable = false)
    @Enumerated(EnumType.STRING)
    private CategoriaDeLancamento categoria;
    @Column(name="data", length = 20, nullable = false)
    private LocalDateTime data;

    public LancamentoFinanceiro() {
    }

    public LancamentoFinanceiro(Long id, String descricao, Double valor, TipoDeLancamento tipo, CategoriaDeLancamento categoria, LocalDateTime data) {
        Id = id;
        this.descricao = descricao;
        this.valor = valor;
        this.tipo = tipo;
        this.categoria = categoria;
        this.data = data;
    }

}
