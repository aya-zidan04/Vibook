package com.vibook.entity.converter;

import com.vibook.entity.enums.NotificationKind;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class NotificationKindJpaConverter implements AttributeConverter<NotificationKind, String> {

    @Override
    public String convertToDatabaseColumn(NotificationKind attribute) {
        return attribute == null ? null : attribute.getApiKey();
    }

    @Override
    public NotificationKind convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return NotificationKind.fromApiValue(dbData);
    }
}
