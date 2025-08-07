import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the HTML file
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index-old.html'), 'utf8');

// Extract JSON data from the HTML
const jsonMatch = htmlContent.match(/const\s+questions\s*=\s*(\[[\s\S]*?\]);/);
if (!jsonMatch) {
  // Try another pattern
  const dataMatch = htmlContent.match(/\[[\s\S]*?\{[\s\S]*?\}\s*\]/);
  if (dataMatch) {
    try {
      const questions = JSON.parse(dataMatch[0]);
      processQuestions(questions);
    } catch (e) {
      console.error('Error parsing JSON from HTML:', e);
      // Try to extract individual question objects
      extractIndividualQuestions(htmlContent);
    }
  }
} else {
  try {
    const questions = eval(jsonMatch[1]);
    processQuestions(questions);
  } catch (e) {
    console.error('Error evaluating questions:', e);
  }
}

function extractIndividualQuestions(content) {
  // Extract individual question objects
  const questionPattern = /\{[^{}]*"id"\s*:\s*\d+[^{}]*"type"\s*:\s*"[^"]*"[^{}]*"question"[^{}]*\}/g;
  const matches = content.match(questionPattern);
  
  if (matches) {
    const questions = [];
    matches.forEach(match => {
      try {
        // Clean up the match
        const cleaned = match.replace(/\n/g, ' ').replace(/\s+/g, ' ');
        const question = JSON.parse(cleaned);
        questions.push(question);
      } catch (e) {
        // Try to manually parse key fields
        const id = match.match(/"id"\s*:\s*(\d+)/);
        const type = match.match(/"type"\s*:\s*"([^"]*)"/);
        const questionText = match.match(/"question"\s*:\s*"([^"]*)"/);
        const examArea = match.match(/"examArea"\s*:\s*"([^"]*)"/);
        
        if (id && type && questionText) {
          questions.push({
            id: parseInt(id[1]),
            type: type[1],
            question: questionText[1],
            examArea: examArea ? examArea[1] : 'Unknown'
          });
        }
      }
    });
    
    console.log(`Found ${questions.length} questions`);
    processQuestions(questions);
  }
}

function processQuestions(questions) {
  // Microsoft PL-600 official exam areas
  const examAreas = {
    'envisioning': {
      name: 'Solution Envisioning and Requirements Analysis',
      weight: '35-40%',
      topics: [
        'Initiate solution planning',
        'Identify organization information and metrics',
        'Identify existing solutions and systems',
        'Capture requirements',
        'Perform fit/gap analysis'
      ]
    },
    'architecture': {
      name: 'Solution Architecture',
      weight: '40-45%',
      topics: [
        'Lead the design process',
        'Design solution topology',
        'Design customizations',
        'Design integrations',
        'Design migrations',
        'Design security model',
        'Design for deployment and operations'
      ]
    },
    'implementation': {
      name: 'Solution Implementation',
      weight: '15-20%',
      topics: [
        'Validate solution design',
        'Support go-live',
        'Optimize solution performance'
      ]
    }
  };

  // Categorize questions by type
  const questionsByType = {
    'multiplechoice': [],
    'yesno': [],
    'sequence': [],
    'dragdrop': [],
    'hotspot': [],
    'casestudy': []
  };

  // Categorize questions by exam area
  const questionsByArea = {
    'envisioning': [],
    'architecture': [],
    'implementation': []
  };

  questions.forEach(q => {
    // Categorize by type
    const type = q.type || 'multiplechoice';
    if (!questionsByType[type]) {
      questionsByType[type] = [];
    }
    questionsByType[type].push(q);

    // Categorize by exam area
    const examArea = q.examArea || '';
    if (examArea.includes('Envisioning') || examArea.includes('Requirements')) {
      questionsByArea.envisioning.push(q);
    } else if (examArea.includes('Architecture')) {
      questionsByArea.architecture.push(q);
    } else if (examArea.includes('Implementation')) {
      questionsByArea.implementation.push(q);
    } else {
      // Try to infer from question content
      const questionText = (q.question || '').toLowerCase();
      if (questionText.includes('requirement') || questionText.includes('stakeholder') || questionText.includes('planning')) {
        questionsByArea.envisioning.push(q);
      } else if (questionText.includes('architecture') || questionText.includes('design') || questionText.includes('integration')) {
        questionsByArea.architecture.push(q);
      } else {
        questionsByArea.implementation.push(q);
      }
    }
  });

  // Generate statistics
  console.log('\n=== Question Statistics ===');
  console.log(`Total Questions: ${questions.length}`);
  
  console.log('\n--- By Type ---');
  Object.entries(questionsByType).forEach(([type, qs]) => {
    if (qs.length > 0) {
      console.log(`${type}: ${qs.length} questions`);
    }
  });

  console.log('\n--- By Exam Area ---');
  Object.entries(questionsByArea).forEach(([area, qs]) => {
    const areaInfo = examAreas[area];
    console.log(`${areaInfo.name} (${areaInfo.weight}): ${qs.length} questions`);
  });

  // Save processed questions
  const output = {
    metadata: {
      totalQuestions: questions.length,
      extractedAt: new Date().toISOString(),
      examAreas: examAreas,
      statistics: {
        byType: Object.fromEntries(
          Object.entries(questionsByType).map(([k, v]) => [k, v.length])
        ),
        byArea: Object.fromEntries(
          Object.entries(questionsByArea).map(([k, v]) => [k, v.length])
        )
      }
    },
    questions: questions,
    questionsByType: questionsByType,
    questionsByArea: questionsByArea
  };

  // Save to file
  fs.writeFileSync(
    path.join(__dirname, '..', 'src', 'data', 'all-questions-extracted.json'),
    JSON.stringify(output, null, 2)
  );

  console.log('\nQuestions saved to src/data/all-questions-extracted.json');
}