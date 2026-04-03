package com.vibook.exception;

public class CityNotFoundException extends RuntimeException {

    public CityNotFoundException() {
        super("No city exists for the given cityId");
    }
}
