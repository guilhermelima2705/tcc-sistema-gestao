package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.FuncionarioDto;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service.FuncionarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/funcionario")
@RequiredArgsConstructor
public class FuncionarioController {

    public final FuncionarioService service;
    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody @Valid FuncionarioDto funcionario) {
        try {
            Funcionario funcionarioEntidade = funcionario.mapearParaFuncionario();
            funcionarioEntidade = service.cadastrar(funcionarioEntidade);

            // http://localhost:8080/autores/id vai retornar uma url assim
            URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(funcionarioEntidade.getId()).toUri();
            return ResponseEntity.created(location).body(funcionarioEntidade);
        } catch (RuntimeException e) {  //criar um exception aqui
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid FuncionarioDto dto) {
        try {
            Funcionario funcionarioOptional = service.buscarPorId(id);

            funcionarioOptional.setNome(dto.nome());
            funcionarioOptional.setEmail(dto.email());
            funcionarioOptional.setPapel(dto.papel());
            // funcionarioOptional.setSenha(String.valueOf(dto.senha()));  perguntar pro professor se posso alterar a senha diretamente aqui

            service.atualizar(funcionarioOptional);
            return ResponseEntity.noContent().build();
        }catch (RuntimeException e) {  //criar um exception aqui
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping({"{id}"})
    public ResponseEntity<Object> deletar(@PathVariable("id") Long id) {
        try {
            service.deletar(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Funcionario>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping({"{id}"})
    public ResponseEntity<Object> buscarPorId(@PathVariable("id") Long id) {
        try {
            Funcionario funcionario = service.buscarPorId(id);
            return ResponseEntity.ok(funcionario);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @GetMapping("/busca")
    public ResponseEntity<List<Funcionario>> buscarPorNome(@RequestParam(value = "nome", required = false) String nome) {
        return ResponseEntity.ok(service.findByNome(nome));
    }
}
