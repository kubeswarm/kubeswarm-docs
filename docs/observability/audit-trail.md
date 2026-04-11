---
sidebar_position: 2
sidebar_label: "Audit Trail"
description: "kubeswarm audit trail - structured action log for agent behavior reconstruction, failure tracing, cost attribution, and compliance on Kubernetes."
---

# Audit Trail

A structured, append-only action log that records what every agent does - tool calls, delegations, task lifecycle events, guardrail decisions, and budget checks - with enough context to reconstruct execution paths, attribute costs, and satisfy compliance requirements.

The audit trail is **off by default** and configurable at three levels: cluster (Helm), namespace (SwarmSettings), and agent (SwarmAgent).

## What this is and is not

**The audit trail is:**

- A chronological record of agent decisions and their outcomes
- Queryable via the `swarm audit` CLI (when using the Redis sink)
- Filterable by agent, team, run, action type, and status
- A causal chain - every event links to the event that caused it

**The audit trail is not:**

- A replacement for OTel traces (use traces for latency analysis and distributed tracing)
- A full conversation replay system (storing every LLM token is too expensive by default)
- A metrics system (SwarmBudget and OTel handle aggregate metrics)
- A log aggregation system (you bring your own Loki/ELK/Datadog)

---

## Quick start

Enable audit logging cluster-wide with a single Helm value:

```bash
helm upgrade kubeswarm kubeswarm/kubeswarm \
  --set auditLog.mode=actions
```

This emits structured JSON events to stdout on every agent pod. Your existing log pipeline (Fluentd, Filebeat, etc.) picks them up with zero additional infrastructure.

To use the `swarm audit` CLI for querying, switch to the Redis sink:

```bash
helm upgrade kubeswarm kubeswarm/kubeswarm \
  --set auditLog.mode=actions \
  --set auditLog.sink=redis \
  --set auditLog.redisURL=redis://audit-redis.monitoring:6379
```

---

## Configuration

Audit logging is configured at three levels. Each level can set the audit mode and redaction rules. More specific levels override less specific ones.

### Cluster level (Helm values)

```yaml
auditLog:
  mode: "off"            # off | actions | verbose
  sink: stdout           # stdout | redis | webhook
  webhookURL: ""         # required when sink=webhook
  redisURL: ""           # required when sink=redis; use a separate instance
  retention: 168h        # redis sink only; Go duration format
  maxDetailBytes: 8192   # max size for detail.input / detail.output; 0 = unlimited
  redact:                # glob patterns on JSON field paths
    - "detail.input.*.apiKey"
    - "detail.input.*.password"
    - "detail.input.*.token"
  excludeActions: []     # action types to skip (e.g., memory.retrieved)
```

### Namespace level (SwarmSettings)

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmSettings
metadata:
  name: audit-config
  namespace: production
spec:
  observability:
    auditLog:
      mode: actions
      redact:
        - "detail.input.*.ssn"
```

The `spec.observability.auditLog` section accepts a `mode` field (enum: `off`, `actions`, `verbose`) and a `redact` list (max 20 patterns per level).

### Agent level (SwarmAgent)

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: report-coordinator
  namespace: production
spec:
  settings:
    - audit-config
  observability:
    auditLog:
      mode: verbose    # override for this specific agent
      redact:
        - "detail.input.*.creditCard"
```

The `spec.observability.auditLog` field on SwarmAgent has the same shape as on SwarmSettings: a `mode` (type `AuditLogMode`, enum `off`/`actions`/`verbose`) and a `redact` list (max 20 patterns).

### Mode values

| Mode | Description |
|---|---|
| `off` | No audit events emitted. Default at all levels. |
| `actions` | Structured action events: tool calls, delegations, lifecycle, budget. |
| `verbose` | Action events plus full LLM conversation turns. Expensive - use for incident investigation only. |

---

## Precedence rules

Most specific wins: `agent > namespace (SwarmSettings) > cluster (Helm)`.

When a level is unset, it inherits from the next less-specific level. An explicit value at any level always overrides inherited values.

| Cluster | Namespace | Agent | Effective |
|---|---|---|---|
| off | (unset) | (unset) | off |
| off | actions | (unset) | actions |
| off | (unset) | actions | actions |
| actions | off | (unset) | off |
| actions | (unset) | off | off |
| actions | verbose | (unset) | verbose |
| verbose | actions | (unset) | actions |
| off | actions | verbose | verbose |

Redaction rules **merge** across all levels. If the cluster defines `detail.input.*.apiKey` and the agent adds `detail.input.*.creditCard`, both patterns apply.

