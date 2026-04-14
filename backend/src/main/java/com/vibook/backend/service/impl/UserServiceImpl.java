package com.vibook.backend.service.impl;

import com.vibook.backend.dto.UserResponse;
import com.vibook.backend.dto.UpdateUserRequest;
import com.vibook.backend.entity.User;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.exception.UnauthorizedException;
import com.vibook.backend.mapper.UserMapper;
import com.vibook.backend.repository.UserRepository;
import com.vibook.backend.service.UserService;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(userMapper::toResponse).toList();
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    public UserResponse getCurrentUser() {
        return userMapper.toResponse(getCurrentAuthenticatedUser());
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UpdateUserRequest request) {
        User actor = getCurrentAuthenticatedUser();
        if (!actor.getId().equals(id)) {
            throw new AccessDeniedException("You can only update your own profile");
        }

        User target = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found"));
        target.setFirstName(request.firstName().trim());
        target.setLastName(request.lastName().trim());
        target.setPhone(request.phone().trim());
        User saved = userRepository.save(target);
        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void disableUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("User not found"));
        user.setEnabled(false);
        userRepository.save(user);
    }

    private User getCurrentAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new UnauthorizedException("Unauthorized");
        }

        User user = userRepository.findByEmail(authentication.getName())
            .orElseThrow(() -> new UnauthorizedException("Unauthorized"));
        return user;
    }
}
