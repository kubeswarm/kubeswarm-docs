---
sidebar_position: 3
sidebar_label: "MCP Policy"
description: "kubeswarm MCP security policy - namespace-level URL allowlists and auth requirements for agent MCP tool server connections on Kubernetes."
---

# kubeswarm MCP Security Policy - URL Allowlists and Auth Requirements

Namespace-level policies in kubeswarm control which MCP servers agents can connect to and whether authentication is required on Kubernetes.

## Configuration

Policies are set via SwarmSettings `spec.security`:

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmSettings
metadata:
  name: security-policy
  namespace: production
spec:
  security:
    mcpAllowlist:
      - "https://mcp-github.internal.example.com/"
      - "https://mcp-jira.internal.example.com/"
    requireMCPAuth: true
```

## MCP Allowlist

When `mcpAllowlist` is set on any SwarmSettings in the namespace, the admission webhook rejects SwarmAgent specs that reference MCP server URLs not matching any listed prefix.

**How matching works:**

- URL prefix match: `https://mcp-github.internal.example.com/` matches `https://mcp-github.internal.example.com/sse`
- Multiple SwarmSettings are aggregated - the union of all allowlists is used
- Empty allowlist = no restriction

## Require MCP Auth

When `requireMCPAuth: true` is set on any SwarmSettings in the namespace, the admission webhook rejects SwarmAgent specs where any MCP server has no auth configured.

Valid auth configurations:

- `auth.bearer` - bearer token from a Secret
- `auth.mtls` - mTLS client certificate from a Secret

```yaml
spec:
  tools:
    mcp:
      - name: github
        url: https://mcp-github.internal.example.com/sse
        auth:
          bearer:
            secretKeyRef:
              name: mcp-tokens
              key: github-token
```

## Enforcement

Both policies are enforced by a `ValidatingWebhookConfiguration` with `failurePolicy: Ignore`. This means:

- Policies are enforced when the operator is running
- If the operator is unavailable, kubectl apply is not blocked
- The strictest policy across all SwarmSettings in the namespace wins
