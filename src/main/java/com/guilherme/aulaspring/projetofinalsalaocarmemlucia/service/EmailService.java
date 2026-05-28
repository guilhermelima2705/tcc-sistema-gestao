package com.guilherme.aulaspring.projetofinalsalaocarmemlucia.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    //JavaMailSender é uma interface do Spring que abstrai toda a complexidade de envios de email, vamos usa-las para recuperar senhas
    private final JavaMailSender mailSender;

    public void enviarEmail(String para, String assunto, String texto) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("guilherme.2705.gsl@gmail.com");
        message.setTo(para);
        message.setSubject(assunto);
        message.setText(texto);
        mailSender.send(message);
    }
}
