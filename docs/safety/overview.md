---
sidebar_position: 1
sidebar_label: "Overview"
description: "kubeswarm security - defense-in-depth security for agent workloads on Kubernetes. Guardrails, trust model, MCP policy, network policies and API key management."
---

# Security Overview

LLM agents are not traditional microservices. They make autonomous decisions, call external tools, and process untrusted input. kubeswarm applies defense-in-depth security at every layer - not as optional configuration, but as enforced defaults.

## Security layers

| Layer | Control | Default |
|---|---|---|
| **Container** | Non-root, read-only filesystem, all capabilities dropped | Always enforced |
| **Network** | NetworkPolicy restricts agent pod egress | Enabled |
| **Tools** | Allow/deny lists, per-tool trust levels, token-per-call limits | Configurable |
| **MCP** | URL allowlist, auth requirements, admission webhook rejection | Configurable |
| **Secrets** | API keys in Kubernetes Secrets via `secretKeyRef` | Required |
| **Budget** | Daily token limits with hard stop enforcement | Configurable |
| **Audit** | Immutable action trail with per-event attribution | Configurable |

## What is enforced by default

These are not optional and cannot be disabled:

- **`runAsNonRoot: true`** - agent pods never run as root
- **`readOnlyRootFilesystem: true`** - no writes to the container filesystem
- **`capabilities: drop: ["ALL"]`** - no Linux capabilities
- **API keys in Secrets** - the operator never inlines credentials into pod specs
- **RBAC least privilege** - the controller requests only the verbs and resources it needs

## Detailed guides

- [Guardrails and Trust](/safety/guardrails) - tool allow/deny, trust levels, execution limits
- [MCP Policy](/safety/mcp-policy) - URL allowlist, auth requirements
- [Network Policies](/safety/network-policies) - pod egress control
- [API Key Management](/safety/api-key-management) - native Kubernetes Secrets
