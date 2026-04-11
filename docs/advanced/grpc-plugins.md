---
sidebar_position: 4
sidebar_label: "gRPC Plugins"
description: "kubeswarm gRPC plugins - custom LLM providers and queue backends for agents on Kubernetes. AWS Bedrock, Azure OpenAI, NATS, SQS integration."
---

# kubeswarm gRPC Plugins - Custom LLM and Queue Backends

For custom LLM providers (AWS Bedrock, Azure OpenAI) or queue backends (NATS, SQS), deploy your own gRPC service and reference it from the kubeswarm SwarmAgent spec.

## Configuration

```yaml
spec:
  plugins:
    llm:
      address: bedrock-proxy.svc:50051
      tls:
        secretRef:
          name: plugin-tls # must contain tls.crt, tls.key, ca.crt
    queue:
      address: nats-adapter.svc:50052
```

When `plugins.llm` is set, the agent bypasses the built-in provider and routes all LLM calls to the gRPC endpoint. When `plugins.queue` is set, `TASK_QUEUE_URL` is ignored.

## Protocol

The plugin contract is defined in `proto/pluginv1/`:

- **LLMProvider** - bidirectional streaming RPC for the full tool-use loop (init, chunks, tool calls, tool results, final result)
- **TaskQueue** - unary RPCs for submit, poll, ack, nack, results, cancel

Any language with gRPC codegen can implement a plugin. The proto file is published with each kubeswarm release.

## Precedence

For LLM provider resolution:

1. `spec.plugins.llm.address` - highest priority
2. Built-in provider auto-detected from `spec.model` - default

Built-in providers: Anthropic (`claude-*`), OpenAI (`gpt-*/o*`), Gemini (`gemini-*`)

## No Sidecar Required

The gRPC service runs as a standalone Deployment, not a sidecar. kubeswarm passes the address as an environment variable to agent pods. You manage the lifecycle of the plugin service independently.
