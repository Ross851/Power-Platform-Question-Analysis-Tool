# MCP Server Integration Guide

## Overview

The PL-600 Exam Prep Platform leverages Model Context Protocol (MCP) servers to provide hands-on learning experiences with real Microsoft services. This guide covers setup, configuration, and usage of each MCP integration.

## Available MCP Servers

### 1. Microsoft 365 (@microsoft/m365agentstoolkit-mcp) 🏢

**Purpose**: Enable hands-on practice with Power Platform components in a real Microsoft 365 environment.

#### Features
- Create and modify Power Apps
- Build Power Automate flows
- Work with Dataverse entities
- Test security configurations
- Practice solution deployment

#### Setup

1. **Register an Azure AD Application**:
   ```bash
   # Visit Azure Portal
   https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade
   
   # Create new registration
   - Name: PL600-Exam-Prep
   - Supported account types: Single tenant
   - Redirect URI: http://localhost:3000/auth/callback
   ```

2. **Configure Permissions**:
   ```
   Microsoft Graph API:
   - User.Read
   - Files.ReadWrite.All
   - Sites.ReadWrite.All
   
   Power Platform API:
   - Environment.ReadWrite.All
   - Flow.ReadWrite.All
   - PowerApp.ReadWrite.All
   ```

3. **Set Environment Variables**:
   ```bash
   # .env file
   VITE_AZURE_CLIENT_ID=your-client-id
   VITE_AZURE_CLIENT_SECRET=your-client-secret
   VITE_AZURE_TENANT_ID=your-tenant-id
   VITE_AZURE_REDIRECT_URI=http://localhost:3000/auth/callback
   ```

4. **Initialize in Application**:
   ```typescript
   import { Microsoft365MCP } from '@/features/mcpIntegration/microsoft365';
   
   const m365 = new Microsoft365MCP({
     clientId: import.meta.env.VITE_AZURE_CLIENT_ID,
     clientSecret: import.meta.env.VITE_AZURE_CLIENT_SECRET,
     tenantId: import.meta.env.VITE_AZURE_TENANT_ID,
   });
   
   await m365.authenticate();
   ```

#### Usage Examples

```typescript
// Create a Power App
const app = await m365.createPowerApp({
  name: 'PL600-Practice-App',
  description: 'Practice app for exam preparation',
  template: 'blank'
});

// Create a Power Automate flow
const flow = await m365.createFlow({
  name: 'Email-Notification-Flow',
  trigger: 'manual',
  actions: [{
    type: 'sendEmail',
    to: 'user@example.com',
    subject: 'Test Flow'
  }]
});

// Work with Dataverse
const entity = await m365.createDataverseEntity({
  name: 'exam_scores',
  fields: [
    { name: 'score', type: 'number' },
    { name: 'date', type: 'datetime' }
  ]
});
```

---

### 2. MS365 Office Services (@softeria/ms-365-mcp-server) 📊

**Purpose**: Access Microsoft Graph API for Office 365 integration and practice scenarios.

#### Features
- SharePoint list management
- Teams integration
- OneDrive file operations
- Outlook calendar management
- Excel data manipulation

#### Setup

```bash
# Environment variables
VITE_MS365_CLIENT_ID=your-client-id
VITE_MS365_CLIENT_SECRET=your-client-secret
VITE_MS365_TENANT_ID=your-tenant-id
```

#### Usage Examples

```typescript
// Create SharePoint list
const list = await ms365.createSharePointList({
  siteId: 'your-site-id',
  listName: 'Project Tasks',
  columns: ['Title', 'Status', 'DueDate']
});

// Send Teams message
await ms365.sendTeamsMessage({
  teamId: 'your-team-id',
  channelId: 'general',
  message: 'New study session starting!'
});
```

---

### 3. Azure DevOps (@tiberriver256/mcp-server-azure-devops) 🔧

**Purpose**: Practice ALM scenarios and DevOps workflows for Power Platform solutions.

