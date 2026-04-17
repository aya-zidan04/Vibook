package com.vibook.backend.service.impl;

import com.vibook.backend.dto.GovernorateRequest;
import com.vibook.backend.dto.GovernorateResponse;
import com.vibook.backend.entity.Governorate;
import com.vibook.backend.exception.BadRequestException;
import com.vibook.backend.exception.NotFoundException;
import com.vibook.backend.mapper.GovernorateMapper;
import com.vibook.backend.repository.GovernorateRepository;
import com.vibook.backend.service.GovernorateService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GovernorateServiceImpl implements GovernorateService {

    private final GovernorateRepository governorateRepository;
    private final GovernorateMapper governorateMapper;

    public GovernorateServiceImpl(GovernorateRepository governorateRepository, GovernorateMapper governorateMapper) {
        this.governorateRepository = governorateRepository;
        this.governorateMapper = governorateMapper;
    }

    @Override
    @Transactional
    public GovernorateResponse createGovernorate(GovernorateRequest request) {
        String name = request.name().trim();
        if (governorateRepository.existsByName(name)) {
            throw new BadRequestException("Governorate name already exists");
        }
        Governorate saved = governorateRepository.save(governorateMapper.newEntity(request));
        return governorateMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GovernorateResponse> getAllGovernorates() {
        return governorateRepository.findAllByOrderByDisplayOrderAscNameAsc().stream()
            .map(governorateMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<GovernorateResponse> getActiveGovernorates() {
        return governorateRepository.findAllByActiveTrueOrderByDisplayOrderAscNameAsc().stream()
            .map(governorateMapper::toResponse)
            .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GovernorateResponse getGovernorateById(Long id) {
        return governorateMapper.toResponse(requireGovernorate(id));
    }

    @Override
    @Transactional
    public GovernorateResponse updateGovernorate(Long id, GovernorateRequest request) {
        Governorate entity = requireGovernorate(id);
        String name = request.name().trim();
        governorateRepository.findByName(name)
            .filter(g -> !g.getId().equals(id))
            .ifPresent(g -> {
                throw new BadRequestException("Governorate name already exists");
            });
        governorateMapper.applyRequest(entity, request);
        return governorateMapper.toResponse(governorateRepository.save(entity));
    }

    @Override
    @Transactional
    public void deleteGovernorate(Long id) {
        Governorate entity = requireGovernorate(id);
        governorateRepository.delete(entity);
    }

    private Governorate requireGovernorate(Long id) {
        return governorateRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Governorate not found"));
    }
}
