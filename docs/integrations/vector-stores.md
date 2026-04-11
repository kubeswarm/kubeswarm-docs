---
sidebar_position: 4
sidebar_label: "Vector Stores"
description: "kubeswarm vector store integrations - Qdrant, Pinecone, Weaviate for persistent agent memory on Kubernetes via SwarmMemory."
---

# kubeswarm Vector Stores - Qdrant, Pinecone, Weaviate

kubeswarm supports vector store backends for persistent agent memory on Kubernetes via the SwarmMemory CRD. Store and retrieve embeddings across tasks.

## Supported Backends

| Provider     | Endpoint format                 | Use case                       |
| ------------ | ------------------------------- | ------------------------------ |
| **Qdrant**   | `qdrant://host:6334/collection` | Self-hosted, Kubernetes-native |
| **Pinecone** | `pinecone://index-name`         | Managed cloud service          |
| **Weaviate** | `weaviate://host:8080/class`    | Self-hosted or cloud           |

## Configuration

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

| Provider      | Models                                         | Notes                     |
| ------------- | ---------------------------------------------- | ------------------------- |
| **OpenAI**    | text-embedding-3-small, text-embedding-3-large | Requires `OPENAI_API_KEY` |
| **Google**    | text-embedding-004                             | Requires `GOOGLE_API_KEY` |
| **Voyage AI** | voyage-3, voyage-3-lite                        | Requires `VOYAGE_API_KEY` |

## Usage with Loop Policy

Vector memory is used during the agent's tool-use loop via `spec.runtime.loop.memory`:

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

See [Loop Policy](/advanced/loop-policy) for the full deep-research runtime configuration.
