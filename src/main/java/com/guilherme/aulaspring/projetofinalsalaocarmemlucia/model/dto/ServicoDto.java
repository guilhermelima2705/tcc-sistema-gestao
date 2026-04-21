package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Servico;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ServicoDto(
        @NotBlank String nome,
        @NotNull BigDecimal valor,
        @NotNull Integer duracaoMinutos
) {
    public Servico mapearParaServico() {
        Servico s = new Servico();
        s.setNome(this.nome);
        s.setValor(this.valor);
        s.setDuracaoMinutos(this.duracaoMinutos);
        return s;
    }
}
