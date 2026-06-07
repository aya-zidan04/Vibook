package com.vibook.backend.util;

import com.vibook.backend.entity.BusinessEvent;
import com.vibook.backend.exception.BadRequestException;
import java.time.LocalDate;

public final class BusinessEventValidation {

    public static final int MAX_PHOTOS = 12;
    public static final int MIN_TITLE_LENGTH = 3;
    public static final int MAX_TITLE_LENGTH = 255;
    public static final int MIN_DESCRIPTION_LENGTH = 10;
    public static final int MAX_DESCRIPTION_LENGTH = 4000;

    private BusinessEventValidation() {}

    public static void validateEventDateNotPast(LocalDate eventDate) {
        if (eventDate == null) {
            return;
        }
        if (eventDate.isBefore(LocalDate.now())) {
            throw new BadRequestException("Event date cannot be in the past");
        }
    }

    public static void validatePhotoCount(int count) {
        if (count > MAX_PHOTOS) {
            throw new BadRequestException("At most " + MAX_PHOTOS + " photos are allowed per event");
        }
    }

    /** Visible events must have at least one photo (supports create-then-upload flow when hidden=true). */
    public static void validateVisibleEventHasPhotos(BusinessEvent event) {
        if (event.isHidden()) {
            return;
        }
        if (event.getPhotos() == null || event.getPhotos().isEmpty()) {
            throw new BadRequestException("At least one photo is required for visible events");
        }
    }
}
