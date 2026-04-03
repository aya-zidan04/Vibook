-- Safe after cities exist: nullable FK preserves existing rows with city_id NULL
ALTER TABLE users
    ADD CONSTRAINT fk_users_city
        FOREIGN KEY (city_id) REFERENCES cities (id)
        ON DELETE SET NULL;
