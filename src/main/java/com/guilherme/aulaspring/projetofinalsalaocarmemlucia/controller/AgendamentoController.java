package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Agendamento;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.AgendamentoDto;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service.AgendamentoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/agendamento")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AgendamentoController {

    private final AgendamentoService service;

    @PostMapping
    public ResponseEntity<?> agendar(@RequestBody @Valid AgendamentoDto dto) {
        try {
            Agendamento salvo = service.salvar(dto);
            return ResponseEntity.ok(salvo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    //Eu usaria Put, mas eu vi que essa outra anottation fica melhor para para fazer uma mudança parcial
    @PatchMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarAtendimento(@PathVariable Long id) {
        try {
            service.finalizarAtendimento(id);
            return ResponseEntity.ok().body("Atendimento finalizado com sucesso e financeiro gerado!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<Agendamento>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }
}