#### Features
- Create and manage work items
- Set up CI/CD pipelines
- Version control for solutions
- Test plan management
- Release management

#### Setup

1. **Generate Personal Access Token (PAT)**:
   ```
   Azure DevOps > User Settings > Personal Access Tokens
   Scopes: Work Items (Read & Write), Code (Read & Write), Build (Read & Execute)
   ```

2. **Configure Environment**:
   ```bash
   VITE_AZURE_DEVOPS_PAT=your-pat-token
   VITE_AZURE_DEVOPS_ORG=https://dev.azure.com/your-org
   VITE_AZURE_DEVOPS_PROJECT=PL600-Practice
   ```

#### Usage Examples

```typescript
// Create work item for study task
const workItem = await azureDevOps.createWorkItem({
  type: 'Task',
  title: 'Complete Security Architecture module',
  description: 'Study and practice security patterns',
  assignedTo: 'user@example.com'
});

// Set up solution pipeline
const pipeline = await azureDevOps.createPipeline({
  name: 'PowerPlatform-Solution-Deploy',
  repository: 'pl600-solutions',
  yaml: 'azure-pipelines.yml'
});
```

---

### 4. GitHub (@modelcontextprotocol/server-github) 🐙

**Purpose**: Version control for practice solutions and collaborative learning.

#### Features
- Store practice solutions
- Share custom question sets
- Track learning progress in repos
- Collaborate on study materials
- Community contributions

#### Setup

```bash
# Generate GitHub token
# GitHub > Settings > Developer settings > Personal access tokens

VITE_GITHUB_TOKEN=your-github-token
VITE_GITHUB_OWNER=your-username
VITE_GITHUB_REPO=pl600-practice
```

#### Usage Examples

```typescript
// Save practice solution
await github.createFile({
  path: 'solutions/security-architecture.json',
  content: JSON.stringify(solutionData),
  message: 'Add security architecture practice solution'
});

// Share question set
await github.createGist({
  description: 'Custom PL-600 Security Questions',
  files: {
    'security-questions.json': {
      content: JSON.stringify(questions)
    }
  }
});
```

---

### 5. Pieces (pieces-mcp) 🧩

**Purpose**: Long-term memory and intelligent progress tracking.

#### Features
- Remember struggled concepts
- Track learning patterns
- Generate insights
- Personalized recommendations
- Spaced repetition optimization

#### Setup

```bash
# Pieces runs locally, no API key needed
# Ensure Pieces OS is installed and running
# Download from: https://pieces.app/

VITE_PIECES_PORT=1000  # Default Pieces port
```

#### Usage Examples

```typescript
// Save learning moment
await pieces.saveMemory({
  concept: 'Dataverse Security Roles',
  difficulty: 'high',
  notes: 'User struggled with role inheritance',
  timestamp: new Date()
});

// Get personalized recommendations
const recommendations = await pieces.getRecommendations({
  userId: 'current-user',
  examArea: 'security'
});
```

---

### 6. Obsidian (obsidian-mcp) 📝

**Purpose**: Personal knowledge management and study notes.

#### Features
- Create study notes
- Link related concepts
- Build knowledge graphs
- Track learning journey
- Export study materials

#### Setup

```bash
# Obsidian MCP runs via WebSocket
VITE_OBSIDIAN_PORT=22360
VITE_OBSIDIAN_VAULT_PATH=/path/to/vault
```

#### Usage Examples

```typescript
// Create study note
await obsidian.createNote({
  title: 'Power Platform Security Best Practices',
  content: markdown,
  tags: ['security', 'pl600', 'architecture']
});

// Link related concepts
await obsidian.linkNotes({
  from: 'Security-Roles.md',
  to: 'Dataverse-Permissions.md',
  relationship: 'related-to'
});
```

---

## Integration Architecture

### MCP Manager Class

