import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map of topics to Microsoft Learn URLs
const topicUrls = {
  // Architecture & Design
  'integration': 'https://learn.microsoft.com/en-us/power-platform/guidance/architecture/integration-overview',
  'security': 'https://learn.microsoft.com/en-us/power-platform/admin/security/',
  'performance': 'https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/performance-tips',
  'governance': 'https://learn.microsoft.com/en-us/power-platform/guidance/adoption/governance-overview',
  'alm': 'https://learn.microsoft.com/en-us/power-platform/alm/',
  'devops': 'https://learn.microsoft.com/en-us/power-platform/alm/devops-build-tools',
  
  // Power Platform Components
  'dataverse': 'https://learn.microsoft.com/en-us/power-apps/maker/data-platform/',
  'power apps': 'https://learn.microsoft.com/en-us/power-apps/',
  'power automate': 'https://learn.microsoft.com/en-us/power-automate/',
  'power bi': 'https://learn.microsoft.com/en-us/power-bi/',
  'power pages': 'https://learn.microsoft.com/en-us/power-pages/',
  
  // Solution Areas
  'authentication': 'https://learn.microsoft.com/en-us/power-platform/admin/security/authenticate-services',
  'authorization': 'https://learn.microsoft.com/en-us/power-platform/admin/security/authorization',
  'dlp': 'https://learn.microsoft.com/en-us/power-platform/admin/dlp-policies',
  'connectors': 'https://learn.microsoft.com/en-us/connectors/',
  'api': 'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview',
  'migration': 'https://learn.microsoft.com/en-us/power-platform/admin/migrate-data-between-environments',
  'monitoring': 'https://learn.microsoft.com/en-us/power-platform/admin/monitoring-overview',
  'licensing': 'https://learn.microsoft.com/en-us/power-platform/admin/pricing-billing-skus',
  
  // Default
  'default': 'https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-600/'
};

// Function to get the best URL for a question
function getMicrosoftLearnUrl(question) {
  // Check if question already has a URL
  if (question.microsoft_learn_url) {
    return question.microsoft_learn_url;
  }
  
  // Try to match based on tags
  if (question.tags && Array.isArray(question.tags)) {
    for (const tag of question.tags) {
      const lowerTag = tag.toLowerCase();
      for (const [key, url] of Object.entries(topicUrls)) {
        if (lowerTag.includes(key) || key.includes(lowerTag)) {
          return url;
        }
      }
    }
  }
  
  // Try to match based on topic
  if (question.topic) {
    const lowerTopic = question.topic.toLowerCase();
    for (const [key, url] of Object.entries(topicUrls)) {
      if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
        return url;
      }
    }
  }
  
  // Try to match based on exam_area
  if (question.exam_area) {
    const area = question.exam_area.toLowerCase();
    if (area.includes('envision')) {
      return 'https://learn.microsoft.com/en-us/power-platform/guidance/architecture/real-world-scenarios';
    } else if (area.includes('architect')) {
      return 'https://learn.microsoft.com/en-us/power-platform/well-architected/';
    } else if (area.includes('implement')) {
      return 'https://learn.microsoft.com/en-us/power-platform/guidance/adoption/';
    }
  }
  
  // Try to match based on question text
  if (question.question_text || question.question) {
    const text = (question.question_text || question.question).toLowerCase();
    for (const [key, url] of Object.entries(topicUrls)) {
      if (text.includes(key)) {
        return url;
      }
    }
  }
  
  // Return default PL-600 URL
  return topicUrls.default;
}

// Process all question files
const dataDir = path.join(__dirname, '..', 'data');
const files = [
  'all-extracted-questions.json',
  'questions-with-breakdown.json',
  'enhanced-questions.json',
  'questions.json'
];

files.forEach(filename => {
  const filePath = path.join(dataDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filename} - file not found`);
    return;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    let updated = false;
    
    // Process questions array
    if (data.questions && Array.isArray(data.questions)) {
      data.questions = data.questions.map(question => {
        if (!question.microsoft_learn_url) {
          question.microsoft_learn_url = getMicrosoftLearnUrl(question);
          updated = true;
        }
        return question;
      });
    }
    
    // Process direct array (some files might have questions as root array)
    if (Array.isArray(data)) {
      data = data.map(question => {
        if (!question.microsoft_learn_url) {
          question.microsoft_learn_url = getMicrosoftLearnUrl(question);
          updated = true;
        }
        return question;
      });
    }
    
    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`✅ Updated ${filename} with Microsoft Learn URLs`);
    } else {
      console.log(`ℹ️ ${filename} already has Microsoft Learn URLs`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
  }
});

console.log('\n🎉 Microsoft Learn URLs added to all question files!');