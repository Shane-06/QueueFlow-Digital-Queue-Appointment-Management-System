package com.queueflow.security;
import com.queueflow.repository.UserRepository;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwordEncoder(){return new BCryptPasswordEncoder();}
    @Bean UserDetailsService userDetails(UserRepository users){return email->users.findByEmail(email.trim().toLowerCase())
        .map(u->User.withUsername(u.email).password(u.passwordHash).roles(u.role).disabled(!u.active).build())
        .orElseThrow(()->new UsernameNotFoundException("Invalid credentials"));}
    @Bean SecurityFilterChain security(HttpSecurity http, UserRepository users,
                                      UserDetailsService userDetails, PasswordEncoder passwordEncoder) throws Exception {
        var provider = new DaoAuthenticationProvider(userDetails);
        provider.setPasswordEncoder(passwordEncoder);
        http.authenticationManager(WorkspaceLogin.authenticationManager(provider));
        http.authorizeHttpRequests(a->a.requestMatchers("/","/sign-in","/login","/css/**","/js/**","/images/campus-services.webp","/error").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN").requestMatchers("/staff/**").hasRole("STAFF")
            .requestMatchers("/student/**").hasRole("STUDENT").anyRequest().authenticated())
            .formLogin(form -> form.loginPage("/login")
                .authenticationDetailsSource(WorkspaceLogin::new)
                .failureHandler((request, response, failure) ->
                    response.sendRedirect(request.getContextPath() + WorkspaceLogin.failurePath(request, failure)))
                .defaultSuccessUrl("/dashboard", true)
                .permitAll())
            .logout(l->l.logoutSuccessUrl("/login?logout").invalidateHttpSession(true).deleteCookies("JSESSIONID"))
            .addFilterBefore(new OncePerRequestFilter(){
                @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws IOException,ServletException {
                    var auth=SecurityContextHolder.getContext().getAuthentication();
                    if(auth!=null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                        var account=users.findByEmail(auth.getName());
                        if(account.isEmpty() || !account.get().active || auth.getAuthorities().stream().noneMatch(a->a.getAuthority().equals("ROLE_"+account.get().role))) {
                            SecurityContextHolder.clearContext();if(req.getSession(false)!=null)req.getSession(false).invalidate();res.sendRedirect("/login?disabled");return;
                        }
                    }
                    chain.doFilter(req,res);
                }
            },UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
