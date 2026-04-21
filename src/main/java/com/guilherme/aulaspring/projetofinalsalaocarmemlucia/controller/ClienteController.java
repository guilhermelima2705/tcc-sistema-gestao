package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Cliente;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.ClienteDto;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/cliente")
@RequiredArgsConstructor
public class ClienteController {

    public final ClienteService service;

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody @Valid ClienteDto cliente) {
        try {
            Cliente clienteEntidade = cliente.mapearParaCliente();
            service.cadastrar(clienteEntidade);

            // http://localhost:8080/autores/id vai retornar uma url assim
            URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(clienteEntidade.getId()).toUri();
            return ResponseEntity.created(location).build();
        } catch (RuntimeException e) {  //criar um exception aqui
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("{id}")
    public ResponseEntity<?> atualizar(@PathVariable Long id, @RequestBody @Valid ClienteDto dto) {
        try {
            Cliente clienteOptional = service.buscarPorId(id);

            clienteOptional.setNome(dto.nome());
            clienteOptional.setDataNascimento(dto.dataNascimento());
            clienteOptional.setTelefone(dto.telefone());
            clienteOptional.setCpf(dto.cpf());
            clienteOptional.setObservacoes(dto.observacoes());
            clienteOptional.setAtivo(true);

            service.atualizar(clienteOptional);
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
    public ResponseEntity<List<Cliente>> listar() {
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping({"{id}"})
    public ResponseEntity<Object> buscarPorId(@PathVariable("id") Long id) {
        try {
            Cliente cliente = service.buscarPorId(id);
            return ResponseEntity.ok(cliente);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @GetMapping("/busca")
    public ResponseEntity<List<Cliente>> buscarPersonalizada(@RequestParam(value = "filtro", required = false) String filtro) {
        List<Cliente> resultado = service.buscaPersonalizada(filtro);
        return ResponseEntity.ok(resultado);
    }

}