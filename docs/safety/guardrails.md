---
sidebar_position: 2
sidebar_label: "Guardrails and Trust"
description: "kubeswarm guardrails - tool allow/deny lists, trust levels, token budgets and execution limits for agents on Kubernetes."
---

# Guardrails

Control what tools your kubeswarm agents can call and how much they can spend on Kubernetes. Configure allow/deny lists, trust levels and execution limits.

## Tool Allow/Deny Lists

Restrict which tools an agent is permitted to invoke:

```yaml
spec:
  guardrails:
    tools:
      allow:
        - "github/read_file"
        - "github/list_directory"
        - "search/*" # wildcard: all tools from search server
      deny:
        - "github/delete_branch"
        - "shell/*" # deny all shell tools
```

**Rules:**

- When `allow` is set, only listed tools are permitted
- `deny` takes precedence over `allow` when both match
- Wildcards supported: `<server-name>/*` matches all tools from that server
- Tool names use the format `<mcp-server-name>/<tool-name>`

## Trust Levels

Every tool and agent connection has a trust level:

```yaml
spec:
  tools:
    mcp:
      - name: internal-db
        trust: internal # same org, baseline behavior
      - name: external-api
        trust: external # third-party, restricted
      - name: experimental
        trust: sandbox # untrusted, strictest validation
  guardrails:
    tools:
      trust:
        default: external # applied to tools without explicit trust
        enforceInputValidation: true # reject calls that don't match schema
```

| Level      | Description                                                     |
| ---------- | --------------------------------------------------------------- |
| `internal` | Tools within the same organization or cluster                   |
| `external` | Third-party or internet-facing tools (default)                  |
| `sandbox`  | Untrusted or experimental - enforces strictest input validation |

## Execution Limits

```yaml
spec:
  guardrails:
    limits:
      tokensPerCall: 8000 # max tokens per LLM API call
      concurrentTasks: 5 # parallel tasks per replica
      timeoutSeconds: 120 # per-task deadline
      dailyTokens: 1000000 # rolling 24h budget (0 = no limit)
      retries: 3 # retry count before dead-lettering
```

When `dailyTokens` is exceeded, the operator sets a `BudgetExceeded` condition and scales replicas to 0. Replicas are restored automatically when the 24h window rotates.

## Budget Reference

For shared budgets across multiple agents:

```yaml
spec:
  guardrails:
    budgetRef:
      name: team-budget # SwarmBudget in same namespace
```

See [SwarmBudget](/reference/api) for the budget CRD spec.
