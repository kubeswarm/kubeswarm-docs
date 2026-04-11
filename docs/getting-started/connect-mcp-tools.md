---
sidebar_position: 2
sidebar_label: "Connect MCP Tools"
description: "Connect MCP tool servers to your kubeswarm agents. Configure bearer auth, mTLS, custom headers and per-tool instructions for Kubernetes-native agents."
---

# Connect MCP Tools to kubeswarm Agents

Give your kubeswarm agents access to external tools via the Model Context Protocol (MCP). kubeswarm supports bearer auth, mTLS, custom headers and per-server instructions out of the box.

## Add an MCP Server

```yaml
spec:
  tools:
    mcp:
      - name: github
        url: https://mcp-github.example.com/sse
        trust: internal
        instructions: "Read-only. Use for fetching PR diffs."
        auth:
          bearer:
            secretKeyRef:
              name: mcp-tokens
              key: github-token
```

## Authentication

Two auth methods are supported:

### Bearer Token

```yaml
auth:
  bearer:
    secretKeyRef:
      name: mcp-tokens
      key: github-token
```

### mTLS

```yaml
auth:
  mtls:
    secretRef:
      name: mcp-certs # must contain tls.crt, tls.key
```

Bearer and mTLS are mutually exclusive.

## Custom Headers

Send additional headers with every request:

```yaml
headers:
  - name: X-Project-ID
    value: "my-project"
  - name: X-Auth-Extra
    secretKeyRef:
      name: mcp-tokens
      key: extra-header
```

## Instructions

The `instructions` field is injected into the agent's system prompt for this specific MCP server. Use it for deployment-specific constraints:

```yaml
instructions: "Branch: main only. Never modify files outside src/."
```

## Verify

After deploying, check MCP server health:

```bash
kubectl describe swagent my-agent
# Look for status.toolConnections[].healthy
```

If a server is unreachable, the `MCPDegraded` condition is set.