---

## Event schema

Every audit event is a structured JSON object with a fixed schema:

```json
{
  "schemaVersion": "v1",
  "eventId": "evt-abc123",
  "timestamp": "2026-04-04T17:48:15.123Z",
  "action": "tool.called",
  "status": "success",

  "namespace": "default",
  "agent": "report-coordinator",
  "team": "competitor-analysis",
  "runId": "fanout-test-4",
  "taskId": "1775324895139-0",

  "parentEventId": "evt-prev-001",
  "trigger": "dependency_resolved",

  "model": "qwen2.5:7b",
  "provider": "openai",

  "tokens": {
    "input": 1269,
    "output": 150
  },

  "detail": {
    "tool": "spawn_and_collect",
    "input": {
      "tasks": [
        {"prompt": "Research competitor: LangGraph"},
        {"prompt": "Research competitor: CrewAI"}
      ]
    },
    "output": {
      "completed": 2,
      "pending": 0
    },
    "childTaskIds": ["1775324895139-1", "1775324895139-2"],
    "durationMs": 4200
  },

  "timing": {
    "queueMs": 120,
    "executionMs": 3800,
    "downstreamWaitMs": 280
  },

  "env": {
    "service": "agent-runner",
    "version": "0.1.0",
    "podName": "report-coordinator-agent-5785f45d9b-wdfhm"
  }
}
```

### Field reference

| Field | Type | Required | Description |
|---|---|---|---|
| `schemaVersion` | string | yes | Schema version (always `"v1"` for now) |
| `eventId` | string | yes | Unique event identifier (ULID or UUID) |
| `timestamp` | string | yes | ISO 8601 with milliseconds |
| `action` | string | yes | Action type (see action types table below) |
| `status` | string | yes | `success`, `error`, `timeout`, or `denied` |
| `namespace` | string | yes | Kubernetes namespace |
| `agent` | string | yes | SwarmAgent name |
| `team` | string | no | SwarmTeam name (empty for standalone agents) |
| `runId` | string | no | SwarmRun name |
| `taskId` | string | no | Redis task ID |
| `parentEventId` | string | no | Event that caused this one (forms a causal tree) |
| `trigger` | string | no | `user_request`, `schedule`, `delegation`, `retry`, `dependency_resolved` |
| `model` | string | no | LLM model used (only on LLM-touching actions) |
| `provider` | string | no | Provider name (anthropic, openai, gemini) |
| `tokens.input` | int | no | Input tokens consumed |
| `tokens.output` | int | no | Output tokens consumed |
| `detail` | object | yes | Action-specific payload. `input` and `output` are truncated at `maxDetailBytes` (default 8192) |
| `detail.truncated` | bool | no | `true` when `input` or `output` was truncated |
| `timing.queueMs` | int | no | Time spent waiting in queue |
| `timing.executionMs` | int | no | Time spent executing |
| `timing.downstreamWaitMs` | int | no | Time waiting for downstream (subtasks, tool responses) |
| `error` | object | no | Present only on `error`, `timeout`, or `denied` status |
| `error.message` | string | no | Error description |
| `error.code` | string | no | Error code or HTTP status |
| `error.retryable` | bool | no | Whether this error will be retried |
| `env.service` | string | yes | `agent-runner` or `operator` |
| `env.version` | string | yes | Binary version |
| `env.podName` | string | yes | Pod name for correlation with k8s logs |

---

## Action types

| Action | Emitted by | Description |
|---|---|---|
| `task.received` | runner | Agent picked up a task from queue |
| `task.completed` | runner | Task finished successfully (includes total tokens) |
| `task.failed` | runner | Task reached dead-letter queue |
| `task.retried` | runner | Task requeued after transient failure |
| `tool.called` | runner | Tool invocation (MCP, webhook, or built-in) |
| `tool.denied` | runner | Guardrail blocked a tool call |
| `delegate.sent` | runner | Task delegated to another role |
| `delegate.received` | runner | Delegated task picked up by target agent |
| `budget.checked` | operator | Budget evaluated before/during run |
| `budget.exceeded` | operator | Execution blocked by budget policy |
| `run.triggered` | operator | SwarmRun created (by event, CLI, or manual) |
| `run.step.started` | operator | Pipeline step submitted to queue |
| `run.step.completed` | operator | Pipeline step result collected |
| `run.succeeded` | operator | All steps completed |
| `run.failed` | operator | Run failed or timed out |
| `guardrail.evaluated` | runner | Trust/allow/deny rule checked |
| `memory.retrieved` | runner | Vector memory lookup |
| `memory.stored` | runner | Vector memory write |

