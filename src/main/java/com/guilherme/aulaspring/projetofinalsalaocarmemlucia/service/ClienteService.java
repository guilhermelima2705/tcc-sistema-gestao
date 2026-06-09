package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Cliente;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;

    public Cliente cadastrar(Cliente cliente) {
        if (repository.existsByTelefone(cliente.getTelefone())) {
            throw new RuntimeException("Este número de WhatsApp já está cadastrado para outro cliente!");
        }
        return repository.save(cliente);
    }

    public Cliente buscarPorTelefonePuro(String telefone) {
        return repository.findByTelefone(telefone).orElse(null);
    }

    public Cliente atualizar(Cliente cliente) {
        if (cliente.getId() == null) {
            throw new IllegalArgumentException("Não é possível atualizar um cliente sem ID!");
        }
        return repository.save(cliente);
    }
    //Ve com o professor se mantenho o metodo deletar ou mudar apenas o status
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar: Cliente não encontrado.");
        }
        repository.deleteById(id);
    }

    public List<Cliente> listarTodos() {

        return repository.findAll();
    }

    public Cliente buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));
    }

    // Descidir se vou cadastrar o CPF mesmo no sistema, mas ja colocar o metododo para pesquisar um ou outro
    public List<Cliente> buscaPersonalizada(String filtro) {
        if (filtro == null || filtro.trim().isEmpty()) {
            return repository.findAll();
        }

        Cliente filtros = new Cliente();
        filtros.setNome(filtro);
        filtros.setCpf(filtro);

        ExampleMatcher matcher = ExampleMatcher.matchingAny()
                .withIgnorePaths("id", "telefone", "observacoes")
                .withIgnoreNullValues()
                .withIgnoreCase()
                .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING);

        return repository.findAll(Example.of(filtros, matcher));
    }

    @Transactional
    public void alternarStatus(Long id) {
        Cliente c = repository.findById(id).orElseThrow(() -> new RuntimeException("Cliente não encontrado!"));
        c.setAtivo(!c.getAtivo());
        repository.save(c);
    }
}