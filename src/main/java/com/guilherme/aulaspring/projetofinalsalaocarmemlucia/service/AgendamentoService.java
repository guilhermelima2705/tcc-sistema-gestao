package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Agendamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.LancamentoFinanceiro;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.AgendamentoDto;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.CategoriaDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.Status;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.enums.TipoDeLancamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.*;
import lombok.RequiredArgsConstructor;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

//A camada service é a camada onde vamos colocar todas as validações e todos os metodos que o sistema vai trabalhar
@Service  //define essa classe como service
@RequiredArgsConstructor    //Cria um construtor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final LancamentoFinanceiroRepository lancamentoFinanceiroRepository;

    public Agendamento salvar(AgendamentoDto dto) {
        var cliente = clienteRepository.findById(dto.clienteId()).orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));

        if (!cliente.getAtivo()) {
            throw new RuntimeException("Agendamento negado: O cliente encontra-se inativo no sistema.");
        }

        var servico = servicoRepository.findById(dto.servicoId()).orElseThrow(() -> new RuntimeException("Serviço não encontrado!"));

        var funcionario = funcionarioRepository.findById(dto.funcionarioId()).orElseThrow(() -> new RuntimeException("Funcionário não encontrado!"));

        if (!funcionario.getAtivo()) {
            throw new RuntimeException("Agendamento negado: O funcionário selecionado não está ativo.");
        }

        if (cliente.getDataNascimento().isAfter(java.time.LocalDate.now().minusYears(16))) {
            throw new RuntimeException("Não é permitido agendamento para menores de 16 anos.");
        }

        Integer duracaoDoServico = servico.getDuracaoMinutos();

        Long totalConflitos = agendamentoRepository.contarConflitos(
                dto.funcionarioId(),
                dto.dataHora(),
                duracaoDoServico
        );

        if (totalConflitos > 0) {
            throw new RuntimeException("Este colaborador já possui um atendimento em andamento ou agendado dentro deste intervalo de tempo!");
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
        return agendamentoRepository.findAll();
    }

    public Agendamento buscarPorId(Long id) {
        return agendamentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Agendamento não encontrado com o ID: " + id));
    }


    public void deletar(Long id) {
        if (!agendamentoRepository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar: Agendamento não encontrado.");
        }
        agendamentoRepository.deleteById(id);
    }


    @Transactional
    public void finalizarAtendimento(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id).orElseThrow(() -> new RuntimeException("Agendamento não encontrado para finalizar."));

        if (Status.CONFIRMADO.equals(agendamento.getStatus())) {
            throw new RuntimeException("Este atendimento já foi finalizado anteriormente!");
        }
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

    private String gerarLinkWhatsApp(String telefone, String nomeCliente, String data, String hora) {
        String telefoneLimpo = telefone.replaceAll("[^0-9]", "");
        String mensagem = "Olá, " + nomeCliente + "! Lembrete de agendamento no Salão Carmem Lúcia: " +
                data + " às " + hora + ". Te esperamos!";

        String mensagemCodificada = URLEncoder.encode(mensagem, StandardCharsets.UTF_8);
        return "https://wa.me/" + telefoneLimpo + "?text=" + mensagemCodificada;
    }

    public AgendamentoDto buscarAgendamentoComLink(Long id) {
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        String link = null; // Começa como nulo

        LocalDate hoje = LocalDate.now();
        LocalDate dataAgendamento = agendamento.getDataHora().toLocalDate();

        if (hoje.plusDays(1).equals(dataAgendamento)) {
            DateTimeFormatter formatoData = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            DateTimeFormatter formatoHora = DateTimeFormatter.ofPattern("HH:mm");

            link = gerarLinkWhatsApp(
                    agendamento.getCliente().getTelefone(),
                    agendamento.getCliente().getNome(),
                    agendamento.getDataHora().format(formatoData),
                    agendamento.getDataHora().format(formatoHora)
            );
        }

        return new AgendamentoDto(
                agendamento.getCliente().getId(),
                agendamento.getFuncionario().getId(),
                agendamento.getServico().getId(),
                agendamento.getDataHora(),
                link
        );
    }

    public List<Agendamento> listarAgendamentosDeAmanha() {
        // Pega a data de hoje e adiciona 1 dia (Amanhã)
        java.time.LocalDate amanha = java.time.LocalDate.now().plusDays(1);

        // Define o primeiro segundo do dia (00:00:00) e o último segundo (23:59:59)
        LocalDateTime inicioDoDia = amanha.atStartOfDay();
        LocalDateTime fimDoDia = amanha.atTime(23, 59, 59);

        return agendamentoRepository.buscarAgendamentosDoDia(inicioDoDia, fimDoDia);
    }
}

