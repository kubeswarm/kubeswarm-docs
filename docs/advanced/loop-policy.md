---
sidebar_position: 1
sidebar_label: "Loop Policy"
description: "kubeswarm loop policy for deep research agents - semantic dedup, in-loop context compression and vector memory for long-running tasks on Kubernetes."
---

# kubeswarm Loop Policy - Deep Research Agents on Kubernetes

The kubeswarm loop policy enables runtime hooks inside the agent tool-use loop for long-running research tasks on Kubernetes. Semantic dedup, context compression and vector memory - all opt-in and fail-open.

## Configuration

```yaml
spec:
  runtime:
    loop:
      dedup: true
      compression:
        thresholdPercent: 75
        preserveRecentTurns: 4
        model: claude-haiku-4-5-20251001
        timeoutSeconds: 30
        contextWindow: 128000
        instructions: "Summarize tool results concisely. Preserve key findings and URLs."
      memory:
        ref:
          name: agent-memory
        store: true
        retrieve: true
        topK: 5
        minSimilarityPercent: 70
        summaryTokens: 256
        maxTokens: 1024
```

## Semantic Dedup

When `dedup: true`, the runner skips tool calls whose fingerprint (tool name + args hash) was already executed in the current task. The dedup set is task-local and discarded on completion.

## In-loop Compression

When accumulated tool-result tokens exceed `threshold` fraction of the context window, the runner calls a cheap model to summarize older turns.

| Field                 | Default                   | Description                                          |
| --------------------- | ------------------------- | ---------------------------------------------------- |
| `threshold`           | 0.75                      | Fraction of context window that triggers compression |
| `preserveRecentTurns` | 4                         | Most recent turns kept verbatim                      |
| `model`               | claude-haiku-4-5-20251001 | Model for the compression call                       |
| `timeoutSeconds`      | 30                        | Max time for compression call                        |
| `contextWindow`       | (auto)                    | Override model's context window size                 |
| `instructions`        | (built-in)                | Custom compression prompt                            |

If compression fails or times out, the task continues without compression (fail-open).

## Vector Memory

Reads prior findings from and writes new findings to a vector store during the loop.

**Retrieve** (before each tool call): fetches top-K similar prior findings and injects them as a `<swarm:prior-findings>` block.

**Store** (after each tool call): generates a summary of the tool result and stores it as a vector embedding.

Requires a [SwarmMemory](/integrations/vector-stores) with a vector backend and embedding model configured.

## Prerequisites

- Vector store running in-cluster (Qdrant, Pinecone, or Weaviate)
- Embedding API key (OpenAI, Google, or Voyage) available to agent pods
- SwarmMemory resource created with `backend: vector-store`
