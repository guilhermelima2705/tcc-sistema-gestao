package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.LancamentoFinanceiro;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.TipoDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.LancamentoFinanceiroRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LançamentoFinanceiroService {

    private final LancamentoFinanceiroRepository repository;

    public LancamentoFinanceiro cadastrar(Double valor, TipoDeLancamento tipo, LocalDateTime data){
    if(valor < 0 ){
    throw new IllegalArgumentException("Não é possível cadastrar números negativos");
    }
    LancamentoFinanceiro novoLancamento = new LancamentoFinanceiro();
    novoLancamento.setData(data);
    novoLancamento.setValor(valor);
    novoLancamento.setTipo(tipo);

    return repository.save(novoLancamento);
    }

}
