package com.vibook.entity.converter;

import com.vibook.entity.enums.ListingVertical;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ListingVerticalJpaConverter implements AttributeConverter<ListingVertical, String> {

    @Override
    public String convertToDatabaseColumn(ListingVertical attribute) {
        return attribute == null ? null : attribute.getApiKey();
    }

    @Override
    public ListingVertical convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return ListingVertical.fromApiPath(dbData);
    }
}
