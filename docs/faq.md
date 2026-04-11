---
sidebar_position: 99
sidebar_label: "FAQ"
description: "kubeswarm FAQ - frequently asked questions about Kubernetes agent orchestration, LLM providers, MCP tools, budget management and agent-to-agent connections."
---

# kubeswarm FAQ - Orchestrate Agents on Kubernetes

## Do I need a cloud LLM API key?

Frequently asked questions about kubeswarm - the Kubernetes operator for agent orchestration.

## What models are supported?

Any model accessible via Anthropic, OpenAI, Google Gemini APIs, or any OpenAI-compatible endpoint (Ollama, vLLM, LM Studio). See [LLM Providers](/integrations/llm-providers).

## Does kubeswarm run the LLM?

No. kubeswarm orchestrates agent pods that call external LLM APIs. It does not host or serve models. The LLM runs wherever you point it - cloud API, self-hosted Ollama, vLLM, etc.

## What is the MCP gateway?

An operator-managed SSE server that exposes SwarmAgent capabilities as MCP tools. This enables agent-to-agent calls and external MCP client access. It is an implementation detail - you don't need to configure it directly.

## How do I manage API keys?

Use native Kubernetes Secrets. Reference them via `spec.apiKeyRef` (single key) or `spec.envFrom` (multiple keys). See [API Key Management](/security/api-key-management).

## Is there a custom secret CRD?

No. kubeswarm uses native Kubernetes Secrets only. No wrapper CRD.

## How does budget enforcement work?

The operator tracks rolling 24h token usage per agent. When `spec.guardrails.limits.dailyTokens` is exceeded, replicas are scaled to 0 and a `BudgetExceeded` condition is set. Replicas restore automatically when the window rotates. See [Budget Management](/advanced/budget-management).

## Can agents call other agents?

Yes, via the `spec.agents[]` section. See [Agent-to-Agent](/concepts/agent-to-agent).

## What happens if an MCP server goes down?

The operator probes MCP servers every 60s. If unreachable, the `MCPDegraded` condition is set and (if configured) a SwarmNotify alert fires. The agent continues running - it just can't use tools from that server.

## How do I contribute?

See the [GitHub repo](https://github.com/kubeswarm/kubeswarm). Issues and discussions welcome.
