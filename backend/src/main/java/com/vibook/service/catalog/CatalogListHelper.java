package com.vibook.service.catalog;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

public final class CatalogListHelper {

    private CatalogListHelper() {
    }

    public static <T> List<T> orderByIds(List<Long> ids, List<T> loaded, Function<T, Long> idGetter) {
        Map<Long, T> map = loaded.stream().collect(Collectors.toMap(idGetter, Function.identity(), (a, b) -> a));
        List<T> out = new ArrayList<>(ids.size());
        for (Long id : ids) {
            T t = map.get(id);
            if (t != null) {
                out.add(t);
            }
        }
        return out;
    }
}
