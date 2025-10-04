# Transparent Medicine Verification Platform

A web-based platform to **verify licensed pharmaceutical medicines** in India. Companies can register, upload medicines, and administrators can approve or reject licenses. The public can search for medicines and verify authenticity.  

---

## Features

- Admin dashboard for managing companies and medicines  
- Company dashboard to add/edit/delete medicines  
- Public search page for medicine verification  
- Responsive and interactive UI  
- Secure login and session management  

---

## Technologies Used

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** PHP  
- **Database:** MariaDB (MySQL-compatible)  
- **Server:** XAMPP (Apache + MariaDB)  
- **Libraries/Fonts:** Google Fonts (Inter), Vanilla JS  

---

project-root/
│
├─ api/ # Backend PHP APIs
│ ├─ auth.php
│ ├─ admin.php
│ └─ company.php
│
├─ assets/
│ ├─ css/
│ │ └─ style.css
│ └─ js/
│ ├─ admin.js
│ ├─ auth.js
│ ├─ company.js
│ └─ public.js
│
├─ index.html # Public landing/search page
├─ login.html # Login page
├─ register.html # Company registration
├─ admin_dashboard.html # Admin dashboard
├─ company_dashboard.html # Company dashboard
└─ README.md



---

## Database Setup

1. Open **phpMyAdmin** or use terminal MySQL.  
2. Create a new database:  

```sql
CREATE DATABASE medicine_verification;
USE medicine_verification;
-- Admins table
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO admins (username, password) VALUES 
('superadmin', '$2y$10$O/9ozN9uReOiPixCf1Xeze6mfNlT.QI1oj6mNnpGhYUJWTcEQLw8e');

-- Companies table
CREATE TABLE companies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  license_number VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status ENUM('pending','approved','banned') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medicines table
CREATE TABLE medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_id INT NOT NULL,
  medicine_name VARCHAR(255) NOT NULL,
  ingredients TEXT NOT NULL,
  use_case TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

How to Run (Windows)

Install XAMPP: https://www.apachefriends.org/download.html

Place the project folder inside C:\xampp\htdocs\

Start Apache and MySQL from the XAMPP Control Panel

Open browser → http://localhost/project-folder-name/index.html

Admin login:

Username: superadmin

Password: SecurePass!2024

Company registration and login is available via Register and Login pages


How to Run (Linux)

Install XAMPP for Linux: https://www.apachefriends.org/download.html

For .run installer:

chmod +x xampp-linux-x64-8.2.4-0-installer.run
sudo ./xampp-linux-x64-8.2.4-0-installer.run


Place the project folder inside /opt/lampp/htdocs/

Start XAMPP:

sudo /opt/lampp/lampp start


Open browser → http://localhost/project-folder-name/index.html

Admin login:

Username: superadmin

Password: SecurePass!2024

Using the Platform
Admin

View dashboard stats (total companies, pending approvals, banned licenses, total medicines)

Approve or ban company registrations

View and delete medicines uploaded by companies

Company

Register company account (pending admin approval)

Login and upload medicines

Edit or delete your medicines

Browse all approved medicines

Public

Search medicines by name, company, or use case

Verify licensed medicines


License

MIT License (Free to use and modify)

## Project Structure

