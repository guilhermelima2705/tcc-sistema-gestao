package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Example;
import org.springframework.data.domain.ExampleMatcher;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FuncionarioService {

    private final FuncionarioRepository repository;
    private final PasswordEncoder passwordEncoder;

    public Funcionario cadastrar(Funcionario funcionario){
        funcionario.setSenha(passwordEncoder.encode(funcionario.getSenha()));
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

    public List<Funcionario> listarTodos() {

        return repository.findAll();
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

    @Transactional
    public void alternarStatus(Long id) {
        Funcionario f = repository.findById(id).orElseThrow(() -> new RuntimeException("Funcionário não encontrado!"));
        f.setAtivo(!f.getAtivo());
        repository.save(f);
    }


    @Transactional
    public void redefinirSenha(String token, String novaSenha) {
        Funcionario funcionario = repository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Token inválido!"));
        if (funcionario.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Este link de recuperação expirou!");
        }
        funcionario.setSenha(passwordEncoder.encode(novaSenha));
        funcionario.setResetToken(null);
        funcionario.setResetTokenExpiry(null);

        repository.save(funcionario);
    }
    }