```typescript
class MCPManager {
  private servers: Map<string, MCPServer> = new Map();
  
  constructor() {
    this.initializeServers();
  }
  
  private async initializeServers() {
    // Initialize all MCP servers
    this.servers.set('microsoft365', new Microsoft365MCP());
    this.servers.set('github', new GitHubMCP());
    this.servers.set('pieces', new PiecesMCP());
    this.servers.set('azuredevops', new AzureDevOpsMCP());
    this.servers.set('obsidian', new ObsidianMCP());
  }
  
  async executeCommand(server: string, command: string, params: any) {
    const mcpServer = this.servers.get(server);
    if (!mcpServer) {
      throw new Error(`MCP server ${server} not found`);
    }
    
    try {
      return await mcpServer.execute(command, params);
    } catch (error) {
      console.error(`MCP execution failed: ${error}`);
      // Fallback to static content
      return this.getFallbackResponse(command);
    }
  }
  
  private getFallbackResponse(command: string) {
    // Return cached or static content when MCP fails
    return staticContent[command] || null;
  }
}
```

### Lab Integration Example

```typescript
// Power Apps Lab Component
export const PowerAppsLab: React.FC = () => {
  const [labState, setLabState] = useState<LabState>('initializing');
  const mcpManager = useMCPManager();
  
  const startLab = async () => {
    try {
      // Connect to Microsoft 365
      await mcpManager.executeCommand('microsoft365', 'authenticate', {});
      
      // Create practice environment
      const environment = await mcpManager.executeCommand(
        'microsoft365',
        'createEnvironment',
        { name: 'PL600-Practice-Lab' }
      );
      
      // Create blank app
      const app = await mcpManager.executeCommand(
        'microsoft365',
        'createPowerApp',
        { 
          environmentId: environment.id,
          name: 'Practice App',
          type: 'canvas'
        }
      );
      
      setLabState('ready');
      return app;
    } catch (error) {
      console.error('Lab initialization failed:', error);
      setLabState('error');
    }
  };
  
  return (
    <div className="lab-container">
      {labState === 'ready' ? (
        <LabWorkspace />
      ) : (
        <button onClick={startLab}>Start Lab</button>
      )}
    </div>
  );
};
```

## Troubleshooting

### Common Issues

#### 1. Authentication Failures
```bash
# Check Azure AD app registration
# Verify redirect URIs match
# Ensure all required permissions are granted
# Check token expiry and refresh logic
```

#### 2. MCP Connection Issues
```bash
# Verify MCP server is running
# Check firewall rules
# Validate environment variables
# Review server logs
```

#### 3. Rate Limiting
```typescript
// Implement exponential backoff
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

## Best Practices

1. **Error Handling**: Always provide fallback content when MCP services are unavailable
2. **Caching**: Cache MCP responses to reduce API calls and improve performance
3. **Security**: Never expose credentials in client-side code
4. **Rate Limiting**: Implement request throttling to avoid service limits
5. **Monitoring**: Log all MCP interactions for debugging and analytics

## Testing MCP Integrations

```typescript
// Mock MCP server for testing
class MockMCPServer implements MCPServer {
  async execute(command: string, params: any) {
    // Return mock data for testing
    return mockResponses[command] || {};
  }
}

// Test example
describe('MCP Integration', () => {
  it('should create Power App successfully', async () => {
    const mcp = new MockMCPServer();
    const result = await mcp.execute('createPowerApp', {
      name: 'Test App'
    });
    expect(result).toHaveProperty('appId');
  });
});
```

## Resources

- [MCP Specification](https://modelcontextprotocol.io/)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/)
- [Power Platform APIs](https://docs.microsoft.com/en-us/power-platform/developer/)
- [Azure DevOps REST API](https://docs.microsoft.com/en-us/rest/api/azure/devops/)
- [GitHub API](https://docs.github.com/en/rest)

---

*For additional support with MCP integrations, please refer to the individual server documentation or open an issue in our GitHub repository.*