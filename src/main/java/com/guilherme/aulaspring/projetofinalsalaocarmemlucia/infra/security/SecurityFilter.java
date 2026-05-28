package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.infra.security;

import com.guilherme.aulaspring.projetofinalsalaocarmemlucia.repository.FuncionarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// Este é o "segurança" que fica na porta. Ele intercepta toda requisição que chega ao servidor.
// Se a pessoa tiver um token válido, ele deixa passar e "loga" a pessoa no sistema automaticamente.
@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {
    private final TokenService tokenService;
    private final FuncionarioRepository funcionarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        var token = this.recoverToken(request);

        if(token != null){
            var email = tokenService.validateToken(token);

            if (email != null && !email.isEmpty()) {
                UserDetails funcionario = funcionarioRepository.findByEmail(email);

                if (funcionario != null) {
                    var authentication = new UsernamePasswordAuthenticationToken(funcionario, null, funcionario.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request){
        var authHeader = request.getHeader("Authorization");
        if(authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}