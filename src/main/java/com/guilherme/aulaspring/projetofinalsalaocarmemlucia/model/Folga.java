package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Table(name = "folga")
@Data
public class Folga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "funcionario_id", nullable = false)
    private Funcionario funcionario;

    @Column(name = "data_bloqueio", nullable = false)
    private LocalDate dataBloqueio;

    @Column(name = "motivo", length = 100)
    private String motivo;

    public Folga() {}

    public Folga(Funcionario funcionario, LocalDate dataBloqueio, String motivo) {
        this.funcionario = funcionario;
        this.dataBloqueio = dataBloqueio;
        this.motivo = motivo;
    }
}