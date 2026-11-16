package com.queueflow.controller;
import com.queueflow.security.Actor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
@Controller
public class AuthController {
    private final Actor actor;public AuthController(Actor actor){this.actor=actor;}
    @GetMapping("/login") public String login(){return "login";}
    @GetMapping("/dashboard") public String dashboard(){return "redirect:/"+actor.current().role.toLowerCase()+"/dashboard";}
    @GetMapping({"/student/dashboard","/staff/dashboard","/admin/dashboard"})
    public String roleDashboard(Model model){model.addAttribute("account",actor.current());return "dashboard";}
}