To exclude noisy action types, use the `excludeActions` Helm value:

```yaml
auditLog:
  excludeActions:
    - "memory.retrieved"
    - "memory.stored"
```

---

## Sink implementations

All sinks share a non-blocking guarantee: audit emission never blocks agent execution. Events are buffered in-memory (default 1024 events). When the buffer is full, the oldest events are dropped. Dropped events increment the OTel counter `kubeswarm.audit.events.dropped{sink,reason}`.

On pod shutdown (SIGTERM), the emitter flushes buffered events with a 5-second deadline, then drops any remaining and logs the count.

### Stdout

The simplest option. One JSON line per event to the agent pod's stdout.

```yaml
auditLog:
  mode: actions
  sink: stdout
```

- Zero additional infrastructure
- Picked up by your existing log pipeline (Fluentd, Filebeat, Loki, etc.)
- No built-in query support - use your log backend's search
- The `swarm audit` CLI does not work with the stdout sink

### Redis Stream

Recommended when you want the `swarm audit` CLI or dashboard timeline.

```yaml
auditLog:
  mode: actions
  sink: redis
  redisURL: redis://audit-redis.monitoring:6379
  retention: 168h
```

Operational details:

- Stream key per namespace: `kubeswarm:audit:<namespace>`
- Entries use Redis Stream auto-generated IDs (time-ordered)
- Write timeout: 100ms per XADD; on timeout, the event goes back to the buffer (or is dropped if full)
- Circuit breaker: after 5 consecutive write failures, stops attempting for 30 seconds, then probes with a single write. Emits `kubeswarm.audit.circuit_breaker{state=open|closed}`
- Safety cap: `MAXLEN ~100000` on every XADD to prevent unbounded growth
- Retention: operator controller loop (leader-election-gated) runs XTRIM MINID every 60 seconds. Emits `kubeswarm.audit.trim.lag_seconds` gauge
- Use a separate Redis instance from your task queue to avoid contention (see your Redis capacity planning)

### Webhook

Forward audit events to an external endpoint (SIEM, S3 proxy, custom backend).

```yaml
auditLog:
  mode: actions
  sink: webhook
  webhookURL: https://audit.example.com/ingest
```

Operational details:

- POST JSON array of events to the configured URL
- Batching: up to 100 events or 5 seconds, whichever comes first
- Retry: max 3 attempts with exponential backoff (1s, 5s, 30s)
- Drops on 4xx responses (except 429). On 429: respects `Retry-After` header up to 60s
- Buffer cap: max 1000 events in-memory; oldest-first eviction when full
- Best-effort: audit failures never block agent execution

---

## Redaction

Redaction patterns use single-level glob matching on dot-separated JSON field paths, implemented via Go's `path.Match`.

### Syntax

- `*` matches exactly one path segment (not recursive)
- Patterns are evaluated against flattened dot-paths of the `detail` object
- When a pattern matches, the field value is replaced with `"[REDACTED]"`
- Redaction is applied before serialization to the sink - redacted values never leave the process

### Examples

| Pattern | Matches | Does not match |
|---|---|---|
| `detail.input.*.apiKey` | `detail.input.auth.apiKey`, `detail.input.config.apiKey` | `detail.input.nested.auth.apiKey` (two levels deep) |
| `detail.input.*.password` | `detail.input.db.password` | `detail.output.db.password` (wrong prefix) |
| `detail.output.*` | All direct children of `detail.output` | `detail.output.nested.field` |
| `detail.*.*.token` | `detail.input.auth.token`, `detail.output.config.token` | `detail.input.token` (only one level between) |

### Configuring redaction

Redaction can be set at any configuration level. Rules merge across levels - all patterns from cluster, namespace, and agent config are applied together.

```yaml
# Helm values (cluster-wide defaults)
auditLog:
  redact:
    - "detail.input.*.apiKey"
    - "detail.input.*.password"
    - "detail.input.*.token"
```

```yaml
# SwarmSettings (namespace-level additions)
spec:
  observability:
    auditLog:
      redact:
        - "detail.input.*.ssn"
        - "detail.input.*.creditCard"
```

CEL validation on the CRD: patterns must be non-empty strings, max 20 patterns per config level, each pattern must contain at least one dot separator.

---

## CLI query interface

The `swarm audit` commands read from the Redis Stream sink. They are not available when using the stdout or webhook sinks.

