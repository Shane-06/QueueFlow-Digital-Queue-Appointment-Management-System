package com.queueflow.controller;

import com.queueflow.security.Actor;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AuthController {
    private static final Map<String, String> WORKSPACE_NAMES = Map.of(
        "student", "Student", "staff", "Staff", "admin", "Admin"
    );

    private final Actor actor;

    public AuthController(Actor actor) {
        this.actor = actor;
    }

    @GetMapping("/sign-in")
    public String chooseWorkspace() {
        return "sign-in";
    }

    @GetMapping("/login")
    public String login(@RequestParam(defaultValue = "") String role, Model model) {
        String roleName = WORKSPACE_NAMES.get(role);
        model.addAttribute("roleName", roleName);
        model.addAttribute("workspaceRole", roleName == null ? null : role);
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "redirect:/" + actor.current().role.toLowerCase(Locale.ROOT) + "/dashboard";
    }
}
