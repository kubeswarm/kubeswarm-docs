---
sidebar_position: 2
sidebar_label: "Autoscaling (KEDA)"
description: "kubeswarm KEDA autoscaling - scale agent pods on Kubernetes based on pending task queue depth. Configure min/max replicas and scale-to-zero."
---

# kubeswarm Autoscaling - KEDA-Based Agent Autoscaling on Kubernetes

kubeswarm scales agent pods on Kubernetes based on pending task queue depth using KEDA. Configure min/max replicas, target pending tasks and scale-to-zero.

## Prerequisites

Install KEDA v2 in your cluster:

```bash
helm repo add kedacore https://kedacore.github.io/charts
helm install keda kedacore/keda --namespace keda --create-namespace
```

The kubeswarm operator detects KEDA at runtime. No Helm changes needed.

## Configuration

```yaml
spec:
  runtime:
    autoscaling:
      minReplicas: 1 # idle floor
      maxReplicas: 10 # scale ceiling
      targetPendingTasks: 5 # tasks per replica before scale-up
```

When `autoscaling` is set, `runtime.replicas` is ignored.

## How it works

1. The operator creates a KEDA `ScaledObject` targeting the agent's Deployment
2. KEDA monitors the Redis Stream length (pending tasks)
3. When pending tasks exceed `targetPendingTasks * currentReplicas`, KEDA scales up
4. When the queue drains, KEDA scales down to `minReplicas`

## Scale to zero

Set `minReplicas: 0` to allow the agent to scale to zero when idle:

```yaml
spec:
  runtime:
    autoscaling:
      minReplicas: 0
      maxReplicas: 5
      targetPendingTasks: 3
```

The first task in the queue triggers scale-up from 0. There is a cold-start delay while the pod starts.

## Without KEDA

If KEDA is not installed, use fixed replicas:

```yaml
spec:
  runtime:
    replicas: 3
```

The operator gracefully skips ScaledObject creation when KEDA CRDs are not present.
