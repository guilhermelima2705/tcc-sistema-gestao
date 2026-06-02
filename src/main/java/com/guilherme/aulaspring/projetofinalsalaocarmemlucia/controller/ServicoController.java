package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Servico;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.ServicoDto;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service.ServicoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/servico")
@RequiredArgsConstructor
public class ServicoController {

    public final ServicoService service;

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody @Valid ServicoDto dto) {
        try {
            Servico servicoEntidade = dto.mapearParaServico();
            servicoEntidade = service.cadastrar(servicoEntidade);

            // http://localhost:8080/autores/id vai retornar uma url assim
            URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(servicoEntidade.getId()).toUri();
            return ResponseEntity.created(location).build();
        } catch (RuntimeException e) {  //criar um exception aqui
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid ServicoDto dto) {
        try {
            Servico servicoOptional = service.buscarPorId(id);

            servicoOptional.setNome(dto.nome());
            servicoOptional.setValor(dto.valor());
            servicoOptional.setDuracaoMinutos(dto.duracaoMinutos());
            servicoOptional.setDescricao(dto.descricao());

            service.atualizar(servicoOptional);
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
    public ResponseEntity<List<Servico>> listar() {

        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping({"{id}"})
    public ResponseEntity<Object> buscarPorId(@PathVariable("id") Long id) {
        try {
            Servico servico = service.buscarPorId(id);
            return ResponseEntity.ok(servico);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/busca")
    public ResponseEntity<List<Servico>> buscarPorNome(@RequestParam(value = "nome", required = false) String nome) {
        return ResponseEntity.ok(service.findByNome(nome));
    }
}