```bash
# All actions by an agent in the last hour
swarm audit --agent report-coordinator --since 1h

# Filter by action type
swarm audit --agent report-coordinator --action tool.called --since 24h

# Filter by run
swarm audit --run fanout-test-4

# Filter by status
swarm audit --namespace production --status error --since 7d

# Show causal chain for a specific event
swarm audit tree evt-abc123

# Export as JSON for external processing
swarm audit --agent report-coordinator --since 1h --output json
```

### Available filters

| Flag | Description |
|---|---|
| `--agent` | Filter by SwarmAgent name |
| `--namespace` | Filter by namespace (defaults to current context) |
| `--action` | Filter by action type (e.g., `tool.called`) |
| `--status` | Filter by status (`success`, `error`, `timeout`, `denied`) |
| `--run` | Filter by SwarmRun name |
| `--since` | Time window (e.g., `1h`, `24h`, `7d`) |
| `--output` | Output format: `table` (default) or `json` |

The `swarm audit tree` subcommand follows `parentEventId` links to reconstruct the full causal chain for a given event - useful for tracing fan-out failures across agents.

---

## Relationship to existing observability

The audit trail complements - not replaces - existing observability signals.

| Signal | Purpose | Audit trail adds |
|---|---|---|
| OTel traces | Latency analysis, distributed tracing | Structured action log with fixed schema, no collector required |
| Pod logs | Runtime debugging, error output | Chronological action record that survives pod termination (Redis/webhook sinks) |
| Kubernetes Events | Object lifecycle (created, updated, deleted) | Agent-level decisions: which tool was called, what it returned, why it failed |
| SwarmRun status | Run phase and step results | Per-action granularity with causal chain and token counts |
| SwarmBudget | Aggregate token spend tracking | Per-action token attribution (which tool call cost how much) |

For full observability coverage, use the audit trail alongside OTel tracing and structured logging:

- **OTel** for latency analysis and cross-service correlation
- **Structured logging** for runtime debugging (see [Observability](/observability/overview))
- **Audit trail** for behavior reconstruction, compliance, and cost attribution
- **SwarmBudget** for aggregate spend limits (see [Budget Management](/scaling/budget-management))

---

## Capacity estimation

Audit storage scales with the number of agents, tasks per hour, and audit mode. Use these rules of thumb for Redis sink sizing.

| Mode | Events per task (typical) | Avg event size |
|---|---|---|
| `actions` | 3-8 | ~1.5 KB |
| `verbose` | 15-40 | ~4 KB |

**Quick formula:**

```
audit_memory_mb = events_per_hour * avg_event_bytes * retention_hours / (1024 * 1024)
```

Example: 50 agents, 10 tasks/hour each, `actions` mode, 7-day retention:
- 500 tasks/hour * 5 events * 1.5 KB = 3.75 MB/hour
- 3.75 MB * 168h = 630 MB + 30% headroom = ~820 MB

For detailed sizing - including worked examples for verbose mode, split topologies, and the `maxDetailBytes` knob - see the [Redis in Production](/scaling/redis-production#capacity-estimation) guide.

---

## OTel metrics

The audit subsystem emits the following OpenTelemetry metrics. These are available regardless of which sink you use.

| Metric | Type | Labels | Description |
|---|---|---|---|
| `kubeswarm_audit_events_dropped_total` | Counter | `sink`, `reason` | Events dropped due to buffer overflow or sink failure. Any sustained non-zero rate means you are losing audit data. |
| `kubeswarm_audit_buffer_utilization` | Gauge | `sink` | Current buffer fill ratio (0.0 - 1.0). Alert when this exceeds 0.8 - the buffer is close to evicting events. |
| `kubeswarm_audit_circuit_breaker` | Gauge | `state` | Circuit breaker state for the Redis sink: 0 = closed (healthy), 1 = open (failing). |
| `kubeswarm_audit_trim_lag_seconds` | Gauge | `namespace` | Seconds since the last successful XTRIM on the audit stream. Rising values mean retention cleanup is falling behind. |

**Recommended alerts:**

```yaml
# Alert when audit events are being dropped
- alert: KubeswarmAuditEventsDropped
  expr: rate(kubeswarm_audit_events_dropped_total[5m]) > 0
  for: 2m
  labels:
    severity: warning
  annotations:
    summary: "Audit events are being dropped"
    description: "{{ $labels.sink }} sink is dropping events (reason: {{ $labels.reason }}). Check Redis connectivity and buffer sizing."

# Alert when buffer is nearly full
- alert: KubeswarmAuditBufferHigh
  expr: kubeswarm_audit_buffer_utilization > 0.8
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Audit buffer utilization above 80%"
    description: "Audit events may start dropping soon. Check sink throughput."
```
