package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Cliente;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.ClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository repository;

    public Cliente salvar(Cliente cliente) {
        //  criar um validador de CPF e depois adicionar
        return repository.save(cliente);
    }

    public Cliente atualizar(Cliente cliente) {
        if (cliente.getId() == null) {
            throw new IllegalArgumentException("Não é possível atualizar um cliente sem ID!");
        }
        return repository.save(cliente);
    }

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
    public List<Cliente> buscaPersonalizada(String termo) {
        if (termo == null || termo.trim().isEmpty()) {
            return repository.findAll();
        }

        Cliente filtro = new Cliente();
        filtro.setNome(termo);
        filtro.setCpf(termo);

        ExampleMatcher matcher = ExampleMatcher.matchingAny()
                .withIgnorePaths("id", "telefone", "observacoes")
                .withIgnoreNullValues()
                .withIgnoreCase()
                .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING);

        return repository.findAll(Example.of(filtro, matcher));
    }
}