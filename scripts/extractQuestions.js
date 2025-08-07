#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample questions for PL-600 exam based on exam objectives
// These cover the three main areas: Solution Envisioning (38%), Architecture (39%), Implementation (23%)

const sampleQuestions = [
  // Solution Envisioning Questions (38%)
  {
    question_number: "PL600-001",
    question_text: "You are designing a Power Platform solution for a multinational corporation. The solution needs to support users in 15 countries with different languages and currencies. What should you recommend to ensure proper localization?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Create separate apps for each country", isCorrect: false },
      { id: "b", text: "Use Power Platform's built-in localization features and configure multiple languages", isCorrect: true },
      { id: "c", text: "Build a single app in English only", isCorrect: false },
      { id: "d", text: "Use external translation services", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "Power Platform provides built-in localization features that support multiple languages and currencies, making it the most efficient solution.",
      incorrect: {
        "a": "Creating separate apps would be inefficient and difficult to maintain.",
        "c": "A single English app wouldn't meet the multilingual requirements.",
        "d": "External services add unnecessary complexity when built-in features are available."
      }
    },
    exam_area: "envisioning",
    difficulty: 3,
    tags: ["localization", "global-deployment", "solution-design"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-platform/admin/enable-languages",
    estimated_time: 90
  },
  {
    question_number: "PL600-002",
    question_text: "A client wants to migrate their legacy on-premises CRM system to Power Platform. What is the FIRST step you should take in the migration process?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Start building the new Power Apps immediately", isCorrect: false },
      { id: "b", text: "Perform a comprehensive assessment of the current system and data", isCorrect: true },
      { id: "c", text: "Delete all legacy data to start fresh", isCorrect: false },
      { id: "d", text: "Purchase additional Power Platform licenses", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "A comprehensive assessment is crucial to understand data structures, business processes, and requirements before migration.",
      incorrect: {
        "a": "Building without assessment leads to incomplete or incorrect solutions.",
        "c": "Legacy data is valuable and should be migrated appropriately.",
        "d": "License planning comes after understanding the requirements."
      }
    },
    exam_area: "envisioning",
    difficulty: 2,
    tags: ["migration", "assessment", "planning"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-platform/guidance/adoption/assess-readiness",
    estimated_time: 60
  },
  
  // Architecture Questions (39%)
  {
    question_number: "PL600-003",
    question_text: "You need to implement row-level security in a Power Platform solution. Users should only see records from their own department. Which approach should you use?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Create separate tables for each department", isCorrect: false },
      { id: "b", text: "Use Dataverse security roles and business units", isCorrect: true },
      { id: "c", text: "Implement security in the Power Apps formula", isCorrect: false },
      { id: "d", text: "Use SharePoint permissions", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "Dataverse security roles and business units provide robust row-level security that's maintained at the platform level.",
      incorrect: {
        "a": "Separate tables create maintenance overhead and data silos.",
        "c": "App-level security can be bypassed and isn't comprehensive.",
        "d": "SharePoint permissions don't apply to Dataverse data."
      }
    },
    exam_area: "architecture",
    difficulty: 3,
    tags: ["security", "dataverse", "row-level-security"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges",
    estimated_time: 75
  },
  {
    question_number: "PL600-004",
    question_text: "Your solution requires real-time integration with an external REST API that has rate limiting of 100 calls per minute. What pattern should you implement?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Direct API calls from Power Automate with no throttling", isCorrect: false },
      { id: "b", text: "Implement a queue pattern with Azure Service Bus and throttling", isCorrect: true },
      { id: "c", text: "Make all API calls from the Power Apps client", isCorrect: false },
      { id: "d", text: "Cache all data locally and never call the API", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "A queue pattern with Service Bus allows you to manage rate limits effectively while ensuring reliable message delivery.",
      incorrect: {
        "a": "No throttling would exceed rate limits and cause failures.",
        "c": "Client-side calls are insecure and can't manage rate limits effectively.",
        "d": "Never calling the API means no real-time integration."
      }
    },
    exam_area: "architecture",
    difficulty: 4,
    tags: ["integration", "api", "rate-limiting", "azure"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling",
    estimated_time: 120
  },
  
  // Implementation Questions (23%)
  {
    question_number: "PL600-005",
    question_text: "You're implementing ALM for a Power Platform solution. Which tool should you use for automated deployments between environments?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Manual export/import of solutions", isCorrect: false },
      { id: "b", text: "Power Platform Build Tools in Azure DevOps", isCorrect: true },
      { id: "c", text: "Copy and paste components between environments", isCorrect: false },
      { id: "d", text: "FTP file transfer", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "Power Platform Build Tools in Azure DevOps provide automated, repeatable deployments with proper ALM practices.",
      incorrect: {
        "a": "Manual processes are error-prone and not scalable.",
        "c": "Copy-paste doesn't maintain dependencies and configurations.",
        "d": "FTP is not applicable for Power Platform deployments."
      }
    },
    exam_area: "implementation",
    difficulty: 3,
    tags: ["alm", "devops", "deployment", "automation"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-platform/alm/devops-build-tools",
    estimated_time: 90
  },
  {
    question_number: "PL600-006",
    question_text: "A Power Automate flow is failing intermittently with timeout errors. What is the BEST approach to handle this?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Increase the timeout to maximum and hope it works", isCorrect: false },
      { id: "b", text: "Implement retry policies with exponential backoff", isCorrect: true },
      { id: "c", text: "Remove the problematic action", isCorrect: false },
      { id: "d", text: "Run the flow more frequently", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "Retry policies with exponential backoff handle transient failures gracefully while avoiding overwhelming the system.",
      incorrect: {
        "a": "Simply increasing timeout doesn't address the root cause.",
        "c": "Removing functionality isn't a solution.",
        "d": "Running more frequently could worsen the problem."
      }
    },
    exam_area: "implementation",
    difficulty: 3,
    tags: ["power-automate", "error-handling", "retry-policy"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-automate/retry-policy",
    estimated_time: 60
  },
  
  // Additional comprehensive questions
  {
    question_number: "PL600-007",
    question_text: "You need to store 50GB of documents that must be accessible from a Power Apps canvas app. What storage solution should you recommend?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Store all documents in Dataverse", isCorrect: false },
      { id: "b", text: "Use SharePoint document libraries with Power Apps connector", isCorrect: true },
      { id: "c", text: "Embed documents directly in the app", isCorrect: false },
      { id: "d", text: "Use local device storage", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "SharePoint is designed for document storage and integrates well with Power Apps while being cost-effective for large volumes.",
      incorrect: {
        "a": "Dataverse storage for 50GB would be expensive and not optimized for documents.",
        "c": "Embedding 50GB in an app is impossible and impractical.",
        "d": "Local storage doesn't provide centralized access."
      }
    },
    exam_area: "architecture",
    difficulty: 2,
    tags: ["storage", "sharepoint", "documents", "canvas-apps"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/connections/connection-sharepoint-online",
    estimated_time: 60
  },
  {
    question_number: "PL600-008",
    question_text: "A solution requires processing 100,000 records daily with complex calculations. What approach provides the best performance?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Process all records in a single Power Automate flow", isCorrect: false },
      { id: "b", text: "Use Dataverse plugins for server-side processing", isCorrect: false },
      { id: "c", text: "Implement batch processing with Azure Functions and Dataverse Web API", isCorrect: true },
      { id: "d", text: "Process records one by one in Power Apps", isCorrect: false }
    ],
    correct_answer: "c",
    explanation: {
      correct: "Azure Functions with batch processing provides scalability and performance for high-volume operations.",
      incorrect: {
        "a": "Single flow would timeout and has limits on processing time.",
        "b": "Plugins have execution time limits and aren't ideal for batch processing.",
        "d": "Processing in Power Apps would be extremely slow and impractical."
      }
    },
    exam_area: "architecture",
    difficulty: 4,
    tags: ["performance", "batch-processing", "azure-functions", "scalability"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview",
    estimated_time: 120
  },
  {
    question_number: "PL600-009",
    question_text: "You need to ensure GDPR compliance for a Power Platform solution handling EU citizen data. What must you implement?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Only store data in EU data centers", isCorrect: false },
      { id: "b", text: "Implement data retention policies, audit logging, and data subject rights", isCorrect: true },
      { id: "c", text: "Encrypt all data with custom encryption", isCorrect: false },
      { id: "d", text: "Avoid storing any personal data", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "GDPR requires comprehensive data governance including retention, auditing, and supporting data subject rights (access, deletion, portability).",
      incorrect: {
        "a": "Data location is just one aspect; GDPR requires much more.",
        "c": "Platform encryption is sufficient; custom encryption isn't required.",
        "d": "Avoiding personal data isn't practical for most business solutions."
      }
    },
    exam_area: "envisioning",
    difficulty: 4,
    tags: ["gdpr", "compliance", "data-governance", "privacy"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-platform/admin/gdpr-compliance",
    estimated_time: 90
  },
  {
    question_number: "PL600-010",
    question_text: "A Power Apps portal needs to support 10,000 concurrent users. What architecture pattern should you implement?",
    question_type: "multiple-choice",
    options: [
      { id: "a", text: "Single portal instance with default settings", isCorrect: false },
      { id: "b", text: "Multiple portal instances with Azure Front Door for load balancing", isCorrect: true },
      { id: "c", text: "Canvas app instead of portal", isCorrect: false },
      { id: "d", text: "On-premises web server", isCorrect: false }
    ],
    correct_answer: "b",
    explanation: {
      correct: "Multiple portal instances with Azure Front Door provides scalability, load balancing, and high availability for large user bases.",
      incorrect: {
        "a": "Single instance can't handle 10,000 concurrent users effectively.",
        "c": "Canvas apps aren't designed for external users at this scale.",
        "d": "On-premises doesn't provide the scalability needed."
      }
    },
    exam_area: "architecture",
    difficulty: 5,
    tags: ["portals", "scalability", "high-availability", "azure-front-door"],
    microsoft_learn_url: "https://learn.microsoft.com/en-us/power-apps/maker/portals/architecture",
    estimated_time: 120
  }
];

