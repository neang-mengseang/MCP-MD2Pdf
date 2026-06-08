# Example: Mermaid Diagrams

mcp-md2pdf renders Mermaid diagrams offline.

## Flowchart

```mermaid
flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Deploy]
    B -->|No| D[Debug]
    D --> B
```

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: POST /api/login
    Server-->>Client: JWT token
```

## In a PDF tool call

```json
{
  "markdown": "## Architecture\n\n```mermaid\ngraph TD\n  A[Client] --> B[API]\n  B --> C[Database]\n```",
  "theme": "github"
}
```
