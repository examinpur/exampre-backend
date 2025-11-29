# Exam Platform Backend

Backend API for an exam preparation platform targeting:
- Class 11–12 students
- Students preparing for competitive exams (IIT-JEE, NEET, WBJEE, etc.)

The system supports 3 user roles:
- **Admin**
- **Teacher**
- **Student**

Core concept:  
**Admin/Teacher** create and manage a **Question Bank**, then create **Exams / Tests / DPPs** by importing questions from that bank. Access to each exam can be **free or paid per role** (e.g. paid for teachers, free for students).

---

## 1. Features

### User & Roles
- Role-based users: `ADMIN`, `TEACHER`, `STUDENT`
- JWT-based authentication
- Fine-grained authorization on:
  - Question bank access
  - Exam/Test/DPP creation and editing
  - Paid / Free content access by role

### Academic Structure (Master Data)
To avoid duplicates and inconsistent naming, the following entities are pre-defined and referenced by `ObjectId`:
- **Class** (e.g. 11, 12, droppers, etc.)
- **Subject** (e.g. Physics, Chemistry, Maths, Biology)
- **Chapter**
- **Topic**

Questions reference these entities by ID to enable clean filtering and reporting.

### Question Bank
Each question can have:

- **Metadata**
  - `type` – `MCQ`, `TRUE_FALSE`, `INTEGER`, `FILL_IN_THE_BLANK`, `COMPREHENSION`
  - `mcqMode` – `SINGLE_CORRECT`, `MULTI_CORRECT` (for MCQs)
  - `classId` – reference to Class
  - `subjectId` – reference to Subject
  - `chapterId` – reference to Chapter
  - `topicId` – reference to Topic
  - `difficultyLevel` – e.g. `EASY`, `MEDIUM`, `HARD`
  - `marks`
  - `negativeMarks`
  - `resource` – e.g. `NCERT`, `JEE Main 2023`, `NEET 2022`
  - `year` – year and exam info if it’s a previous-year question
  - `createdBy` – `ObjectId` of Admin or Teacher
  - `numberOfQuestionImport` – auto-incremented every time this question is imported into any exam/test/DPP

- **Content**
  - `questionText`
  - `questionMediaUrl` (optional – images, LaTeX render, etc.)
  - For **MCQ**:
    - `options` – array of:
      - `text`
      - `mediaUrl` (optional)
      - `isCorrect` (for single/multiple correct)
  - For **True/False**:
    - `correctAnswer` – `true` or `false`
  - For **Integer / Fill in the blank**:
    - `correctAnswer` – numeric or text
  - For **Comprehension**:
    - Parent question has a passage (`passageText` + `passageMediaUrl`)
    - Child questions (same structure as above) linked to the parent

- **Solution**
  - `solutionText`
  - `solutionMediaUrl`
  - Optional `solutionSteps` or `hints`

### Exams / Tests / DPPs (Assessments)

A generic **Assessment** model can represent:
- Exam
- Test
- DPP
- (Future types like Assignments / Mock Tests / Batch Tests)

Each Assessment:

- **Basic Info**
  - `title`
  - `code` (optional unique identifier)
  - `type` – `EXAM`, `TEST`, `DPP`
  - `branch` – e.g. `ENGINEERING`, `MEDICAL`, `DEFENCE`, `TEACHING`, `OTHER`
  - `classId`, `subjectIds` (optional – even multi-subject test)
  - `createdBy` – Admin or Teacher
  - `durationInMinutes`
  - `totalMarks` (derived or manually set)
  - `status` – `DRAFT`, `PUBLISHED`, `ARCHIVED`

- **Sections**
  - Each section has:
    - `name` (e.g. Physics, Chemistry, Maths, Section A)
    - `description`
    - `order`
    - `questionIds` (array of Question `ObjectId`)
    - `sectionMarks` (optional – sum of questions or fixed)

- **Access & Pricing**
  - Different access rule per role:
    - `accessRules`: array of:
      - `role` – `TEACHER` or `STUDENT`
      - `isPaid` – true/false
      - `price` – optional (if paid)
  - Example:
    - Paid for TEACHER, Free for STUDENT

- **Visibility**
  - `availableFrom` (start date/time)
  - `availableTo` (end date/time)
  - `isPublic` – can all students see it, or just assigned ones?

### Library Logic
- **Admin**:
  - Can import from **their own** question bank into any Assessment they create
- **Teacher**:
  - Can import from:
    - Their **own** question bank
    - **Admin’s** question bank if they have permission

### Analytics (Optional, extendable)
- Number of times each question is imported
- Number of attempts per assessment
- Student scores per assessment, per section

---

## 2. Tech Stack

- **Runtime:** Node.js (>= 18)
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Auth:** JWT + bcrypt
- **Validation:** Joi / Zod / express-validator (your choice)
- **Other:**
  - dotenv for environment variables
  - helmet, cors for security
  - winston / pino for logging

