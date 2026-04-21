package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.LancamentoFinanceiro;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.TipoDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.LancamentoFinanceiroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LancamentoFinanceiroService {

    private final LancamentoFinanceiroRepository repository;

    public LancamentoFinanceiro cadastrar(BigDecimal valor, TipoDeLancamento tipo, LocalDateTime data){
    if(valor .compareTo(BigDecimal.ZERO) < 0.){
    throw new IllegalArgumentException("Não é possível cadastrar números negativos");
    }
    LancamentoFinanceiro novoLancamento = new LancamentoFinanceiro();
    novoLancamento.setData(data);
    novoLancamento.setValor(valor);
    novoLancamento.setTipo(tipo);

    return repository.save(novoLancamento);
    }

    public LancamentoFinanceiro salvar(LancamentoFinanceiro lancamento) {
        return repository.save(lancamento);
    }

    public LancamentoFinanceiro buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lançamento financeiro não encontrado!"));
    }

    public List<LancamentoFinanceiro> listarTodos() {
        return repository.findAll();
    }

}
