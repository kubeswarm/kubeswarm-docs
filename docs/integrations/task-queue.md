---
sidebar_position: 2
sidebar_label: "Task Queue"
description: "kubeswarm task queue integration - Redis Streams and custom gRPC queue backends for Kubernetes agent task dispatch."
---

# kubeswarm Task Queue - Redis Streams for Agent Task Dispatch

kubeswarm uses a task queue to dispatch work to agent pods on Kubernetes. Redis Streams is the default and recommended backend.

## Built-in: Redis Streams

Redis Streams is the default and recommended backend. You provide your own Redis instance via `taskQueueURL`.

```bash
helm install kubeswarm kubeswarm/kubeswarm \
  --set taskQueueURL=redis://my-redis.svc:6379
```

Each agent gets a dedicated Redis stream. Tasks are distributed across replicas using Redis consumer groups.

## Custom queue (gRPC plugin)

For environments that require NATS, SQS, or other backends, deploy a gRPC service implementing the `TaskQueue` proto contract:

```yaml
spec:
  plugins:
    queue:
      address: nats-adapter.svc:50052
```

When set, the agent ignores `TASK_QUEUE_URL` and routes all queue operations through the gRPC adapter.

See [gRPC Plugins](/advanced/grpc-plugins) for the full protocol spec.
