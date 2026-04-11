---
sidebar_position: 5
sidebar_label: "Observability"
description: "kubeswarm observability - OpenTelemetry tracing, Prometheus metrics, structured logging and semantic health checks for agents on Kubernetes."
---

# kubeswarm Observability - OpenTelemetry, Prometheus, Logging

kubeswarm provides built-in observability for agents on Kubernetes via OpenTelemetry tracing, Prometheus metrics, structured JSON logging and semantic health checks.

## OpenTelemetry

Set the OTel endpoint in Helm values to enable tracing and metrics:

```bash
helm install kubeswarm kubeswarm/kubeswarm \
  --set otelEndpoint=http://otel-collector.monitoring:4317
```

Traces cover: task lifecycle, tool calls, LLM API calls, queue operations.

## Structured Logging

```yaml
spec:
  observability:
    logging:
      level: info # debug | info | warn | error
      toolCalls: true # log tool name, args, result
      llmTurns: false # log full message history (verbose)
      redaction:
        secrets: true # scrub secretKeyRef values
        pii: false # scrub email, IP patterns
```

Logs are emitted as structured JSON via slog. Configure Fluentd, Loki, or any log collector to scrape agent pods.

## Prometheus Metrics

```yaml
spec:
  observability:
    metrics:
      enabled: true # expose /metrics endpoint
```

Key metrics:

- `kubeswarm_task_duration_seconds` - task execution time
- `kubeswarm_task_tokens_total` - tokens consumed per task
- `kubeswarm_tool_calls_total` - tool invocation count
- `kubeswarm_mcp_health` - MCP server health status

## Semantic Health Checks

A semantic health check sends a prompt to the agent and evaluates the response:

```yaml
spec:
  observability:
    healthCheck:
      type: semantic # semantic | ping
      intervalSeconds: 30
      prompt: "Reply OK if you are ready to accept tasks."
      notifyRef:
        name: ops-alerts # SwarmNotify for degraded alerts
```

When the check fails, the `MCPDegraded` condition is set and the referenced SwarmNotify fires.

## Kubernetes Conditions

```bash
kubectl get swagent my-agent -o jsonpath='{.status.conditions}'
```

| Condition        | Meaning                                         |
| ---------------- | ----------------------------------------------- |
| `Ready`          | All replicas are running and healthy            |
| `MCPDegraded`    | One or more MCP servers are unreachable         |
| `BudgetExceeded` | Daily token limit reached, replicas scaled to 0 |
