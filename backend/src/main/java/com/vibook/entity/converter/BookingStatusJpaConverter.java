package com.vibook.entity.converter;

import com.vibook.entity.enums.BookingStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BookingStatusJpaConverter implements AttributeConverter<BookingStatus, String> {

    @Override
    public String convertToDatabaseColumn(BookingStatus attribute) {
        return attribute == null ? null : attribute.getApiKey();
    }

    @Override
    public BookingStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return BookingStatus.fromApiValue(dbData);
    }
}
