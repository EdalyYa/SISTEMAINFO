CREATE TABLE IF NOT EXISTS batch_uploads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed TINYINT(1) DEFAULT 0,
  num_certificates INT DEFAULT 0,
  error_log TEXT,
  INDEX idx_processed (processed),
  INDEX idx_upload_date (upload_date)
);
