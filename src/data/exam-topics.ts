/**
 * Comprehensive PL-600 Exam Topics with Microsoft Learn Links
 * Based on September 2024 exam update
 */

export interface ExamTopic {
  id: string;
  name: string;
  weight: string;
  color: string;
  icon: string;
  description: string;
  learnMoreUrl: string;
  subtopics: SubTopic[];
}

export interface SubTopic {
  id: string;
  name: string;
  keywords: string[];
  hints: string[];
  commonMistakes: string[];
  microsoftLearnUrl?: string;
}

export const examTopics: ExamTopic[] = [
  {
    id: 'envisioning',
    name: 'Solution Envisioning and Requirements Analysis',
    weight: '45-50%',
    color: 'blue',
    icon: '🎯',
    description: 'Evaluate business requirements, identify solutions, and perform fit/gap analysis',
    learnMoreUrl: 'https://learn.microsoft.com/en-us/training/modules/solution-architect-introduction/',
    subtopics: [
      {
        id: 'solution-planning',
        name: 'Initiate Solution Planning',
        keywords: ['business requirements', 'solution components', 'migration', 'estimation'],
        hints: [
          'Always start with business requirements before technical solutions',
          'Consider existing components from AppSource and Dynamics 365',
          'Estimate both migration effort AND ongoing maintenance'
        ],
        commonMistakes: [
          'Jumping to technical solutions without understanding business needs',
          'Underestimating migration complexity',
          'Not considering licensing costs early'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/solution-architect-design/'
      },
      {
        id: 'organization-metrics',
        name: 'Identify Organization Information and Metrics',
        keywords: ['KPIs', 'success criteria', 'risk assessment', 'business processes'],
        hints: [
          'Document current state before designing future state',
          'Identify measurable success criteria upfront',
          'Consider organizational change management risks'
        ],
        commonMistakes: [
          'Not establishing baseline metrics',
          'Ignoring organizational culture and readiness',
          'Missing key stakeholder involvement'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/discover-customer-needs/'
      },
      {
        id: 'existing-solutions',
        name: 'Identify Existing Solutions and Systems',
        keywords: ['enterprise architecture', 'data sources', 'integration points', 'technical debt'],
        hints: [
          'Map all existing systems and data flows',
          'Identify systems of record vs systems of engagement',
          'Consider technical debt and modernization opportunities'
        ],
        commonMistakes: [
          'Missing shadow IT systems',
          'Not considering data quality issues',
          'Overlooking legacy system constraints'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/review-architecture/'
      },
      {
        id: 'requirements-capture',
        name: 'Capture Requirements',
        keywords: ['functional', 'non-functional', 'user stories', 'acceptance criteria'],
        hints: [
          'Distinguish between functional and non-functional requirements',
          'Use user stories with clear acceptance criteria',
          'Prioritize requirements using MoSCoW method'
        ],
        commonMistakes: [
          'Mixing solution design with requirements',
          'Missing non-functional requirements like performance',
          'Not validating requirements with end users'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/functional-consultant-skills/'
      },
      {
        id: 'fit-gap-analysis',
        name: 'Perform Fit/Gap Analysis',
        keywords: ['feasibility', 'gaps', 'customization', 'configuration'],
        hints: [
          'Prefer configuration over customization',
          'Consider total cost of ownership for customizations',
          'Document gaps and proposed solutions clearly'
        ],
        commonMistakes: [
          'Over-customizing when configuration would work',
          'Underestimating customization maintenance',
          'Not considering future platform updates'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/fit-gap-analysis/'
      }
    ]
  },
  {
    id: 'architecture',
    name: 'Architect a Solution',
    weight: '35-40%',
    color: 'purple',
    icon: '🏗️',
    description: 'Design the technical architecture, data model, integrations, and security',
    learnMoreUrl: 'https://learn.microsoft.com/en-us/training/modules/solution-architecture-design/',
    subtopics: [
      {
        id: 'design-process',
        name: 'Lead the Design Process',
        keywords: ['solution topology', 'environment strategy', 'ALM', 'DevOps'],
        hints: [
          'Design for scalability from the start',
          'Plan environments: Dev, Test, UAT, Prod',
          'Implement proper ALM and DevOps practices'
        ],
        commonMistakes: [
          'Single environment development',
          'No source control strategy',
          'Missing deployment automation'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/application-lifecycle-management-architect/'
      },
      {
        id: 'data-model',
        name: 'Design the Data Model',
        keywords: ['tables', 'relationships', 'dataverse', 'virtual tables'],
        hints: [
          'Use standard tables when possible',
          'Design for reporting needs upfront',
          'Consider virtual tables for external data'
        ],
        commonMistakes: [
          'Over-normalizing the data model',
          'Not planning for data volume growth',
          'Ignoring relationship behavior impacts'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/data-model-solution-architect/'
      },
      {
        id: 'integrations',
        name: 'Design Integrations',
        keywords: ['connectors', 'APIs', 'dataflows', 'Azure Logic Apps'],
        hints: [
          'Use standard connectors when available',
          'Consider data synchronization patterns',
          'Plan for error handling and retry logic'
        ],
        commonMistakes: [
          'Point-to-point integrations without middleware',
          'No error handling or monitoring',
          'Synchronous when async would be better'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/integrations-solution-architect/'
      },
      {
        id: 'security-model',
        name: 'Design the Security Model',
        keywords: ['security roles', 'business units', 'field security', 'teams'],
        hints: [
          'Principle of least privilege',
          'Use teams for collaborative security',
          'Consider field-level security needs'
        ],
        commonMistakes: [
          'Over-permissive security roles',
          'Not testing security thoroughly',
          'Ignoring row-level security needs'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/security-solution-architect/'
      },
      {
        id: 'ui-ux-design',
        name: 'Design User Experience',
        keywords: ['model-driven apps', 'canvas apps', 'Power Pages', 'responsive design'],
        hints: [
          'Choose the right app type for the use case',
          'Design for mobile from the start',
          'Follow accessibility guidelines'
        ],
        commonMistakes: [
          'Using canvas apps when model-driven would be better',
          'Not considering offline scenarios',
          'Ignoring accessibility requirements'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/portals-architecture/'
      }
    ]
  },
  {
    id: 'implementation',
    name: 'Implement the Solution',
    weight: '15-20%',
    color: 'green',
    icon: '🚀',
    description: 'Validate design, support go-live, and optimize performance',
    learnMoreUrl: 'https://learn.microsoft.com/en-us/training/modules/solution-testing-architect/',
    subtopics: [
      {
        id: 'solution-validation',
        name: 'Validate the Solution Design',
        keywords: ['testing', 'UAT', 'performance testing', 'security testing'],
        hints: [
          'Create comprehensive test plans',
          'Include performance and load testing',
          'Validate security model thoroughly'
        ],
        commonMistakes: [
          'Insufficient test coverage',
          'No performance testing until production',
          'Missing edge case scenarios'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/testing-strategy-solution-architect/'
      },
      {
        id: 'go-live-support',
        name: 'Support Go-Live',
        keywords: ['deployment', 'cutover', 'training', 'hypercare'],
        hints: [
          'Create detailed cutover plans',
          'Plan for rollback scenarios',
          'Provide adequate user training'
        ],
        commonMistakes: [
          'No rollback plan',
          'Insufficient user training',
          'Missing post go-live support plan'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/go-live-architect/'
      },
      {
        id: 'performance-optimization',
        name: 'Optimize Solution Performance',
        keywords: ['monitoring', 'Application Insights', 'capacity planning', 'optimization'],
        hints: [
          'Implement monitoring from day one',
          'Use Application Insights for telemetry',
          'Plan for capacity and scaling'
        ],
        commonMistakes: [
          'No monitoring until issues occur',
          'Not planning for data growth',
          'Ignoring API limits and throttling'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/performance-solution-architect/'
      },
      {
        id: 'change-management',
        name: 'Manage Change and Adoption',
        keywords: ['adoption', 'training', 'champions', 'feedback'],
        hints: [
          'Identify and train champions early',
          'Create adoption metrics and track them',
          'Establish feedback loops'
        ],
        commonMistakes: [
          'Assuming users will adopt naturally',
          'No adoption metrics defined',
          'Ignoring user feedback'
        ],
        microsoftLearnUrl: 'https://learn.microsoft.com/en-us/training/modules/change-management/'
      }
    ]
  }
];

// Additional detailed topics for comprehensive filtering
export const detailedTopics = [
  // Technical Topics
  { id: 'dataverse', name: 'Dataverse', category: 'technical' },
  { id: 'power-automate', name: 'Power Automate', category: 'technical' },
  { id: 'power-apps', name: 'Power Apps', category: 'technical' },
  { id: 'power-bi', name: 'Power BI', category: 'technical' },
  { id: 'power-pages', name: 'Power Pages', category: 'technical' },
  { id: 'power-virtual-agents', name: 'Power Virtual Agents', category: 'technical' },
  { id: 'azure-integration', name: 'Azure Integration', category: 'technical' },
  { id: 'dynamics-365', name: 'Dynamics 365', category: 'technical' },
  
  // Architecture Topics
  { id: 'alm', name: 'Application Lifecycle Management', category: 'architecture' },
  { id: 'devops', name: 'DevOps', category: 'architecture' },
  { id: 'solution-layers', name: 'Solution Layers', category: 'architecture' },
  { id: 'managed-solutions', name: 'Managed Solutions', category: 'architecture' },
  { id: 'environment-strategy', name: 'Environment Strategy', category: 'architecture' },
  
  // Security Topics
  { id: 'authentication', name: 'Authentication', category: 'security' },
  { id: 'authorization', name: 'Authorization', category: 'security' },
  { id: 'conditional-access', name: 'Conditional Access', category: 'security' },
  { id: 'data-loss-prevention', name: 'Data Loss Prevention', category: 'security' },
  { id: 'encryption', name: 'Encryption', category: 'security' },
  
  // Integration Topics
  { id: 'connectors', name: 'Connectors', category: 'integration' },
  { id: 'custom-connectors', name: 'Custom Connectors', category: 'integration' },
  { id: 'webhooks', name: 'Webhooks', category: 'integration' },
  { id: 'service-bus', name: 'Service Bus', category: 'integration' },
  { id: 'event-grid', name: 'Event Grid', category: 'integration' },
  
  // Performance Topics
  { id: 'caching', name: 'Caching', category: 'performance' },
  { id: 'indexing', name: 'Indexing', category: 'performance' },
  { id: 'query-optimization', name: 'Query Optimization', category: 'performance' },
  { id: 'api-limits', name: 'API Limits', category: 'performance' },
  { id: 'throttling', name: 'Throttling', category: 'performance' },
  
  // Governance Topics
  { id: 'center-of-excellence', name: 'Center of Excellence', category: 'governance' },
  { id: 'policies', name: 'Policies', category: 'governance' },
  { id: 'compliance', name: 'Compliance', category: 'governance' },
  { id: 'auditing', name: 'Auditing', category: 'governance' },
  { id: 'monitoring', name: 'Monitoring', category: 'governance' }
];

// Helper function to get all searchable keywords
export function getAllKeywords(): string[] {
  const keywords: string[] = [];
  
  examTopics.forEach(topic => {
    keywords.push(topic.name.toLowerCase());
    topic.subtopics.forEach(subtopic => {
      keywords.push(subtopic.name.toLowerCase());
      keywords.push(...subtopic.keywords.map(k => k.toLowerCase()));
    });
  });
  
  detailedTopics.forEach(topic => {
    keywords.push(topic.name.toLowerCase());
  });
  
  return [...new Set(keywords)]; // Remove duplicates
}

// Helper function to get Microsoft Learn URL for a topic
export function getMicrosoftLearnUrl(topicId: string): string {
  const baseUrl = 'https://learn.microsoft.com/en-us/training/browse/?products=power-platform&terms=';
  
  const topic = detailedTopics.find(t => t.id === topicId);
  if (topic) {
    return baseUrl + encodeURIComponent(topic.name);
  }
  
  // Default to main PL-600 page
  return 'https://learn.microsoft.com/en-us/credentials/certifications/exams/pl-600/';
}

// Get study resources for a specific topic
export function getStudyResources(topicId: string): { title: string; url: string; type: string }[] {
  const resources = [
    {
      title: 'Official PL-600 Study Guide',
      url: 'https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/pl-600',
      type: 'guide'
    },
    {
      title: 'Power Platform Well-Architected Framework',
      url: 'https://learn.microsoft.com/en-us/power-platform/well-architected/',
      type: 'framework'
    },
    {
      title: 'Power Platform Admin Center',
      url: 'https://learn.microsoft.com/en-us/power-platform/admin/',
      type: 'documentation'
    },
    {
      title: 'Solution Architecture Best Practices',
      url: 'https://learn.microsoft.com/en-us/power-platform/guidance/architecture/real-world-examples',
      type: 'best-practices'
    }
  ];
  
  // Add topic-specific resource
  resources.push({
    title: `Learn more about ${topicId}`,
    url: getMicrosoftLearnUrl(topicId),
    type: 'topic'
  });
  
  return resources;
}