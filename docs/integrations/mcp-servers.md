---
sidebar_position: 3
sidebar_label: "MCP Servers"
description: "Connect MCP tool servers to kubeswarm agents on Kubernetes. SSE transport, bearer auth, mTLS, custom headers and health monitoring."
---

# kubeswarm MCP Server Integration for Agents

kubeswarm agents connect to external tool servers via the Model Context Protocol (MCP) SSE transport. Configure auth, headers and health monitoring declaratively in YAML.

## Configuration

```yaml
spec:
  tools:
    mcp:
      - name: github
        url: https://mcp-github.example.com/sse
        trust: internal
        instructions: "Read-only. Branch: main."
        auth:
          bearer:
            secretKeyRef:
              name: mcp-tokens
              key: github-token
        headers:
          - name: X-Project-ID
            value: "my-project"
```

## Authentication

| Method     | Configuration              | Use case                     |
| ---------- | -------------------------- | ---------------------------- |
| **None**   | Omit `auth`                | Internal/development servers |
| **Bearer** | `auth.bearer.secretKeyRef` | Token-based auth             |
| **mTLS**   | `auth.mtls.secretRef`      | Certificate-based auth       |

Bearer and mTLS are mutually exclusive. The namespace security policy can require auth on all MCP servers - see [MCP Policy](/security/mcp-policy).

## Health Monitoring

The operator probes each MCP server with an HTTP GET every 60 seconds:

- Any response with status < 500 = healthy (including 401 - reachable but needs auth)
- 5xx or connection error = unhealthy, sets `MCPDegraded` condition

```bash
kubectl describe swagent my-agent | grep -A5 "MCP Servers"
```

## Multiple servers

Agents can connect to multiple MCP servers. Each is independent:

```yaml
spec:
  tools:
    mcp:
      - name: github
        url: https://mcp-github.example.com/sse
        trust: internal
      - name: jira
        url: https://mcp-jira.example.com/sse
        trust: internal
      - name: search
        url: https://mcp-search.example.com/sse
        trust: external
```

Tool names are prefixed with the server name: `github/read_file`, `jira/create_issue`.
