package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Folga;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.FolgaRepository;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.FuncionarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/folga")
@RequiredArgsConstructor
public class FolgaController {

    private final FolgaRepository folgaRepository;
    private final FuncionarioRepository funcionarioRepository;

    @GetMapping("/funcionario/{id}")
    public ResponseEntity<List<LocalDate>> listarFolgasDoFuncionario(@PathVariable Long id) {
        List<LocalDate> datasObscuras = folgaRepository.buscarDatasDeFolgaDoFuncionario(id, LocalDate.now());
        return ResponseEntity.ok(datasObscuras);
    }

    @PostMapping
    public ResponseEntity<?> salvarFolga(@RequestBody Map<String, Object> payload) {
        try {
            Long funcionarioId = Long.valueOf(payload.get("funcionarioId").toString());
            LocalDate dataBloqueio = LocalDate.parse(payload.get("dataBloqueio").toString());
            String motivo = payload.get("motivo").toString();

            Funcionario func = funcionarioRepository.findById(funcionarioId)
                    .orElseThrow(() -> new RuntimeException("Funcionário não encontrado"));

            Folga folga = new Folga(func, dataBloqueio, motivo);
            folgaRepository.save(folga);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}