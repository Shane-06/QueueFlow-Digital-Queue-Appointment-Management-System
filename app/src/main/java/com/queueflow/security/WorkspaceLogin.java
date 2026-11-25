package com.queueflow.security;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Locale;
import java.util.Set;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.WebAuthenticationDetails;

final class WorkspaceLogin extends WebAuthenticationDetails {
    private static final Set<String> ROLES = Set.of("student", "staff", "admin");

    private final String role;

    WorkspaceLogin(HttpServletRequest request) {
        super(request);
        role = request.getParameter("role");
    }

    static AuthenticationManager authenticationManager(AuthenticationProvider provider) {
        var credentials = new ProviderManager(provider);
        return request -> {
            var account = credentials.authenticate(request);
            if (request.getDetails() instanceof WorkspaceLogin workspace && workspace.role != null) {
                String role = workspace.role;
                if (!ROLES.contains(role) || account.getAuthorities().stream().noneMatch(
                    authority -> authority.getAuthority().equals("ROLE_" + role.toUpperCase(Locale.ROOT)))) {
                    throw new WorkspaceMismatch();
                }
            }
            return account;
        };
    }

    static String failurePath(HttpServletRequest request, AuthenticationException failure) {
        String role = request.getParameter("role");
        if (role == null || !ROLES.contains(role)) {
            return "/login?error";
        }
        return "/login?role=" + role + (failure instanceof WorkspaceMismatch ? "&workspaceMismatch" : "&error");
    }

    private static final class WorkspaceMismatch extends AuthenticationException {
        WorkspaceMismatch() {
            super("Account does not match the selected workspace");
        }
    }
}
