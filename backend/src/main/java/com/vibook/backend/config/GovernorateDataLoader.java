package com.vibook.backend.config;

import com.vibook.backend.entity.Governorate;
import com.vibook.backend.repository.GovernorateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GovernorateDataLoader {

    private final GovernorateRepository governorateRepository;

    public GovernorateDataLoader(GovernorateRepository governorateRepository) {
        this.governorateRepository = governorateRepository;
    }

    @Transactional
    public void seedIfEmpty() {
        if (governorateRepository.count() > 0) {
            return;
        }
        governorateRepository.save(row(1, "Irbid"));
        governorateRepository.save(row(2, "Ajloun"));
        governorateRepository.save(row(3, "Jerash"));
        governorateRepository.save(row(4, "Mafraq"));
        governorateRepository.save(row(5, "Amman"));
        governorateRepository.save(row(6, "Zarqa"));
        governorateRepository.save(row(7, "Balqa"));
        governorateRepository.save(row(8, "Madaba"));
        governorateRepository.save(row(9, "Karak"));
        governorateRepository.save(row(10, "Tafileh"));
        governorateRepository.save(row(11, "Maan"));
        governorateRepository.save(row(12, "Aqaba"));
    }

    private static Governorate row(int order, String name) {
        Governorate g = new Governorate();
        g.setName(name);
        g.setDisplayOrder(order);
        g.setActive(true);
        return g;
    }
}
