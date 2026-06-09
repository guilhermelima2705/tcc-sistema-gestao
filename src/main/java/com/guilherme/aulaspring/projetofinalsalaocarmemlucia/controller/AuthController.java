package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.controller;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.Funcionario;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.AuthenticationDTO;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.EmailRequest;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.LoginResponseDTO;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.infra.security.TokenService;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.model.dto.ResetPasswordDTO;
import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service.FuncionarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// Este é o "balcão de atendimento". É aqui que o usuário chega com e-mail e senha.
// Se os dados baterem, ele entrega o "crachá" (Token JWT) para o usuário usar nas próximas chamadas.
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final FuncionarioService funcionarioService;

    @PostMapping("/login")
    public ResponseEntity login(@RequestBody @Valid AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        var token = tokenService.generateToken((Funcionario) auth.getPrincipal());

        return ResponseEntity.ok(new LoginResponseDTO(token));
    }


    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordDTO dto) {
        try {
            funcionarioService.redefinirSenha(dto.token(), dto.novaSenha());
            return ResponseEntity.ok("Senha redefinida com sucesso!");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
