-- Partner / business join interest (minimal lead capture; no business account yet).
CREATE TABLE business_applications (
    id            BIGSERIAL PRIMARY KEY,
    company_name  VARCHAR(300) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    phone         VARCHAR(32)  NOT NULL,
    category      VARCHAR(120) NOT NULL,
    message       TEXT         NOT NULL,
    status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    CONSTRAINT chk_business_applications_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_business_applications_created ON business_applications (created_at DESC);
CREATE INDEX idx_business_applications_status ON business_applications (status);
