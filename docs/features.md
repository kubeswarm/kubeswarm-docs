---
sidebar_position: 2
sidebar_label: "Features"
description: "kubeswarm features - semantic health checks, agent discovery, audit trail, autoscaling, multi-provider, vector memory, cost control, security and more."
---

# kubeswarm Features

Everything agents need to run in production on Kubernetes.

**No vendor lock-in.** Every integration point - LLM providers, task queues, vector stores, artifact storage - is a pluggable interface. Swap any backend without changing your agent definitions. Bring your own infrastructure.

**Security is not optional.** Non-root pods, read-only filesystems, dropped capabilities, network policies, tool allow/deny lists, and API keys in Kubernetes Secrets. All enforced by default, not bolted on after.

**Hard limits, not soft warnings.** SwarmBudget rejects tasks when the token budget is exhausted. Circuit breakers trip on consecutive failures. Cost control is a first-class primitive with real enforcement.

---

## Semantic Health Checks

Probes that ask the model, not just the container. The operator sends a prompt to the agent and evaluates the response - catching degraded models, broken tool connections, and prompt corruption that HTTP liveness probes miss.

```yaml
spec:
  observability:
    healthCheck:
      type: semantic
      intervalSeconds: 60
      prompt: "Reply OK if you are ready to accept tasks."
```

Falls back to `ping` mode for cost-sensitive deployments - a simple connectivity check with zero LLM calls.

- [Guardrails and Trust](/security/guardrails) - configure what happens when health checks fail
- [Notifications](/integrations/notifications) - alert on degraded agents via Slack, email, or webhook

---

## Agent-to-Agent Discovery

SwarmRegistry indexes agent capabilities automatically. Teams resolve the best available agent at runtime instead of hardcoding agent names.

```yaml
spec:
  capabilities:
    - name: sql-query
      description: "Writes and executes SQL queries"
      tags: [database, sql, analytics]
      exposeMCP: true
```

Any agent or team can discover and call `sql-query` without knowing which pod serves it. The registry tracks readiness, model, and daily token usage per agent.

- [Agent-to-Agent](/concepts/agent-to-agent) - how capability-based routing works
- [Custom Resources: SwarmRegistry](/custom-resources/) - registry field reference

---

## Audit Trail

Every SwarmRun records inputs, outputs, token counts, cost, and phase as an immutable execution record. The structured audit log adds causal chain tracing - follow a fan-out across agents and identify which subtask failed and why.

```bash
# All actions by an agent in the last hour
swarm audit --agent report-coordinator --since 1h

# Trace the causal chain for a specific event
swarm audit tree evt-abc123
```

Audit events emit to a configurable sink (stdout, Redis Stream, or webhook). Opt-in at cluster, namespace, or agent level.

- [Audit Trail](/observability/audit-trail) - full configuration guide, event schema, and CLI reference
- [Budget Management](/scaling/budget-management) - per-action token tracking and cost attribution
- [Custom Resources: SwarmRun](/custom-resources/) - run status field reference

---

## Autoscaling and Scale-to-Zero

KEDA-based queue-depth scaling. Agents scale with demand, not guesswork. When the task queue is empty, replicas drop to zero - no idle LLM pods burning compute.

```yaml
spec:
  runtime:
    autoscaling:
      minReplicas: 0
      maxReplicas: 20
      targetPendingTasks: 5
      scaleToZero:
        enabled: true
        afterSeconds: 300
```

The operator creates KEDA ScaledObjects automatically. No KEDA YAML to write - just set the fields on your SwarmAgent.

- [Autoscaling (KEDA)](/scaling/autoscaling) - full configuration guide and prerequisites

---

## Multi-Provider, Zero Lock-in

Anthropic, OpenAI, Ollama, Gemini - or any provider via the gRPC plugin interface. Swap providers by changing one field. No code changes, no redeployment logic.

```yaml
spec:
  model: claude-sonnet-4-6 # Anthropic
  # model: gpt-4o                   # OpenAI
  # model: qwen2.5:7b               # Ollama (local)
  # model: gemini-2.5-pro           # Google
```

Provider is inferred from the model name and API key. The agent runtime handles provider-specific API differences, streaming formats, and tool-use protocols.

The same principle applies at every layer: you provide your own Redis (or any queue via gRPC), your own vector store (pgvector, Qdrant), your own artifact storage (S3, GCS). The operator never bundles infrastructure - it connects to yours.

- [LLM Providers](/integrations/llm-providers) - supported providers, configuration, and model routing
- [Task Queue](/integrations/task-queue) - Redis Streams or custom queue via gRPC
- [Vector Stores](/integrations/vector-stores) - pgvector, Qdrant, or custom via gRPC
- [gRPC Plugins](/advanced/grpc-plugins) - escape hatch for any custom backend

---

## Vector Memory

Declarative Qdrant, Weaviate, or Pinecone memory. Agents learn across tasks without library code.

```yaml
spec:
  runtime:
    loop:
      memory:
        ref:
          name: team-memory
        retrieve: true
        store: true
        topK: 3
        minSimilarityPercent: 70
```

The agent runtime retrieves relevant prior findings before each tool call and stores summaries after. Memory persists across tasks and pod restarts.

- [Vector Stores](/integrations/vector-stores) - backend configuration for Qdrant, Pinecone, Weaviate
- [Custom Resources: SwarmMemory](/custom-resources/) - memory field reference

---

## Cost Control

SwarmBudget enforces token spend limits with hard-stop enforcement - runs are rejected before tokens are spent, not after.

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmBudget
metadata:
  name: team-budget