---

## 3. Project Structure (Suggested)

```bash
backend/
  src/
    config/
      db.ts
      env.ts
    models/
      User.ts
      Class.ts
      Subject.ts
      Chapter.ts
      Topic.ts
      Question.ts
      Assessment.ts
      Section.ts
      Attempt.ts
    middleware/
      auth.ts
      errorHandler.ts
      roleGuard.ts
    routes/
      auth.routes.ts
      admin.routes.ts
      teacher.routes.ts
      student.routes.ts
      question.routes.ts
      assessment.routes.ts
      masterData.routes.ts
    controllers/
      auth.controller.ts
      question.controller.ts
      assessment.controller.ts
      masterData.controller.ts
    services/
      auth.service.ts
      question.service.ts
      assessment.service.ts
    utils/
      logger.ts
      response.ts
    app.ts
    server.ts
  tests/
  package.json
  tsconfig.json (if using TS)
  .env.example






---

## 🎨 `README.frontend.md`

```md
# Exam Platform Frontend

Frontend application (web) for the Exam Platform.

Target users:
- **Admin** – Manage question bank, master data, and all exams/tests/DPPs
- **Teacher** – Manage own question bank and create tests/exams/DPPs using:
  - Own library
  - Admin’s library (if allowed)
- **Student** – Access free/paid exams, attempt tests, and view results

---

## 1. Features

### Common
- Login & logout
- Role-based dashboards (view changes depending on role)
- Mobile-friendly UI (recommended)

### Admin Features
- Manage **Classes**, **Subjects**, **Chapters**, **Topics**
- Manage **Question Bank**
  - Create/edit/delete questions
  - Control question type (MCQ, True/False, Integer, Fill in the blank, Comprehension)
  - Add text + optional media URLs (for both questions and options)
  - Set metadata (class, subject, chapter, topic, difficulty, marks, negative marks, resource, year)
- Manage **Assessments (Exam / Test / DPP)**:
  - Define title, type, branch (Engineering, Medical, Defence, Teaching, Others)
  - Add sections
  - Import questions from admin question bank into sections
  - Set duration, total marks, availability period
  - Configure access rules (free/paid per role: teacher/student)
  - Publish/unpublish

### Teacher Features
- Personal dashboard
- Teacher’s **Question Bank**:
  - Same question creation flow as Admin, but isolated library
- Create **Assessments**:
  - Use:
    - Own questions
    - Admin’s questions (if permission granted)
  - Structure sections and import questions into each section
  - Configure duration/marks and access rules
- View list of created assessments

### Student Features
- Student dashboard
  - List of available exams/tests/DPPs
  - Distinguish free vs paid
- View assessment details:
  - Branch, type, duration, number of questions, sections
- Attempt assessment:
  - Timer
  - Section-wise navigation
  - Question viewer (text + optional media)
  - Choose MCQ options (single/multiple)
  - Answer integer/fill-in-the-blank
  - True/False selection
  - Comprehension questions with shared passage
- Submit assessment & view results (if backend supports scoring)

---

## 2. Tech Stack

- **Framework:** React (with Vite or CRA)
- **Language:** TypeScript (recommended)
- **State Management:** React Query / RTK Query or Redux Toolkit
- **Routing:** React Router
- **UI Library:** Tailwind CSS / Material UI / Ant Design (any one)
- **HTTP Client:** Axios or fetch wrapper
- **Auth:** JWT stored in HttpOnly cookie or localStorage (depending on backend)

---

## 3. Project Structure (Suggested)

```bash
frontend/
  src/
    api/
      axiosClient.ts
      authApi.ts
      questionsApi.ts
      assessmentsApi.ts
      masterDataApi.ts
    components/
      layout/
        Navbar.tsx
        Sidebar.tsx
      common/
        Button.tsx
        Loader.tsx
        ProtectedRoute.tsx
      forms/
        QuestionForm.tsx
        AssessmentForm.tsx
        SectionForm.tsx
    features/
      auth/
        LoginPage.tsx
        useAuth.ts
      dashboard/
        AdminDashboard.tsx
        TeacherDashboard.tsx
        StudentDashboard.tsx
      masterData/
        ClassesPage.tsx
        SubjectsPage.tsx
        ChaptersPage.tsx
        TopicsPage.tsx
      questions/
        QuestionListPage.tsx
        QuestionCreatePage.tsx
        QuestionEditPage.tsx
      assessments/
        AssessmentListPage.tsx
        AssessmentCreatePage.tsx
        AssessmentEditPage.tsx
        AssessmentDetailsPage.tsx
        AttemptPage.tsx
        ResultPage.tsx
    hooks/
      useAuthGuard.ts
    routes/
      AppRoutes.tsx
    types/
      index.ts       # Type definitions shared with backend models
    utils/
      formatters.ts
      constants.ts
    App.tsx
    main.tsx
  public/
  vite.config.ts
  package.json
