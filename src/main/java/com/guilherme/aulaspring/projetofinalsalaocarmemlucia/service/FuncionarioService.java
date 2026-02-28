package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;

    public Funcionario cadastrar(Funcionario funcionario){
        //depois criar um validador para saber se realmente foi cadastrado
        return repository.save(funcionario);
    }

    public Funcionario atualizar(Funcionario funcionario){
        if(funcionario.getId()== null){
            throw new IllegalArgumentException("Para atualizar e necessário que o funcionário ja esteja salvo na base!"); //talvez criar uma exceção personalizada
        }
        //vou criar um validator e colocar aqui
        return repository.save(funcionario);
    }

    public void deletar(Long id){
        if (!repository.existsById(id)) {
            throw new RuntimeException("Não é possível deletar: funcionário não encontrado."); //talvez criar uma exceção personalizada
        }
        repository.deleteById(id);
    }

    public List<Funcionario> findByNome(String nome){
        if (nome == null || nome.trim().isEmpty()) {
            return repository.findAll();
        }
        var funcionario = new Funcionario();
        funcionario.setNome(nome);

        ExampleMatcher matcher = ExampleMatcher.matching()
                .withIgnorePaths("id", "email", "senha", "papel")
                .withIgnoreNullValues()
                .withIgnoreCase()
                .withStringMatcher(ExampleMatcher.StringMatcher.CONTAINING);

        Example<Funcionario> funcionarioExample = Example.of(funcionario, matcher);
        return repository.findAll(funcionarioExample);
    }

    public Funcionario buscarPorId(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Funcionário não encontrado!"));
    }
}
