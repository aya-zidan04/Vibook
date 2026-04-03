package com.vibook.web.controller.catalog;

import com.vibook.service.catalog.CatalogReadService;
import com.vibook.web.dto.catalog.EventResponse;
import com.vibook.web.dto.catalog.TicketTierResponse;
import com.vibook.web.dto.common.PageResponse;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
@Validated
public class EventController {

    private final CatalogReadService catalogReadService;

    public EventController(CatalogReadService catalogReadService) {
        this.catalogReadService = catalogReadService;
    }

    @GetMapping
    public PageResponse<EventResponse> list(
            @RequestParam(required = false) Long cityId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long organizerId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            @RequestParam(required = false) String sort
    ) {
        return catalogReadService.listEvents(cityId, categoryId, organizerId, q, page, size, sort);
    }

    @GetMapping("/{id}/tiers")
    public List<TicketTierResponse> tiers(@PathVariable long id) {
        return catalogReadService.listTiersForEvent(id);
    }

    @GetMapping("/{id}")
    public EventResponse get(@PathVariable long id) {
        return catalogReadService.getEvent(id);
    }
}
