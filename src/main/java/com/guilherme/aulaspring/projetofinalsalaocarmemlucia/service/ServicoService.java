package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Servico;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.ServicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServicoService {

    private final ServicoRepository repository;

    public Servico cadastrar(Servico servico){
        //depois criar um validador para saber se realmente foi cadastrado
        return repository.save(servico);
    }

    public Servico atualizar(Servico servico){
        if(servico.getId()== null){
            throw new IllegalArgumentException("Para atualizar e necessário que o serviço ja esteja salvo na base!"); //talvez criar uma exceção personalizada
        }
        //vou criar um validator e colocar aqui
        return repository.save(servico);
    }

    public void deletar(Long id){
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar: serviço não encontrado."); //talvez criar uma exceção personalizada
        }
        repository.deleteById(id);
    }

    public List<Servico> findByNome(String nome){
        if (nome == null || nome.trim().isEmpty()) {
            return repository.findAll();
        }
        var service = new Servico();
        service.setNome(nome);

        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("id", "valor", "duracaoMinutos")
                .withIgnoreNullValues()
                .withIgnoreCase()
                .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING);

        Example<Servico> servicoExample = Example.of(service, matcher);
        return repository.findAll(servicoExample);
    }

}
