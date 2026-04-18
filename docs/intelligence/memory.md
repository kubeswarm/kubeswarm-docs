---
sidebar_position: 3
sidebar_label: "Vector Stores"
description: "kubeswarm vector store integrations - pgvector and Qdrant for persistent agent memory on Kubernetes via SwarmMemory."
---

# Vector Stores

kubeswarm supports vector store backends for persistent agent memory on Kubernetes via the SwarmMemory CRD. Store and retrieve embeddings across tasks.

## Supported Backends

| Provider      | Endpoint format                                          | Use case                       |
| ------------- | -------------------------------------------------------- | ------------------------------ |
| **pgvector**  | `postgres://host:5432/dbname?sslmode=disable&table=name` | PostgreSQL with vector extension - battle-tested, runs anywhere |
| **Qdrant**    | `qdrant://host:6334/collection`                          | Purpose-built vector database, Kubernetes-native |

Backends self-register via URL scheme. The agent runtime resolves the correct implementation from the `AGENT_VECTOR_STORE_URL` environment variable injected by the operator.

### pgvector (PostgreSQL)

Uses the pgx driver. Automatically creates the target table and an HNSW index on first upsert. Payloads are stored as JSONB.

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmMemory
metadata:
  name: agent-memory
spec:
  backend: vector-store
  vectorStore:
    provider: pgvector
    endpoint: postgres://pgvector.default.svc.cluster.local:5432/vectors?sslmode=disable&table=research_findings
  embedding:
    model: text-embedding-3-small
    provider: openai
    dimensions: 512
```

### Qdrant

Uses the Qdrant REST API (port 6333). Collections are created lazily on first upsert with cosine distance.

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmMemory
metadata:
  name: agent-memory
spec:
  backend: vector-store
  vectorStore:
    provider: qdrant
    endpoint: qdrant.default.svc.cluster.local:6334
    collection: research-findings
    ttlSeconds: 0 # 0 = no expiry
  embedding:
    model: text-embedding-3-small
    provider: openai
    dimensions: 512
```

## Embedding Providers

| Provider   | Models                                         | Notes                                                    |
| ---------- | ---------------------------------------------- | -------------------------------------------------------- |
| **OpenAI** | text-embedding-3-small, text-embedding-3-large | Requires `OPENAI_API_KEY`. Respects `OPENAI_BASE_URL` for Ollama compatibility. |

The embedding model can be overridden per-agent via the `AGENT_EMBEDDING_MODEL` environment variable.

## Usage with Loop Policy

Vector memory is used during the agent's tool-use loop via `spec.runtime.loop.memory`. The loop memory hook embeds tool inputs before each call to retrieve similar prior findings, and optionally stores a summary of the result after each call.

```yaml
spec:
  runtime:
    loop:
      memory:
        ref:
          name: agent-memory # SwarmMemory reference
        store: true # write summaries after tool calls
        retrieve: true # fetch similar findings before tool calls
        topK: 5
        minSimilarityPercent: 70
```

See [Loop Policy](/intelligence/loop-policy) for the full deep-research runtime configuration.
