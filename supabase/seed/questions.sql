-- Insert sample questions into the database
-- Generated: 2025-08-07T17:34:00.871Z

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-001',
  'You are designing a Power Platform solution for a multinational corporation. The solution needs to support users in 15 countries with different languages and currencies. What should you recommend to ensure proper localization?',
  'multiple-choice',
  '[{"id":"a","text":"Create separate apps for each country","isCorrect":false},{"id":"b","text":"Use Power Platform''s built-in localization features and configure multiple languages","isCorrect":true},{"id":"c","text":"Build a single app in English only","isCorrect":false},{"id":"d","text":"Use external translation services","isCorrect":false}]',
  '"b"',
  '{"correct":"Power Platform provides built-in localization features that support multiple languages and currencies, making it the most efficient solution.","incorrect":{"a":"Creating separate apps would be inefficient and difficult to maintain.","c":"A single English app wouldn''t meet the multilingual requirements.","d":"External services add unnecessary complexity when built-in features are available."}}',
  'envisioning',
  3,
  ARRAY['localization', 'global-deployment', 'solution-design'],
  'https://learn.microsoft.com/en-us/power-platform/admin/enable-languages',
  90
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-002',
  'A client wants to migrate their legacy on-premises CRM system to Power Platform. What is the FIRST step you should take in the migration process?',
  'multiple-choice',
  '[{"id":"a","text":"Start building the new Power Apps immediately","isCorrect":false},{"id":"b","text":"Perform a comprehensive assessment of the current system and data","isCorrect":true},{"id":"c","text":"Delete all legacy data to start fresh","isCorrect":false},{"id":"d","text":"Purchase additional Power Platform licenses","isCorrect":false}]',
  '"b"',
  '{"correct":"A comprehensive assessment is crucial to understand data structures, business processes, and requirements before migration.","incorrect":{"a":"Building without assessment leads to incomplete or incorrect solutions.","c":"Legacy data is valuable and should be migrated appropriately.","d":"License planning comes after understanding the requirements."}}',
  'envisioning',
  2,
  ARRAY['migration', 'assessment', 'planning'],
  'https://learn.microsoft.com/en-us/power-platform/guidance/adoption/assess-readiness',
  60
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-003',
  'You need to implement row-level security in a Power Platform solution. Users should only see records from their own department. Which approach should you use?',
  'multiple-choice',
  '[{"id":"a","text":"Create separate tables for each department","isCorrect":false},{"id":"b","text":"Use Dataverse security roles and business units","isCorrect":true},{"id":"c","text":"Implement security in the Power Apps formula","isCorrect":false},{"id":"d","text":"Use SharePoint permissions","isCorrect":false}]',
  '"b"',
  '{"correct":"Dataverse security roles and business units provide robust row-level security that''s maintained at the platform level.","incorrect":{"a":"Separate tables create maintenance overhead and data silos.","c":"App-level security can be bypassed and isn''t comprehensive.","d":"SharePoint permissions don''t apply to Dataverse data."}}',
  'architecture',
  3,
  ARRAY['security', 'dataverse', 'row-level-security'],
  'https://learn.microsoft.com/en-us/power-platform/admin/security-roles-privileges',
  75
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-004',
  'Your solution requires real-time integration with an external REST API that has rate limiting of 100 calls per minute. What pattern should you implement?',
  'multiple-choice',
  '[{"id":"a","text":"Direct API calls from Power Automate with no throttling","isCorrect":false},{"id":"b","text":"Implement a queue pattern with Azure Service Bus and throttling","isCorrect":true},{"id":"c","text":"Make all API calls from the Power Apps client","isCorrect":false},{"id":"d","text":"Cache all data locally and never call the API","isCorrect":false}]',
  '"b"',
  '{"correct":"A queue pattern with Service Bus allows you to manage rate limits effectively while ensuring reliable message delivery.","incorrect":{"a":"No throttling would exceed rate limits and cause failures.","c":"Client-side calls are insecure and can''t manage rate limits effectively.","d":"Never calling the API means no real-time integration."}}',
  'architecture',
  4,
  ARRAY['integration', 'api', 'rate-limiting', 'azure'],
  'https://learn.microsoft.com/en-us/azure/architecture/patterns/throttling',
  120
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-005',
  'You''re implementing ALM for a Power Platform solution. Which tool should you use for automated deployments between environments?',
  'multiple-choice',
  '[{"id":"a","text":"Manual export/import of solutions","isCorrect":false},{"id":"b","text":"Power Platform Build Tools in Azure DevOps","isCorrect":true},{"id":"c","text":"Copy and paste components between environments","isCorrect":false},{"id":"d","text":"FTP file transfer","isCorrect":false}]',
  '"b"',
  '{"correct":"Power Platform Build Tools in Azure DevOps provide automated, repeatable deployments with proper ALM practices.","incorrect":{"a":"Manual processes are error-prone and not scalable.","c":"Copy-paste doesn''t maintain dependencies and configurations.","d":"FTP is not applicable for Power Platform deployments."}}',
  'implementation',
  3,
  ARRAY['alm', 'devops', 'deployment', 'automation'],
  'https://learn.microsoft.com/en-us/power-platform/alm/devops-build-tools',
  90
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-006',
  'A Power Automate flow is failing intermittently with timeout errors. What is the BEST approach to handle this?',
  'multiple-choice',
  '[{"id":"a","text":"Increase the timeout to maximum and hope it works","isCorrect":false},{"id":"b","text":"Implement retry policies with exponential backoff","isCorrect":true},{"id":"c","text":"Remove the problematic action","isCorrect":false},{"id":"d","text":"Run the flow more frequently","isCorrect":false}]',
  '"b"',
  '{"correct":"Retry policies with exponential backoff handle transient failures gracefully while avoiding overwhelming the system.","incorrect":{"a":"Simply increasing timeout doesn''t address the root cause.","c":"Removing functionality isn''t a solution.","d":"Running more frequently could worsen the problem."}}',
  'implementation',
  3,
  ARRAY['power-automate', 'error-handling', 'retry-policy'],
  'https://learn.microsoft.com/en-us/power-automate/retry-policy',
  60
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-007',
  'You need to store 50GB of documents that must be accessible from a Power Apps canvas app. What storage solution should you recommend?',
  'multiple-choice',
  '[{"id":"a","text":"Store all documents in Dataverse","isCorrect":false},{"id":"b","text":"Use SharePoint document libraries with Power Apps connector","isCorrect":true},{"id":"c","text":"Embed documents directly in the app","isCorrect":false},{"id":"d","text":"Use local device storage","isCorrect":false}]',
  '"b"',
  '{"correct":"SharePoint is designed for document storage and integrates well with Power Apps while being cost-effective for large volumes.","incorrect":{"a":"Dataverse storage for 50GB would be expensive and not optimized for documents.","c":"Embedding 50GB in an app is impossible and impractical.","d":"Local storage doesn''t provide centralized access."}}',
  'architecture',
  2,
  ARRAY['storage', 'sharepoint', 'documents', 'canvas-apps'],
  'https://learn.microsoft.com/en-us/power-apps/maker/canvas-apps/connections/connection-sharepoint-online',
  60
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-008',
  'A solution requires processing 100,000 records daily with complex calculations. What approach provides the best performance?',
  'multiple-choice',
  '[{"id":"a","text":"Process all records in a single Power Automate flow","isCorrect":false},{"id":"b","text":"Use Dataverse plugins for server-side processing","isCorrect":false},{"id":"c","text":"Implement batch processing with Azure Functions and Dataverse Web API","isCorrect":true},{"id":"d","text":"Process records one by one in Power Apps","isCorrect":false}]',
  '"c"',
  '{"correct":"Azure Functions with batch processing provides scalability and performance for high-volume operations.","incorrect":{"a":"Single flow would timeout and has limits on processing time.","b":"Plugins have execution time limits and aren''t ideal for batch processing.","d":"Processing in Power Apps would be extremely slow and impractical."}}',
  'architecture',
  4,
  ARRAY['performance', 'batch-processing', 'azure-functions', 'scalability'],
  'https://learn.microsoft.com/en-us/power-apps/developer/data-platform/webapi/overview',
  120
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-009',
  'You need to ensure GDPR compliance for a Power Platform solution handling EU citizen data. What must you implement?',
  'multiple-choice',
  '[{"id":"a","text":"Only store data in EU data centers","isCorrect":false},{"id":"b","text":"Implement data retention policies, audit logging, and data subject rights","isCorrect":true},{"id":"c","text":"Encrypt all data with custom encryption","isCorrect":false},{"id":"d","text":"Avoid storing any personal data","isCorrect":false}]',
  '"b"',
  '{"correct":"GDPR requires comprehensive data governance including retention, auditing, and supporting data subject rights (access, deletion, portability).","incorrect":{"a":"Data location is just one aspect; GDPR requires much more.","c":"Platform encryption is sufficient; custom encryption isn''t required.","d":"Avoiding personal data isn''t practical for most business solutions."}}',
  'envisioning',
  4,
  ARRAY['gdpr', 'compliance', 'data-governance', 'privacy'],
  'https://learn.microsoft.com/en-us/power-platform/admin/gdpr-compliance',
  90
) ON CONFLICT (question_number) DO NOTHING;

INSERT INTO questions (
  question_number, question_text, question_type, options, correct_answer,
  explanation, exam_area, difficulty, tags, microsoft_learn_url, estimated_time
) VALUES (
  'PL600-010',
  'A Power Apps portal needs to support 10,000 concurrent users. What architecture pattern should you implement?',
  'multiple-choice',
  '[{"id":"a","text":"Single portal instance with default settings","isCorrect":false},{"id":"b","text":"Multiple portal instances with Azure Front Door for load balancing","isCorrect":true},{"id":"c","text":"Canvas app instead of portal","isCorrect":false},{"id":"d","text":"On-premises web server","isCorrect":false}]',
  '"b"',
  '{"correct":"Multiple portal instances with Azure Front Door provides scalability, load balancing, and high availability for large user bases.","incorrect":{"a":"Single instance can''t handle 10,000 concurrent users effectively.","c":"Canvas apps aren''t designed for external users at this scale.","d":"On-premises doesn''t provide the scalability needed."}}',
  'architecture',
  5,
  ARRAY['portals', 'scalability', 'high-availability', 'azure-front-door'],
  'https://learn.microsoft.com/en-us/power-apps/maker/portals/architecture',
  120
) ON CONFLICT (question_number) DO NOTHING;