// Function to save questions to JSON file
function saveQuestionsToFile() {
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'questions.json');
  const outputDir = path.dirname(outputPath);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Prepare the data structure
  const questionData = {
    version: "1.0.0",
    lastUpdated: new Date().toISOString(),
    totalQuestions: sampleQuestions.length,
    examInfo: {
      code: "PL-600",
      name: "Microsoft Power Platform Solution Architect",
      duration: 150, // minutes
      passingScore: 700,
      totalPoints: 1000,
      questionCount: 119, // typical exam size
      areas: [
        { name: "Solution Envisioning and Requirement Analysis", weight: 38 },
        { name: "Solution Architecture", weight: 39 },
        { name: "Solution Implementation", weight: 23 }
      ]
    },
    questions: sampleQuestions
  };
  
  // Write to file
  fs.writeFileSync(outputPath, JSON.stringify(questionData, null, 2));
  
  console.log(`✅ Successfully extracted ${sampleQuestions.length} questions`);
  console.log(`📁 Questions saved to: ${outputPath}`);
  
  // Generate statistics
  const stats = {
    total: sampleQuestions.length,
    byArea: {
      envisioning: sampleQuestions.filter(q => q.exam_area === 'envisioning').length,
      architecture: sampleQuestions.filter(q => q.exam_area === 'architecture').length,
      implementation: sampleQuestions.filter(q => q.exam_area === 'implementation').length
    },
    byDifficulty: {
      1: sampleQuestions.filter(q => q.difficulty === 1).length,
      2: sampleQuestions.filter(q => q.difficulty === 2).length,
      3: sampleQuestions.filter(q => q.difficulty === 3).length,
      4: sampleQuestions.filter(q => q.difficulty === 4).length,
      5: sampleQuestions.filter(q => q.difficulty === 5).length
    }
  };
  
  console.log('\n📊 Question Statistics:');
  console.log('By Exam Area:');
  console.log(`  - Solution Envisioning: ${stats.byArea.envisioning} questions`);
  console.log(`  - Solution Architecture: ${stats.byArea.architecture} questions`);
  console.log(`  - Solution Implementation: ${stats.byArea.implementation} questions`);
  console.log('By Difficulty:');
  Object.entries(stats.byDifficulty).forEach(([level, count]) => {
    if (count > 0) {
      console.log(`  - Level ${level}: ${count} questions`);
    }
  });
  
  return questionData;
}

