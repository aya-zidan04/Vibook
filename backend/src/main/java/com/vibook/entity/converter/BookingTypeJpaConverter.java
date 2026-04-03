package com.vibook.entity.converter;

import com.vibook.entity.enums.BookingType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BookingTypeJpaConverter implements AttributeConverter<BookingType, String> {

    @Override
    public String convertToDatabaseColumn(BookingType attribute) {
        return attribute == null ? null : attribute.getApiKey();
    }

    @Override
    public BookingType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return BookingType.fromApiValue(dbData);
    }
}