spec:
  selector:
    team: research-pipeline
  period: monthly
  limit: "500.00"
  warnAt: 80
  hardStop: true
  notifyRef:
    name: slack-alerts
```

Budget alerts fire via Slack, email, or webhook before you hit the wall. Per-action token tracking in the audit trail lets you identify which tools and agents drive cost.

- [Budget Management](/scaling/budget-management) - full configuration and enforcement modes
- [Custom Resources: SwarmBudget](/custom-resources/) - budget field reference

---

## Three Orchestration Modes

Pipeline, routed, or dynamic - all in one SwarmTeam resource.

**Pipeline (DAG)** - deterministic step chains with dependency resolution and per-step output validation:

```yaml
spec:
  pipeline:
    - role: researcher
    - role: fact-checker
      dependsOn: [researcher]
      validate:
        semantic: "Are the claims verified with sources?"
        rejectPatterns: ["(?i)ignore.*previous"]
    - role: writer
      dependsOn: [researcher, fact-checker]
```

**Routed** - an LLM picks the best agent for each request:

```yaml
spec:
  routing:
    model: claude-haiku-4-5-20251001
    systemPrompt: "Pick the best specialist for this request."
    fallback: generalist
```

**Dynamic** - agents delegate to each other at runtime using the built-in `delegate()` tool.

- [Orchestration](/concepts/orchestration) - how orchestration modes work
- [Custom Resources: SwarmTeam](/custom-resources/) - team field reference

---

## Parallel Fan-Out

Agents can spawn parallel subtasks and collect results in a single tool call. A coordinator splits work across worker replicas, waits for all results (with timeout), and synthesizes a response - all without pipeline YAML.

```yaml
# The coordinator agent gets spawn_and_collect as a built-in tool.
# No configuration needed - just enable delegation.
spec:
  roles:
    - name: coordinator
      model: claude-sonnet-4-6
      canDelegate: [researcher]
    - name: researcher
      model: claude-haiku-4-5-20251001
      runtime:
        autoscaling:
          minReplicas: 0
          maxReplicas: 10
          targetPendingTasks: 1
```

The coordinator calls `spawn_and_collect` mid-reasoning to fan out 5, 10, or 50 subtasks. KEDA scales researcher replicas to match. Results flow back and the coordinator continues its reasoning loop with all findings in context.

- [Cookbook: Parallel Fan-Out](/examples) - full working example with KEDA autoscaling

---

## Security - Defense in Depth

LLM agents have network access and tool use capabilities. kubeswarm treats this seriously. Every agent pod enforces security by default, not by configuration:

```yaml
spec:
  guardrails:
    tools:
      trust:
        default: external
      allow: ["github/*", "search/*"]
      deny: ["shell/*"]
    limits:
      tokensPerCall: 8000
      dailyTokens: 1000000
```

Every agent pod runs with `runAsNonRoot`, `readOnlyRootFilesystem`, and `capabilities: drop: ["ALL"]`. The admission webhook rejects agents that reference unauthenticated MCP servers when `requireMCPAuth` is enabled at the namespace level. API keys are always Kubernetes Secrets - never inlined in YAML.

- [Security Overview](/security/overview) - threat model and security architecture
- [Guardrails and Trust](/security/guardrails) - tool permissions and trust model
- [MCP Policy](/security/mcp-policy) - MCP server allowlists and auth enforcement
- [Network Policies](/security/network-policies) - agent pod network isolation

---

## Event Triggers

Cron schedules, webhooks, and chain triggers - all as CRDs. No external scheduler needed.

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmEvent
metadata:
  name: daily-report
spec:
  source:
    type: cron
    cron: "0 9 * * 1-5"
  targets:
    - team: report-pipeline
      prompt: "Generate the daily report."
  concurrencyPolicy: Forbid
```

- [Event Triggers](/advanced/event-triggers) - schedules, webhooks, and chained events

---

## Notifications

Slack, email, or webhook alerts on budget thresholds, agent degradation, team failures, and run completions. Rate-limited to avoid alert storms.

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmNotify
metadata:
  name: ops-alerts
spec:
  channel:
    type: slack
    slack:
      webhookUrlSecretRef:
        name: slack-secrets
        key: webhook-url
  events:
    - type: BudgetExceeded
    - type: AgentDegraded
    - type: TeamFailed
  rateLimiting:
    windowSeconds: 300
    maxPerWindow: 5
```

- [Notifications](/integrations/notifications) - channel configuration and event types

---

## Context Compression

Agents that run long tool-use loops accumulate context that can exceed the model's window. The runtime auto-summarizes older turns using a cheaper model, preserving recent context while keeping the agent running indefinitely.

```yaml
spec:
  runtime:
    loop:
      compression:
        thresholdPercent: 75
        preserveRecentTurns: 4
        model: claude-haiku-4-5-20251001
```

- [Loop Policy](/advanced/loop-policy) - compression, deduplication, and memory configuration

---

## Artifact Handoff

S3 and GCS artifacts flow between pipeline steps automatically. Agents write files to a local directory; the runtime uploads them to the configured store and injects download URLs into downstream steps.

```yaml
spec:
  artifactStore:
    type: s3
    s3:
      bucket: pipeline-artifacts
      prefix: runs/
      credentialsSecret:
        name: aws-creds
  pipeline:
    - role: researcher
      outputArtifacts:
        - name: report
          contentType: text/markdown
    - role: reviewer
      dependsOn: [researcher]
      inputArtifacts:
        report: "researcher.report"
```

- [Artifact Storage](/integrations/artifact-storage) - S3 and GCS configuration