// Function to upload questions to Supabase (if needed)
async function uploadToSupabase(questions) {
  // This would connect to Supabase and upload questions
  // For now, we'll just prepare the SQL statements
  
  const sqlPath = path.join(__dirname, '..', 'supabase', 'seed', 'questions.sql');
  const sqlDir = path.dirname(sqlPath);
  
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir, { recursive: true });
  }
  
  let sql = '-- Insert sample questions into the database\n';
  sql += '-- Generated: ' + new Date().toISOString() + '\n\n';
  
  questions.forEach(q => {
    sql += `INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  '${q.question_number}',
  '${q.question_text.replace(/'/g, "''")}',
  '${q.question_type}',
  '${JSON.stringify(q.options).replace(/'/g, "''")}',
  '${JSON.stringify(q.correct_answer).replace(/'/g, "''")}',
  '${JSON.stringify(q.explanation).replace(/'/g, "''")}',
  '${q.exam_area}',
  ${q.difficulty},
  ARRAY[${q.tags.map(t => `'${t}'`).join(', ')}],
  ${q.microsoft_learn_url ? `'${q.microsoft_learn_url}'` : 'NULL'},
  ${q.estimated_time}
) ON CONFLICT (question_number) DO NOTHING;\n\n`;
  });
  
  fs.writeFileSync(sqlPath, sql);
  console.log(`\n📝 SQL insert statements saved to: ${sqlPath}`);
  console.log('You can run this SQL in your Supabase SQL editor to populate the database.');
}

// Main execution
console.log('🚀 Starting question extraction process...\n');

try {
  const questionData = saveQuestionsToFile();
  uploadToSupabase(questionData.questions);
  
  console.log('\n✨ Question extraction completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Questions are saved in src/data/questions.json');
  console.log('2. Run the SQL file in Supabase to populate the database');
  console.log('3. The app can now load and display questions');
} catch (error) {
  console.error('❌ Error extracting questions:', error);
  process.exit(1);
}

export default sampleQuestions;