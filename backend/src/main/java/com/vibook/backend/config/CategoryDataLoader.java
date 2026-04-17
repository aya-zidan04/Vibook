package com.vibook.backend.config;

import com.vibook.backend.entity.Category;
import com.vibook.backend.entity.Subcategory;
import com.vibook.backend.repository.CategoryRepository;
import com.vibook.backend.repository.SubcategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CategoryDataLoader {

    private final CategoryRepository categoryRepository;
    private final SubcategoryRepository subcategoryRepository;

    public CategoryDataLoader(CategoryRepository categoryRepository, SubcategoryRepository subcategoryRepository) {
        this.categoryRepository = categoryRepository;
        this.subcategoryRepository = subcategoryRepository;
    }

    @Transactional
    public void seedIfEmpty() {
        if (categoryRepository.count() > 0) {
            return;
        }

        Category entertainment = category("Entertainment", "entertainment", "musical-notes-outline");
        Category dining = category("Dining", "dining", "restaurant-outline");
        Category sports = category("Sports", "sports", "football-outline");
        Category learning = category("Learning", "learning", "school-outline");
        categoryRepository.save(entertainment);
        categoryRepository.save(dining);
        categoryRepository.save(sports);
        categoryRepository.save(learning);

        sub(entertainment, "Comedy", "comedy");
        sub(entertainment, "Theater", "theater");
        sub(entertainment, "Concerts", "concerts");

        sub(dining, "Restaurants", "restaurants");
        sub(dining, "Cafes", "cafes");

        sub(sports, "Matches", "matches");
        sub(sports, "Activities", "activities");
        sub(sports, "Fitness", "fitness");

        sub(learning, "Conferences", "conferences");
        sub(learning, "Workshops", "workshops");
        sub(learning, "Courses", "courses");
    }

    private static Category category(String name, String slug, String icon) {
        Category c = new Category();
        c.setName(name);
        c.setSlug(slug);
        c.setIcon(icon);
        c.setActive(true);
        return c;
    }

    private void sub(Category parent, String name, String slug) {
        Subcategory s = new Subcategory();
        s.setCategory(parent);
        s.setName(name);
        s.setSlug(slug);
        s.setActive(true);
        subcategoryRepository.save(s);
    }
}
