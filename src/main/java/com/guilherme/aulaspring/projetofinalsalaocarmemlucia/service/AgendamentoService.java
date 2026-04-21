package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Agendamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.LancamentoFinanceiro;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.AgendamentoDto;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.CategoriaDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.Status;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.TipoDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AgendamentoService {

   private final AgendamentoRepository agendamentoRepository;
   private final ClienteRepository clienteRepository;
   private final ServicoRepository servicoRepository;
   private final FuncionarioRepository funcionarioRepository;
   private final LancamentoFinanceiroRepository lancamentoFinanceiroRepository;

    public Agendamento salvar(AgendamentoDto dto) {
        var cliente = clienteRepository.findById(dto.clienteId()).orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

        var servico = servicoRepository.findById(dto.servicoId()).orElseThrow(() -> new RuntimeException("Serviço não encontrado!"));

        var funcionario = funcionarioRepository.findById(dto.funcionarioId()).orElseThrow(() -> new RuntimeException("Funcionário não encontrado!"));

        if (cliente.getDataNascimento().isAfter(java.time.LocalDate.now().minusYears(16))) {
            throw new RuntimeException("Não é permitido agendamento para menores de 16 anos.");
        }

        Agendamento novoAgendamento = new Agendamento();
        novoAgendamento.setCliente(cliente);
        novoAgendamento.setServico(servico);
        novoAgendamento.setFuncionario(funcionario);
        novoAgendamento.setDataHora(dto.dataHora());
        novoAgendamento.setStatus(Status.PENDENTE);

        return agendamentoRepository.save(novoAgendamento);
    }

    public List<Agendamento> listarTodos() {
        return agendamentoRepository.findAll();}

    public Agendamento buscarPorId(Long id) {
        return agendamentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));
    }


    public void deletar(Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar: Agendamento não encontrado.");
        }
        agendamentoRepository.deleteById(id);
    }


    public void finalizarAtendimento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Agendamento não encontrado para finalizar."));
        agendamento.setStatus(Status.CONFIRMADO);
        agendamentoRepository.save(agendamento);

        LancamentoFinanceiro entrada = new LancamentoFinanceiro();
        entrada.setDescricao("Serviço: " + agendamento.getServico().getNome() + " - Cliente: " + agendamento.getCliente().getNome());

        entrada.setValor(agendamento.getServico().getValor());

        entrada.setTipo(TipoDeLancamento.ENTRADA);
        entrada.setCategoria(CategoriaDeLancamento.SALAO);
        entrada.setData(java.time.LocalDateTime.now());

        lancamentoFinanceiroRepository.save(entrada);
    }
}
