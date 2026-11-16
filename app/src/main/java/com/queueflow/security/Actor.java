package com.queueflow.security;
import com.queueflow.entity.User;
import com.queueflow.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Arrays;

@Component
public class Actor {
    private final UserRepository users;
    public Actor(UserRepository users){this.users=users;}
    public User current() {
        var auth=SecurityContextHolder.getContext().getAuthentication();
        if(auth==null) throw new AccessDeniedException("Sign in required");
        return users.findByEmail(auth.getName()).filter(u->u.active).orElseThrow(()->new AccessDeniedException("Account unavailable"));
    }
    public User require(String... roles) {
        User u=current();if(!Arrays.asList(roles).contains(u.role)) throw new AccessDeniedException("This action is not permitted");return u;
    }
    public void owns(Long userId) {if(!current().id.equals(userId)) throw new AccessDeniedException("This record belongs to another account");}
}
