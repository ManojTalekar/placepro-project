-- ============================================================
-- PlacePro Cloud - Complete MySQL Database Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS placepro_cloud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE placepro_cloud;

-- ============================================================
-- USERS TABLE (Common for all roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin', 'recruiter') NOT NULL DEFAULT 'student',
  is_active TINYINT(1) DEFAULT 1,
  profile_picture VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- STUDENT PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS student_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  roll_number VARCHAR(50),
  phone VARCHAR(15),
  date_of_birth DATE,
  gender ENUM('Male', 'Female', 'Other'),
  address TEXT,
  college VARCHAR(200),
  department VARCHAR(100),
  degree VARCHAR(100),
  specialization VARCHAR(100),
  graduation_year YEAR,
  cgpa DECIMAL(4,2),
  backlogs INT DEFAULT 0,
  tenth_percentage DECIMAL(5,2),
  twelfth_percentage DECIMAL(5,2),
  linkedin_url VARCHAR(300),
  github_url VARCHAR(300),
  portfolio_url VARCHAR(300),
  bio TEXT,
  placement_status ENUM('not_placed', 'placed', 'opted_out') DEFAULT 'not_placed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- STUDENT SKILLS
-- ============================================================
CREATE TABLE IF NOT EXISTS student_skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  skill_name VARCHAR(100) NOT NULL,
  skill_type ENUM('technical', 'soft', 'language', 'tool') DEFAULT 'technical',
  proficiency ENUM('beginner', 'intermediate', 'advanced', 'expert') DEFAULT 'intermediate',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- STUDENT PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS student_projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  tech_stack VARCHAR(500),
  project_url VARCHAR(300),
  github_url VARCHAR(300),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- STUDENT CERTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS student_certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  issuer VARCHAR(150),
  issue_date DATE,
  expiry_date DATE,
  credential_id VARCHAR(100),
  credential_url VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- RESUMES
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  file_name VARCHAR(300) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  cloudinary_public_id VARCHAR(300),
  file_size INT,
  is_primary TINYINT(1) DEFAULT 0,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  industry VARCHAR(100),
  website VARCHAR(300),
  logo_url VARCHAR(500),
  description TEXT,
  headquarters VARCHAR(200),
  company_size ENUM('startup', 'small', 'medium', 'large', 'enterprise'),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- RECRUITERS
-- ============================================================
CREATE TABLE IF NOT EXISTS recruiters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  company_id INT,
  designation VARCHAR(150),
  phone VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- ============================================================
-- PLACEMENT DRIVES (JOB POSTINGS)
-- ============================================================
CREATE TABLE IF NOT EXISTS placement_drives (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  title VARCHAR(300) NOT NULL,
  job_description TEXT,
  job_type ENUM('full_time', 'internship', 'part_time', 'contract') DEFAULT 'full_time',
  location VARCHAR(200),
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  salary_currency VARCHAR(10) DEFAULT 'INR',
  required_skills TEXT,
  min_cgpa DECIMAL(4,2) DEFAULT 0.00,
  max_backlogs INT DEFAULT 0,
  required_degree VARCHAR(100),
  required_departments TEXT,
  graduation_year_from YEAR,
  graduation_year_to YEAR,
  application_deadline DATE,
  drive_date DATE,
  status ENUM('upcoming', 'open', 'closed', 'cancelled') DEFAULT 'upcoming',
  openings INT DEFAULT 1,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- APPLICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  drive_id INT NOT NULL,
  student_id INT NOT NULL,
  resume_id INT,
  cover_letter TEXT,
  status ENUM('applied', 'shortlisted', 'rejected', 'selected', 'on_hold', 'offer_accepted', 'offer_declined') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  recruiter_notes TEXT,
  interview_date DATETIME,
  interview_mode ENUM('online', 'offline', 'hybrid'),
  interview_link VARCHAR(500),
  UNIQUE KEY unique_application (drive_id, student_id),
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

-- ============================================================
-- RESUME ANALYSIS HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS resume_analyses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  resume_id INT,
  drive_id INT,
  job_title VARCHAR(200),
  job_description_analyzed TEXT,
  match_score INT DEFAULT 0,
  matching_skills JSON,
  missing_skills JSON,
  recommendations JSON,
  analysis_result JSON,
  analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL,
  FOREIGN KEY (drive_id) REFERENCES placement_drives(id) ON DELETE SET NULL
);

-- ============================================================
-- ASSESSMENT CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category_type ENUM('aptitude', 'technical', 'programming', 'verbal', 'interview') DEFAULT 'aptitude',
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- QUESTIONS BANK
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(500),
  option_b VARCHAR(500),
  option_c VARCHAR(500),
  option_d VARCHAR(500),
  correct_answer ENUM('A', 'B', 'C', 'D'),
  explanation TEXT,
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  question_type ENUM('mcq', 'true_false', 'subjective') DEFAULT 'mcq',
  tags VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES assessment_categories(id) ON DELETE CASCADE
);

-- ============================================================
-- MOCK TESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS mock_tests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  duration_minutes INT DEFAULT 30,
  total_questions INT DEFAULT 20,
  passing_score INT DEFAULT 60,
  difficulty ENUM('easy', 'medium', 'hard', 'mixed') DEFAULT 'mixed',
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES assessment_categories(id) ON DELETE SET NULL
);

-- ============================================================
-- TEST ATTEMPTS
-- ============================================================
CREATE TABLE IF NOT EXISTS test_attempts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  test_id INT NOT NULL,
  score INT DEFAULT 0,
  total_marks INT DEFAULT 0,
  percentage DECIMAL(5,2) DEFAULT 0.00,
  time_taken_minutes INT,
  status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
  answers JSON,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (test_id) REFERENCES mock_tests(id) ON DELETE CASCADE
);

-- ============================================================
-- INTERVIEW QUESTION BANK
-- ============================================================
CREATE TABLE IF NOT EXISTS interview_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_text TEXT NOT NULL,
  sample_answer TEXT,
  tips TEXT,
  category ENUM('technical', 'hr', 'behavioral', 'situational', 'coding') DEFAULT 'hr',
  topic VARCHAR(100),
  difficulty ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  tags VARCHAR(300),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SAVED INTERVIEW QUESTIONS (per student)
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_interview_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  question_id INT NOT NULL,
  notes TEXT,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_saved (student_id, question_id),
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES interview_questions(id) ON DELETE CASCADE
);

-- ============================================================
-- MOCK INTERVIEW SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS mock_interview_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  session_type ENUM('technical', 'hr', 'mixed') DEFAULT 'mixed',
  questions_covered JSON,
  student_answers JSON,
  feedback JSON,
  overall_score INT,
  duration_minutes INT,
  session_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('info', 'success', 'warning', 'error', 'drive', 'application', 'interview', 'test') DEFAULT 'info',
  is_read TINYINT(1) DEFAULT 0,
  related_id INT,
  related_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- ADMIN PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  college_name VARCHAR(200),
  department VARCHAR(100),
  phone VARCHAR(15),
  designation VARCHAR(150),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_department ON student_profiles(department);
CREATE INDEX idx_student_profiles_graduation_year ON student_profiles(graduation_year);
CREATE INDEX idx_placement_drives_status ON placement_drives(status);
CREATE INDEX idx_placement_drives_company_id ON placement_drives(company_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_applications_drive_id ON applications(drive_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_questions_category_id ON questions(category_id);
CREATE INDEX idx_test_attempts_student_id ON test_attempts(student_id);
