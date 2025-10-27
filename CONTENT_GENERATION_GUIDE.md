# Content Generation Guide

## Overview
The platform now includes AI-powered question generation based on Common Core standards.

## Features

### 1. Standards-Based Question Generator
Located in: Parent Dashboard → Content Tab

**Features:**
- Select subject (Mathematics, English Language Arts, Science, Social Studies)
- Choose grade level (K-8)
- Pick a specific Common Core standard
- Generate 1-50 questions aligned to that standard
- Questions are automatically saved to the database

**How to Use:**
1. Navigate to Parent Dashboard
2. Click on the "Content" tab
3. Select your subject and grade level
4. Choose a standard from the dropdown
5. Set the number of questions to generate
6. Click "Generate Questions"

### 2. Question Bank Manager
View and manage all generated questions

**Features:**
- View total question count
- See breakdown by subject
- Browse all questions with filters
- Delete individual questions
- Add sample questions for testing

**Quick Start:**
1. Click "Add Samples" to populate with test questions
2. Use these to test the diagnostic system
3. Generate more questions as needed

## Database Tables

### diagnostic_test_questions
Stores all generated questions:
- subject
- grade_level
- standard_id (links to common_core_standards)
- question_text
- question_type (multiple_choice, short_answer, true_false)
- options (array)
- correct_answer
- difficulty_level (1-3)
- skill_category

### common_core_standards
Contains all Common Core standards:
- code (e.g., "CCSS.MATH.3.OA.A.1")
- subject
- grade_level
- description
- domain

## Integration with Diagnostic Tests

The diagnostic test system automatically pulls questions from the question bank:
- Questions are filtered by subject and grade level
- Difficulty adapts based on student performance
- Results are tracked in student_standards_mastery table

## Next Steps

1. **Populate Standards**: Ensure common_core_standards table has data
2. **Generate Questions**: Use the generator to create questions for each standard
3. **Test Diagnostic**: Have students take diagnostic tests
4. **Review Results**: Monitor performance in Standards tab

## AI Enhancement (Future)

Currently generates basic questions. To enhance with real AI:
1. Set up OpenAI API key in environment variables
2. Modify generateAIQuestions() function in StandardsBasedQuestionGenerator.tsx
3. Use GPT-4 to generate contextual, high-quality questions

Example prompt:
```
Generate a ${difficulty} difficulty ${type} question for grade ${grade} ${subject} 
aligned to standard: ${standard.code} - ${standard.description}
```
