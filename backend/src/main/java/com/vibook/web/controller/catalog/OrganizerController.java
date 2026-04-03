package com.vibook.web.controller.catalog;

import com.vibook.service.catalog.CatalogReadService;
import com.vibook.web.dto.catalog.OrganizerResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/organizers")
public class OrganizerController {

    private final CatalogReadService catalogReadService;

    public OrganizerController(CatalogReadService catalogReadService) {
        this.catalogReadService = catalogReadService;
    }

    @GetMapping("/{id}")
    public OrganizerResponse get(@PathVariable long id) {
        return catalogReadService.getOrganizer(id);
    }
}
