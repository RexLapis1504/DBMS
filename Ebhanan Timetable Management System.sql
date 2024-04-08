-- Create the database
CREATE DATABASE IF NOT EXISTS timetable_management_system;
USE timetable_management_system;

-- Create tables
CREATE TABLE IF NOT EXISTS Rooms (
    RoomID INT AUTO_INCREMENT PRIMARY KEY,
    RoomName VARCHAR(50) NOT NULL,
    Capacity INT NOT NULL,
    Availability BOOLEAN DEFAULT TRUE
);

INSERT INTO Rooms (RoomName, Capacity, Availability) VALUES
('C101', 50, TRUE),
('C102', 50, TRUE),
('C103', 50, TRUE),
('L201', 30, TRUE),
('L202', 30, TRUE),
('L203', 30, TRUE),
('C301', 60, TRUE),
('C302', 60, TRUE),
('C303', 60, TRUE);

select * from rooms;

UPDATE Rooms
SET Capacity = 100
WHERE RoomName = 'C101';

CREATE TABLE IF NOT EXISTS Teachers (
    TeacherID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Subject VARCHAR(100) NOT NULL,
    Availability BOOLEAN DEFAULT TRUE
);

INSERT INTO Teachers (Name, Subject, Availability) VALUES
('Divyang sir', 'BEEE', TRUE),
('Yogesh sir', 'CN', TRUE),
('Asha Maam', 'DBMS', TRUE),
('Tejaswini Maam', 'OOPJ', TRUE),
('Aparna Maam', 'EC', TRUE),
('Sandeep Sir', 'DSA', TRUE),
('Kasar sir', 'EGD', TRUE),
('Jyoti maam', 'PS', TRUE),
('Preeti Gupta maam', 'DAA', TRUE),
('Preeti godbole maam', 'MM', TRUE),
('Preeti Agarwal maam', 'WP', TRUE);

select * from teachers;

ALTER TABLE Teachers
RENAME COLUMN Availability TO Free; 

CREATE TABLE IF NOT EXISTS Subjects (
    SubjectID INT AUTO_INCREMENT PRIMARY KEY,
    SubjectName VARCHAR(100) NOT NULL
);

INSERT INTO Subjects (SubjectName) VALUES
('BEEE'),
('DLD'),
('CN'),
('PPS'),
('OOPJ'),
('EC'),
('EGD'),
('PS'),
('WP'),
('MM'),
('DAA'),
('DSA'),
('DBMS'),
('MAE'),
('EOB'),
('COA'),
('COI');

select* from subjects;

-- Subject not assigned to faculty
Select * FROM Subjects
WHERE SubjectName NOT IN (
    SELECT subject
    FROM teachers
);

CREATE TABLE IF NOT EXISTS Classes (
    ClassID INT AUTO_INCREMENT PRIMARY KEY,
    ClassName VARCHAR(100) NOT NULL,
    RoomID INT,
    TeacherID INT,
    SubjectID INT,
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    FOREIGN KEY (TeacherID) REFERENCES Teachers(TeacherID),
    FOREIGN KEY (SubjectID) REFERENCES Subjects(SubjectID)
);

INSERT INTO Classes (ClassName) VALUES
('MBA TECH'),
('BTECH CE'),
('BTECH AIDS'),
('BTECH CSBS');

select * from classes;

CREATE TABLE IF NOT EXISTS Students (
    StudentID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    ClassID INT,
    FOREIGN KEY (ClassID) REFERENCES Classes(ClassID)
);

INSERT INTO students (name, classID) 
VALUES 
('Aarav', 3),
('Aditi', 1),
('Amit', 2),
('Ananya', 4),
('Arjun', 3),
('Avni', 2),
('Deepak', 1),
('Divya', 4),
('Gaurav', 3),
('Ishaan', 2),
('Kavya', 1),
('Krishna', 4),
('Manisha', 3),
('Maya', 2),
('Mohit', 1),
('Neha', 4),
('Pranav', 3),
('Priya', 2),
('Rahul', 1),
('Riya', 4),
('Rohit', 3),
('Sakshi', 2),
('Sanjay', 1),
('Shreya', 4),
('Siddharth', 3),
('Sneha', 2),
('Tanvi', 1),
('Vikram', 4),
('Zoya', 3);

insert INTO students (name, classID) VALUES ("Shubhan",2);

select * from students;
SELECT * FROM students
ORDER BY name ASC;

UPDATE students
SET studentID = 30
WHERE studentID = 32;

-- MBA Tech
select * from classes;
SELECT * FROM students WHERE classID = 1;

SELECT COUNT(*) AS student_count
FROM students 
WHERE classID = 1;

-- Btech ce
select * from classes;
SELECT * FROM students WHERE classID = 2;

SELECT COUNT(*) AS student_count
FROM students 
WHERE classID = 2;
 
 -- AIDS
 select * from classes;
SELECT * FROM students WHERE classID = 3;

SELECT COUNT(*) AS student_count
FROM students 
WHERE classID = 3;

-- CSBS
SELECT * FROM students WHERE classID = 4;

SELECT COUNT(*) AS student_count
FROM students 
WHERE classID = 4;
 
 
-- MBA Tech (ClassID = 1), assign Divyang sir (TeacherID = 1) to room C101 (RoomID = 1) for Subject BEEE (SubjectID = 1)
UPDATE Classes
SET TeacherID = 1, RoomID = 1, SubjectID = 1
WHERE ClassID = 1;

-- Btech CSBS (ClassID = 4), assign Asha Maam (TeacherID = 3) to room C102 (RoomID = 2) for Subject WP (SubjectID = 9)
UPDATE Classes
SET TeacherID = 3, RoomID = 2, SubjectID = 9
WHERE ClassID = 4;

-- Btech CE (ClassID = 2), assign Kasar sir (TeacherID = 7) to room C301 (RoomID = 7) for Subject EGD (SubjectID = 7)
UPDATE Classes
SET TeacherID = 7, RoomID = 7, SubjectID = 7
WHERE ClassID = 2;

-- Btech AIDS (ClassID = 3), assign Yogesh sir (TeacherID = 2) to room C202 (RoomID = 6) for Subject CN (SubjectID = 3)
UPDATE Classes
SET TeacherID = 2, RoomID = 6, SubjectID = 3
WHERE ClassID = 3;


select * from classes;

SELECT ClassName, Name AS Teacher, RoomName
FROM Classes
JOIN Teachers ON Classes.TeacherID = Teachers.TeacherID
JOIN Rooms ON Classes.RoomID = Rooms.RoomID;

UPDATE Teachers
SET Free = FALSE
WHERE TeacherID = 1 ;

UPDATE Teachers
SET Free = false
WHERE TeacherID = 2 ;

UPDATE Teachers
SET Free = FALSE
WHERE TeacherID = 7 ;

UPDATE Teachers
SET Free = false
WHERE TeacherID = 3 ;

select * from teachers;


-- Show all tables in the current database
SHOW TABLES;
select * from classes;
select * from rooms;
select * from students;
select * from subjects;
select * from teachers;

-- Show the structure of a specific table
DESCRIBE classes;
DESCRIBE rooms;
DESCRIBE student;
DESCRIBE subjects;
DESCRIBE teachers;

-- delete database
drop database timetable_management_system;