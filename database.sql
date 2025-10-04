--
-- Database: `medicine_verification`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Remove old admin credentials
DELETE FROM `admins`;

-- Add new admin credentials
-- Username: superadmin
-- Password: SecurePass!2024
INSERT INTO `admins` (`username`, `password`) VALUES (
  'superadmin',
  '$2y$10$O/9ozN9uReOiPixCf1Xeze6mfNlT.QI1oj6mNnpGhYUJWTcEQLw8e'
);

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(255) NOT NULL,
  `license_number` VARCHAR(255) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'approved', 'banned') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

UPDATE companies SET status='approved' WHERE email='user_email';

-- --------------------------------------------------------

--
-- Table structure for table `medicines`
--

CREATE TABLE `medicines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `medicine_name` VARCHAR(255) NOT NULL,
  `ingredients` TEXT NOT NULL,
  `use_case` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE
);
