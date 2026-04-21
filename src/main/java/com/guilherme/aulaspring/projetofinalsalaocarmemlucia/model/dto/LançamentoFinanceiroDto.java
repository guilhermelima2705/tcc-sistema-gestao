package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.LancamentoFinanceiro;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.CategoriaDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.TipoDeLancamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record LançamentoFinanceiroDto(
        @NotBlank(message = "A descrição é obrigatória")
        String descricao,
        @NotNull(message = "O valor é obrigatório")
        @DecimalMin(value = "0.01", message = "O valor deve ser maior que zero")
        BigDecimal valor,
        @NotNull(message = "O tipo (ENTRADA/SAIDA) é obrigatório")
        TipoDeLancamento tipo,
        @NotNull(message = "A categoria é obrigatória")
        CategoriaDeLancamento categoria
) {
    public LancamentoFinanceiro mapearParaLancamento() {
        LancamentoFinanceiro lancamento = new LancamentoFinanceiro();
        lancamento.setDescricao(this.descricao);
        lancamento.setValor(this.valor);
        lancamento.setTipo(this.tipo);
        lancamento.setCategoria(this.categoria);
        lancamento.setData(LocalDateTime.now()); // Data do momento do cadastro
        return lancamento;
    }
}
