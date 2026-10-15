const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const seed = async () => {
  console.log('🌱 Starting database seed...');

  // Assessment categories
  await pool.query(`INSERT IGNORE INTO assessment_categories (id, name, description, category_type, icon) VALUES
    (1, 'Quantitative Aptitude', 'Number systems, algebra, arithmetic', 'aptitude', '🔢'),
    (2, 'Logical Reasoning', 'Patterns, sequences, puzzles', 'aptitude', '🧠'),
    (3, 'Verbal Ability', 'Grammar, vocabulary, comprehension', 'verbal', '📚'),
    (4, 'Java Programming', 'Core Java concepts and OOP', 'technical', '☕'),
    (5, 'Python Programming', 'Python basics and data structures', 'technical', '🐍'),
    (6, 'SQL & Databases', 'Queries, joins, and database concepts', 'technical', '🗄️'),
    (7, 'Web Development', 'HTML, CSS, JavaScript basics', 'technical', '🌐'),
    (8, 'Data Structures', 'Arrays, linked lists, trees, graphs', 'technical', '🌲'),
    (9, 'HR Interview', 'Common HR questions preparation', 'interview', '👔')
  `);

  // Sample questions
  await pool.query(`INSERT IGNORE INTO questions (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty) VALUES
    (1, 'What is 15% of 200?', '25', '30', '35', '40', 'B', '15/100 × 200 = 30', 'easy'),
    (1, 'A train travels 360 km in 4 hours. What is its speed in m/s?', '20', '25', '22.5', '30', 'B', '360km/4h = 90 km/h = 90×1000/3600 = 25 m/s', 'medium'),
    (1, 'If 3x + 7 = 22, what is x?', '3', '4', '5', '6', 'C', '3x = 15, x = 5', 'easy'),
    (2, 'Find the next number: 2, 4, 8, 16, ?', '24', '32', '30', '28', 'B', 'Each number is doubled: 16×2=32', 'easy'),
    (2, 'All roses are flowers. Some flowers fade. Therefore:', 'All roses fade', 'Some roses fade', 'No roses fade', 'Some roses may or may not fade', 'D', 'Cannot conclude that roses fade', 'medium'),
    (4, 'Which of the following is not a primitive data type in Java?', 'int', 'String', 'boolean', 'char', 'B', 'String is a class, not a primitive type in Java', 'easy'),
    (4, 'What is the output of: System.out.println(10 / 3)?', '3.33', '3', '4', 'Error', 'B', 'Integer division in Java truncates the decimal', 'easy'),
    (4, 'Which keyword is used to inherit a class in Java?', 'implements', 'extends', 'inherits', 'super', 'B', 'extends keyword is used for class inheritance in Java', 'easy'),
    (5, 'What is the output of: print(type([]))?', 'list', "<class 'list'>", 'array', 'Error', 'B', 'type([]) returns <class list>', 'easy'),
    (6, 'Which SQL clause filters grouped results?', 'WHERE', 'HAVING', 'FILTER', 'GROUP BY', 'B', 'HAVING clause is used to filter results after GROUP BY', 'medium'),
    (6, 'What does SELECT DISTINCT do?', 'Selects all rows', 'Removes duplicate rows', 'Sorts results', 'Counts rows', 'B', 'DISTINCT removes duplicate rows from results', 'easy'),
    (7, 'Which HTML tag defines a hyperlink?', '<link>', '<href>', '<a>', '<url>', 'C', 'The <a> anchor tag is used to create hyperlinks', 'easy'),
    (8, 'What is the time complexity of binary search?', 'O(n)', 'O(n²)', 'O(log n)', 'O(1)', 'C', 'Binary search halves the search space each time: O(log n)', 'medium')
  `);

  // Sample mock tests
  await pool.query(`INSERT IGNORE INTO mock_tests (id, title, description, category_id, duration_minutes, total_questions, passing_score, difficulty) VALUES
    (1, 'Quantitative Aptitude Basics', 'Practice arithmetic and algebra questions', 1, 30, 10, 60, 'easy'),
    (2, 'Logical Reasoning Practice', 'Test your reasoning and analytical skills', 2, 25, 10, 60, 'medium'),
    (3, 'Core Java MCQ Test', 'Test your Java programming fundamentals', 4, 30, 10, 60, 'medium'),
    (4, 'SQL Fundamentals', 'Test your database and SQL knowledge', 6, 20, 10, 60, 'easy'),
    (5, 'Full Stack Aptitude Mix', 'Mixed aptitude + technical questions', null, 45, 13, 65, 'mixed')
  `);

  // Sample interview questions
  await pool.query(`INSERT IGNORE INTO interview_questions (category, question_text, sample_answer, tips, topic, difficulty) VALUES
    ('hr', 'Tell me about yourself.', 'I am a final year MCA student specializing in cloud computing. I have worked on projects involving React, Node.js, and MySQL. I am passionate about building scalable web applications.', 'Keep it professional, under 2 minutes, and relevant to the role.', 'Introduction', 'easy'),
    ('hr', 'What are your strengths and weaknesses?', 'My strength is problem-solving and quick learning. My weakness is that I tend to be a perfectionist, but I am learning to balance quality with deadlines.', 'Choose a real weakness but explain how you are improving.', 'Self-Assessment', 'easy'),
    ('hr', 'Where do you see yourself in 5 years?', 'I see myself as a senior software engineer working on challenging cloud-based systems, contributing to architectural decisions and mentoring junior developers.', 'Show ambition but align with the company growth.', 'Career Goals', 'medium'),
    ('technical', 'What is the difference between REST and GraphQL?', 'REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint and lets clients request exactly the data they need, reducing over-fetching.', 'Give a practical example to demonstrate understanding.', 'API Design', 'medium'),
    ('technical', 'Explain the concept of cloud computing.', 'Cloud computing delivers computing services (servers, storage, databases, networking, software) over the internet on a pay-as-you-go basis, enabling scalability and flexibility.', 'Mention SaaS, PaaS, IaaS examples.', 'Cloud Computing', 'easy'),
    ('technical', 'What is normalization in databases?', 'Normalization is the process of organizing a database to reduce redundancy and improve data integrity by dividing large tables into smaller ones with proper relationships.', 'Mention 1NF, 2NF, 3NF with simple examples.', 'Databases', 'medium'),
    ('behavioral', 'Describe a time you faced a challenge and how you overcame it.', 'During my project, our API integration broke a week before submission. I debugged the issue systematically, found a library conflict, and resolved it by updating dependencies.', 'Use the STAR method: Situation, Task, Action, Result.', 'Problem Solving', 'medium'),
    ('technical', 'What is the difference between == and === in JavaScript?', '== compares values with type coercion (e.g., "5" == 5 is true), while === compares both value and type without coercion (e.g., "5" === 5 is false).', 'Always prefer === for safer comparisons.', 'JavaScript', 'easy'),
    ('technical', 'Explain OOP principles.', 'OOP is based on 4 principles: Encapsulation (binding data and methods), Inheritance (deriving classes from base class), Polymorphism (one interface, multiple forms), and Abstraction (hiding implementation details).', 'Use code examples to illustrate each principle.', 'OOP', 'medium'),
    ('hr', 'Why do you want to join our company?', 'I am impressed by your company\\'s focus on innovation in cloud technologies. Your recent projects align with my skills in Node.js and React, and I believe I can contribute meaningfully.', 'Research the company before the interview.', 'Company Research', 'easy')
  `);

  // Sample companies
  const hashPass = await bcrypt.hash('admin123', 12);
  await pool.query(`INSERT IGNORE INTO users (id, name, email, password, role) VALUES
    (1, 'PlacePro Admin', 'admin@placepro.com', '${hashPass}', 'admin'),
    (2, 'TCS Recruiter', 'recruiter@tcs.com', '${hashPass}', 'recruiter'),
    (3, 'Test Student', 'student@test.com', '${hashPass}', 'student')
  `);

  await pool.query(`INSERT IGNORE INTO admin_profiles (user_id, college_name, designation) VALUES (1, 'PlacePro University', 'Placement Officer')`);
  await pool.query(`INSERT IGNORE INTO recruiters (user_id, designation) VALUES (2, 'HR Manager')`);
  await pool.query(`INSERT IGNORE INTO student_profiles (user_id, roll_number, college, department, degree, graduation_year, cgpa, backlogs) VALUES (3, 'MCA001', 'PlacePro University', 'MCA', 'MCA', 2025, 8.5, 0)`);

  await pool.query(`INSERT IGNORE INTO companies (id, name, industry, website, description, company_size) VALUES
    (1, 'Tata Consultancy Services', 'Information Technology', 'https://tcs.com', 'Leading IT services company', 'enterprise'),
    (2, 'Infosys', 'Information Technology', 'https://infosys.com', 'Global technology consulting company', 'enterprise'),
    (3, 'Wipro Technologies', 'Information Technology', 'https://wipro.com', 'Technology services and consulting', 'enterprise'),
    (4, 'Accenture', 'Consulting', 'https://accenture.com', 'Professional services company', 'enterprise'),
    (5, 'Amazon', 'E-Commerce & Cloud', 'https://amazon.com', 'Global technology and e-commerce leader', 'enterprise')
  `);

  await pool.query(`UPDATE recruiters SET company_id = 1 WHERE user_id = 2`);

  await pool.query(`INSERT IGNORE INTO placement_drives (id, company_id, title, job_description, job_type, location, salary_min, salary_max, required_skills, min_cgpa, max_backlogs, required_departments, graduation_year_from, graduation_year_to, application_deadline, status, openings, created_by) VALUES
    (1, 1, 'Software Engineer - TCS', 'Join TCS as a Software Engineer and work on enterprise projects. You will develop, test, and maintain software applications.', 'full_time', 'Multiple Locations', 350000, 700000, 'Java, SQL, Python, Problem Solving, Communication', 6.0, 2, 'MCA, B.Tech, BCA', 2024, 2026, DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'open', 200, 1),
    (2, 2, 'Systems Engineer - Infosys', 'Infosys is hiring Systems Engineers for its digital transformation projects. Work with cutting-edge technologies in agile teams.', 'full_time', 'Bangalore, Pune, Hyderabad', 380000, 650000, 'Java, Python, SQL, REST API, Agile, Git', 6.5, 1, 'MCA, B.Tech', 2024, 2026, DATE_ADD(CURDATE(), INTERVAL 20 DAY), 'open', 150, 1),
    (3, 5, 'Cloud Developer Intern - Amazon', 'Amazon Web Services internship for cloud enthusiasts. Work on real AWS infrastructure projects.', 'internship', 'Hyderabad, Bangalore', 50000, 80000, 'AWS, Python, Node.js, Docker, SQL', 7.0, 0, 'MCA, B.Tech', 2025, 2026, DATE_ADD(CURDATE(), INTERVAL 15 DAY), 'open', 50, 1)
  `);

  console.log('✅ Database seeded successfully!');
  console.log('📋 Test accounts:');
  console.log('  Admin: admin@placepro.com / admin123');
  console.log('  Recruiter: recruiter@tcs.com / admin123');
  console.log('  Student: student@test.com / admin123');
  process.exit(0);
};

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
