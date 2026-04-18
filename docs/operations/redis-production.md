---
sidebar_position: 5
sidebar_label: "Redis in Production"
description: "Production Redis deployment for kubeswarm - role separation, capacity planning, failover behavior, and migration runbook."
---

# Redis in Production

kubeswarm uses Redis for four distinct workloads. In development the bundled single-node Redis handles all of them. In production you should understand what each role demands so you can right-size, isolate, and monitor accordingly.

This guide is written for the operator who gets paged at 3am. Skim the role table, jump to the topology that matches your scale, and use the capacity formulas to size your instances.

---

## Redis roles

kubeswarm assigns each Redis connection a **role**. Each role has different data structures, access patterns, and failure impact.

| Role | Data structure | Access pattern | Failure impact |
|---|---|---|---|
| **Queue** | Streams + consumer groups | High-frequency read/write, blocking XREADGROUP | **Critical** - agents cannot pick up tasks. Runs stall immediately. |
| **Stream** | Lists (LPUSH / BRPOP) | Latency-sensitive pub/sub for real-time streaming | Agent streaming stops; tasks still complete but callers see no incremental output. |
| **Spend** | Sorted sets + INCRBY | Write-heavy counters, periodic ZRANGEBYSCORE reads | Budget enforcement degrades. See [Budget Enforcement During Outages](#budget-enforcement-during-outages) below. |
| **Audit** | Streams (XADD) | Append-heavy, read via XRANGE/XREVRANGE | Audit events buffer in-memory then drop. No impact on agent execution. |

---

## Helm configuration

Each role resolves its Redis URL through a fallback chain. You only need to set the values that differ from your default.

| Role | Helm value | Env var | Fallback |
|---|---|---|---|
| Queue | `taskQueueURL` | `TASK_QUEUE_URL` | Bundled Redis |
| Stream | `streamChannelURL` | `STREAM_CHANNEL_URL` | `taskQueueURL` - bundled Redis |
| Spend | `spendStoreURL` | `SPEND_STORE_URL` | `taskQueueURL` - bundled Redis |
| Audit | `auditLog.redisURL` | `AUDIT_LOG_REDIS_URL` | None (required when `sink=redis`) |

### Minimal production override

Point everything at one external Redis, with audit on a separate instance:

```yaml
taskQueueURL: redis://redis-primary.infra:6379/0
auditLog:
  mode: actions
  sink: redis
  redisURL: redis://redis-audit.monitoring:6379/0
```

Stream and Spend inherit from `taskQueueURL` automatically.

### Full split

```yaml
taskQueueURL: redis://redis-queue.infra:6379/0
streamChannelURL: redis://redis-stream.infra:6379/0
spendStoreURL: redis://redis-spend.infra:6379/0
auditLog:
  mode: actions
  sink: redis
  redisURL: redis://redis-audit.monitoring:6379/0
```

---

## Production topologies

### Small (fewer than 10 agents)

A single external Redis instance handles Queue + Stream + Spend. Audit goes to a second instance (or use the stdout sink).

```
┌─────────────────────────┐     ┌──────────────┐
│  Redis Primary          │     │  Redis Audit  │
│  Queue + Stream + Spend │     │  Audit only   │
│  2 GB, 1 vCPU           │     │  1 GB, 1 vCPU │
└─────────────────────────┘     └──────────────┘
```

**Why separate Audit?** Audit streams grow continuously and use XTRIM for retention. Mixing audit XADD with task queue XREADGROUP can cause latency spikes under verbose mode.

### Medium (10-50 agents)

Split Queue onto its own instance. Stream and Spend share a second instance. Audit stays isolated.

```
┌──────────────┐  ┌─────────────────────┐  ┌──────────────┐
│  Redis Queue │  │  Redis Shared       │  │  Redis Audit │
│  Queue only  │  │  Stream + Spend     │  │  Audit only  │
│  4 GB, 2 vCPU│  │  2 GB, 1 vCPU       │  │  2 GB, 1 vCPU│
└──────────────┘  └─────────────────────┘  └──────────────┘
```

### Large (50+ agents)

Each role gets its own instance. Queue and Stream benefit from Redis Cluster or Sentinel for HA.

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Redis Queue │  │ Redis Stream │  │  Redis Spend │  │  Redis Audit │
│  Sentinel/HA │  │  Sentinel/HA │  │  Standalone  │  │  Standalone  │
│  8 GB, 4 vCPU│  │  4 GB, 2 vCPU│  │  2 GB, 1 vCPU│  │  4 GB, 2 vCPU│
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```

---

## Capacity estimation

### Queue (Streams)

Each task generates approximately 2 KB of stream data (task payload + metadata + consumer group state).

```
queue_memory_mb = concurrent_tasks * 2 KB * pending_multiplier / 1024
```

- `pending_multiplier`: how many tasks sit in PEL before ACK. Typically 2-5x concurrent agents.
- Example: 20 agents, multiplier 3 = 20 * 2 KB * 3 = 120 KB. Queue memory is rarely the bottleneck.

### Spend (Sorted sets)

Each agent-budget pair consumes roughly 200 bytes per tracking window entry.

```
spend_memory_mb = agents * budgets_per_agent * window_entries * 200 B / (1024 * 1024)
```

- Example: 50 agents, 2 budgets each, 720 hourly entries (30 days) = 50 * 2 * 720 * 200 = ~14 MB.

### Audit (Streams)

Audit is the biggest consumer. Size depends on mode.

```
audit_memory_mb = events_per_hour * avg_event_bytes * retention_hours / (1024 * 1024)
```

**Events per hour by mode:**

| Mode | Events per task (typical) | Notes |
|---|---|---|
| `actions` | 3-8 | task.received + tool calls + task.completed |
| `verbose` | 15-40 | Adds full LLM conversation turns |

**Worked example - actions mode:**

- 50 agents, 10 tasks/hour each = 500 tasks/hour
- 5 events per task, 1.5 KB average = 500 * 5 * 1.5 KB = 3.75 MB/hour
- 168h retention (7 days) = 630 MB
- Add 30% headroom = ~820 MB

**Worked example - verbose mode (incident investigation):**

- Same 50 agents but verbose enabled on 5 agents only
- 5 agents * 10 tasks/hour * 25 events * 4 KB = 5 MB/hour for verbose agents
- 45 agents * 10 tasks/hour * 5 events * 1.5 KB = 3.375 MB/hour for actions agents
- Total: ~8.4 MB/hour * 168h = ~1.4 GB + 30% = ~1.8 GB

Use `maxDetailBytes` (default 8192) to cap individual event size. Lowering this to 2048 cuts verbose audit storage by roughly 50%.

---

## Bundled Redis

The Helm chart includes a single-node Redis for development and testing. It is **not suitable for production**.

```yaml
# Default - bundled Redis enabled
redis:
  enabled: true
  resources:
    limits:
      memory: 256Mi
      cpu: 250m
```

Limitations:

- No persistence (data lost on pod restart)
- No replication or failover
- Single-threaded, shared across all roles
- 200 MB maxmemory with noeviction policy - rejects writes when full

To disable the bundled Redis and use external instances:

```yaml
redis:
  enabled: false
taskQueueURL: redis://your-redis.infra:6379/0
```

---

## Credentials and TLS

### Kubernetes Secrets

Store Redis URLs in a Kubernetes Secret and inject them via `extraEnvFrom` in your Helm values. The Secret keys must match the env var names the operator reads:

```yaml
extraEnvFrom:
  - secretRef:
      name: kubeswarm-redis
```

The operator reads `TASK_QUEUE_URL`, `SPEND_STORE_URL`, and `AUDIT_LOG_REDIS_URL` from the environment, so name your Secret keys accordingly:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: kubeswarm-redis
  namespace: kubeswarm-system
type: Opaque
stringData:
  TASK_QUEUE_URL: "redis://:s3cret@redis-queue.infra:6379/0"
  SPEND_STORE_URL: "redis://:s3cret@redis-spend.infra:6379/0"
  AUDIT_LOG_REDIS_URL: "redis://:s3cret@redis-audit.monitoring:6379/0"
```

### TLS

Use the `rediss://` scheme (double s) to enable TLS:

```
rediss://:password@redis.infra:6380/0
```

The Go Redis client verifies the server certificate against the system CA bundle. To use a custom CA, mount it as a volume and set `SSL_CERT_FILE`:

```yaml
agent:
  extraEnv:
    - name: SSL_CERT_FILE
      value: /etc/ssl/custom/ca.crt
  extraVolumeMounts:
    - name: redis-ca
      mountPath: /etc/ssl/custom
      readOnly: true
  extraVolumes:
    - name: redis-ca
      secret:
        secretName: redis-ca-cert
```

---

## Health checks

The operator and agent-runner expose Redis connectivity on sub-paths of `/readyz`.

| Sub-path | Role | Fails when |
|---|---|---|
| `/readyz/queue` | Queue | Cannot PING the queue Redis |
| `/readyz/stream` | Stream | Cannot PING the stream Redis |
| `/readyz/spend` | Spend | Cannot PING the spend Redis |
| `/readyz/audit` | Audit | Cannot PING the audit Redis (only when `sink=redis`) |

All sub-paths return `200 OK` with `{"status":"ok"}` or `503 Service Unavailable` with `{"status":"failed","error":"..."}`.

The main `/readyz` endpoint aggregates all enabled sub-paths. Configure your Kubernetes readiness probe:

```yaml
readinessProbe:
  httpGet:
    path: /readyz
    port: 8081
  periodSeconds: 10
  failureThreshold: 3
```

For targeted alerting, probe individual sub-paths from your monitoring stack.

---

## Budget enforcement during outages

When the Spend Redis is unreachable, `SwarmBudget` enforcement enters a degraded mode. Behavior depends on the `hardStop` setting.

### hardStop: true (fail-closed)

Tasks are **rejected** when spend data is unavailable. This is the safe default for cost-sensitive workloads.

- Agent receives task from queue
- Budget check attempts to read spend counters from Redis
- Redis unreachable - budget controller returns `denied`
- Task is NACKed back to the queue with a retry delay
- Audit event: `budget.checked` with `status: error` and `error.code: spend_unavailable`

### hardStop: false (fail-open)

Tasks **proceed without budget enforcement**. Use this when availability matters more than cost control.

- Agent receives task from queue
- Budget check attempts to read spend counters from Redis
- Redis unreachable - budget controller returns `allowed` with a warning
- Task executes normally
- Audit event: `budget.checked` with `status: success` and `detail.degraded: true`

### Overspend estimation

When Spend Redis recovers after an outage with `hardStop: false`, the actual spend may exceed the budget. Estimate the overspend with:

```
overspend_tokens = avg_tokens_per_task * tasks_per_minute * outage_minutes * agents
```

Example: 2000 tokens/task, 5 tasks/min, 10-minute outage, 20 agents = 2,000,000 tokens overspend.

Monitor the `kubeswarm_budget_degraded_total` counter and alert on any non-zero value.

---

## Migration runbook: single Redis to split topology

Follow these steps to move from a single shared Redis to role-separated instances with zero downtime.

### Prerequisites

- New Redis instances provisioned and reachable from the cluster
- Helm values file ready with new URLs
- Current deployment healthy (check `/readyz`)

### Steps

**1. Add Stream and Spend URLs (no disruption)**

```bash
helm upgrade kubeswarm kubeswarm/kubeswarm \
  --set taskQueueURL=redis://redis-old.infra:6379/0 \
  --set streamChannelURL=redis://redis-stream-new.infra:6379/0 \
  --set spendStoreURL=redis://redis-spend-new.infra:6379/0
```

Stream and Spend are stateless from a task-continuity perspective - new connections pick up immediately. In-flight streaming responses on the old Redis drain naturally.

**2. Verify health**

```bash
kubectl get pods -n kubeswarm-system -l app=kubeswarm-controller -o wide
# Check logs for successful Redis connection messages

# Probe individual readiness sub-paths
kubectl exec deploy/kubeswarm-controller -n kubeswarm-system -- \
  wget -qO- http://localhost:8081/readyz/stream
kubectl exec deploy/kubeswarm-controller -n kubeswarm-system -- \
  wget -qO- http://localhost:8081/readyz/spend
```

**3. Migrate Queue (brief pause possible)**

This is the critical step. Tasks in the old queue must drain before switching.

```bash
# Scale down agent pods to stop consuming
kubectl scale deploy -n kubeswarm-system -l role=agent --replicas=0

# Wait for pending tasks to clear (check old Redis)
redis-cli -u redis://redis-old.infra:6379/0 XINFO GROUPS kubeswarm:tasks:default

# Update queue URL
helm upgrade kubeswarm kubeswarm/kubeswarm \
  --set taskQueueURL=redis://redis-queue-new.infra:6379/0 \
  --set streamChannelURL=redis://redis-stream-new.infra:6379/0 \
  --set spendStoreURL=redis://redis-spend-new.infra:6379/0

# Scale agents back up
kubectl scale deploy -n kubeswarm-system -l role=agent --replicas=<original>
```

**4. Add Audit Redis (if using Redis sink)**

```bash
helm upgrade kubeswarm kubeswarm/kubeswarm \
  --set auditLog.redisURL=redis://redis-audit-new.monitoring:6379/0 \
  # ... keep other values
```

Audit switches immediately. Historical audit data stays on the old instance until retention expires or you manually migrate with `redis-cli DUMP`/`RESTORE`.

**5. Decommission old Redis**

Once all roles are migrated and verified:

- Monitor for 24 hours
- Check no connections remain on the old instance
- Remove old Redis deployment

---

## Summary checklist

- [ ] Audit Redis is always separate from Queue Redis
- [ ] `hardStop` is set explicitly on every SwarmBudget
- [ ] Redis URLs are stored in Kubernetes Secrets, not plain Helm values
- [ ] TLS (`rediss://`) is enabled for any cross-network Redis connection
- [ ] `/readyz` sub-paths are monitored per role
- [ ] Capacity is estimated using the formulas above, with 30% headroom
- [ ] `taskQueueURL` points to a managed Redis instance (not localhost)
