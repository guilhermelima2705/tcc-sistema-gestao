package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Cliente;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.ClienteDto;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.ClienteRepository;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final ClienteRepository clienteRepository;

    @PostMapping
    public ResponseEntity<?> salvar(@RequestBody @Valid ClienteDto cliente) {
        try {
            Cliente clienteEntidade = cliente.mapearParaCliente();
            Cliente clienteSalvo = service.cadastrar(clienteEntidade);

            URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                    .path("/{id}").buildAndExpand(clienteSalvo.getId()).toUri();

            return ResponseEntity.created(location).body(clienteSalvo);
        } catch (RuntimeException e) {
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
    public ResponseEntity<Page<Cliente>> listarClientesPaginados(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable paginacao = PageRequest.of(page, size, Sort.by("nome").ascending());

        Page<Cliente> resultado = clienteRepository.findAll(paginacao);
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/buscar-por-telefone")
    public ResponseEntity<?> buscarPorTelefone(@RequestParam("telefone") String telefone) {
        Cliente cliente = service.buscarPorTelefonePuro(telefone);

        if (cliente == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Cliente não encontrado.");
        }

        return ResponseEntity.ok(cliente);
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> alternarStatus(@PathVariable Long id) {
        try {
            service.alternarStatus(id);
            return ResponseEntity.ok("Status do cliente alterado com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}