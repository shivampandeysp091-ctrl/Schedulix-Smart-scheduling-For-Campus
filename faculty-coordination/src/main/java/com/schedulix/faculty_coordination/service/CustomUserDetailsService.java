package com.schedulix.faculty_coordination.service;

import com.schedulix.faculty_coordination.model.User;
import com.schedulix.faculty_coordination.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // UserRepository ka istemal karke database se user ko dhoondhna
        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isEmpty()) {
            System.err.println("LoadUserByUsername: User not found: " + username);
            throw new UsernameNotFoundException("User not found with username: " + username);
        }

        System.out.println("LoadUserByUsername: Found user: " + username + " with password hash length: " + userOptional.get().getPassword().length());


        // Agar user mil jaata hai, toh uski details waapis bhejna
        return userOptional.get();
    }
}

