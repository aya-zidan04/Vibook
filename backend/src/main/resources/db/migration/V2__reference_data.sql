-- Cities (aligned with mobile explore / listing mocks)
CREATE TABLE cities (
    id        BIGSERIAL PRIMARY KEY,
    name_en   VARCHAR(120) NOT NULL,
    name_ar   VARCHAR(120) NOT NULL,
    country   VARCHAR(120) NOT NULL,
    image_url VARCHAR(1024),
    CONSTRAINT uq_cities_name_country UNIQUE (name_en, country)
);

INSERT INTO cities (name_en, name_ar, country) VALUES
    ('Riyadh', 'الرياض', 'Saudi Arabia'),
    ('Jeddah', 'جدة', 'Saudi Arabia'),
    ('Dubai', 'دبي', 'UAE'),
    ('Doha', 'الدوحة', 'Qatar'),
    ('Kuwait City', 'الكويت', 'Kuwait');

-- Categories (explore verticals / filters)
CREATE TABLE categories (
    id       BIGSERIAL PRIMARY KEY,
    slug     VARCHAR(64) NOT NULL UNIQUE,
    label_en VARCHAR(120) NOT NULL,
    label_ar VARCHAR(120) NOT NULL,
    icon     VARCHAR(64)   NOT NULL
);

INSERT INTO categories (slug, label_en, label_ar, icon) VALUES
    ('events', 'Events', 'فعاليات', 'calendar'),
    ('dining', 'Dining', 'مطاعم', 'restaurant'),
    ('stays', 'Stays', 'إقامة', 'bed'),
    ('flights', 'Flights', 'طيران', 'airplane'),
    ('sports', 'Sports', 'رياضة', 'football'),
    ('wellness', 'Wellness', 'عافية', 'leaf'),
    ('travel', 'Packages', 'باقات', 'globe'),
    ('drops', 'Drops', 'إصدارات', 'flash');

-- Cuisines (restaurant cuisineIds in the mobile model; separate from event categories)
CREATE TABLE cuisines (
    id       BIGSERIAL PRIMARY KEY,
    slug     VARCHAR(64) NOT NULL UNIQUE,
    label_en VARCHAR(120) NOT NULL,
    label_ar VARCHAR(120) NOT NULL,
    icon     VARCHAR(64)
);

INSERT INTO cuisines (slug, label_en, label_ar, icon) VALUES
    ('middle_eastern', 'Middle Eastern', 'شرق أوسطي', 'restaurant'),
    ('italian', 'Italian', 'إيطالي', 'pizza'),
    ('japanese', 'Japanese', 'ياباني', 'fish'),
    ('indian', 'Indian', 'هندي', 'flame'),
    ('seafood', 'Seafood', 'مأكولات بحرية', 'fish'),
    ('grill', 'Grill', 'مشويات', 'flame'),
    ('international', 'International', 'عالمي', 'globe');
