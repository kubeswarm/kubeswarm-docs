---
sidebar_position: 2
sidebar_label: "Loop Policy"
description: "kubeswarm loop policy for deep research agents - tool result sandboxing, semantic dedup, in-loop context compression and vector memory for long-running tasks on Kubernetes."
---

# Loop Policy

The kubeswarm loop policy enables runtime hooks inside the agent tool-use loop for long-running research tasks on Kubernetes. Tool result sandboxing, semantic dedup, context compression and vector memory - all opt-in and fail-open.

## Configuration

```yaml
spec:
  runtime:
    loop:
      dedup: true
      sandbox:
        thresholdBytes: 2048
        previewBytes: 200
        maxTotalBytes: 52428800
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

## Tool Result Sandboxing

When `sandbox` is set, tool results exceeding `thresholdBytes` are stored in a per-task in-memory sandbox and replaced with a compact digest. The LLM receives a summary like:

```
[sandboxed: result-3]
tool: github__search_code
size: 47,832 bytes (~11,958 tokens saved)
preview (truncated): {"total_count":142,"items":[{"name":"controller.go",...
Use sandbox_recall(id="result-3") to retrieve the full result.
```

The model can call the built-in `sandbox_recall` tool to retrieve the full result when needed. In practice, models often extract what they need from the preview alone - measured **53% token reduction** on 7KB tool results with identical output quality.

| Field            | Default    | Description                                              |
| ---------------- | ---------- | -------------------------------------------------------- |
| `thresholdBytes` | 2048       | Minimum result size (bytes) to trigger sandboxing        |
| `previewBytes`   | 200        | Bytes included in the digest preview (UTF-8 safe)        |
| `maxTotalBytes`  | 52428800   | Cap on total sandbox memory (50MB). Fail-open on exceed  |

Results under the threshold pass through unchanged. The sandbox is ephemeral - discarded when the task completes.

:::tip When to enable sandbox
Enable sandbox for agents that call tools returning large payloads (search results, database queries, API responses). For agents with small tool results (<2KB), sandboxing adds no value.
:::

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

Requires a [SwarmMemory](/intelligence/memory) with a vector backend and embedding model configured.

## Prerequisites

- Vector store running in-cluster (Qdrant, Pinecone, or Weaviate)
- Embedding API key (OpenAI, Google, or Voyage) available to agent pods
- SwarmMemory resource created with `backend: vector-store`
