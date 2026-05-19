---
sidebar_position: 1
sidebar_label: "Orchestration"
slug: /orchestration/overview
description: "kubeswarm orchestration modes - pipeline DAG, dynamic delegation, LLM-routed dispatch and tree search for agent teams on Kubernetes."
---

# Orchestration

A kubeswarm SwarmTeam composes multiple AI agents into a workflow on Kubernetes. Four execution modes let you choose the right orchestration pattern for your use case.

## Pipeline Mode {#pipeline}

A DAG of steps executed in dependency order. Each step targets an agent.

```yaml
spec:
  pipeline:
    - role: researcher
      inputs:
        prompt: "Research {{ .input.topic }}"
    - role: writer
      dependsOn: [researcher]
      inputs:
        prompt: "Write about:\n{{ .steps.researcher.output }}"
  output: "{{ .steps.writer.output }}"
```

Steps pass data via Go template expressions. `dependsOn` controls ordering.

## Dynamic Mode {#dynamic}

Agents delegate to each other at runtime using the built-in `delegate()` tool.

```yaml
spec:
  entry: coordinator
  roles:
    - name: coordinator
      canDelegate: [researcher, writer]
    - name: researcher
    - name: writer
```

The coordinator's LLM decides when to delegate. No fixed DAG.

### Parallel fan-out

In dynamic mode, agents can fan out work to multiple replicas in parallel using the `spawn_and_collect` built-in tool. This enables patterns like parallel research - submit N subtasks, wait for all results, then synthesize.

```yaml
# The coordinator's prompt instructs it to use spawn_and_collect:
spec:
  entry: coordinator
  roles:
    - name: coordinator
      canDelegate: [researcher]
    - name: researcher
```

The coordinator calls `spawn_and_collect` with multiple prompts. Each subtask lands on the researcher's queue, where available replicas pick them up in parallel. Results are collected back into the coordinator's loop.

See [Parallel Fan-Out](/orchestration/parallel-fan-out) for details and [cookbook recipe 03 - Dynamic Delegation](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/03-dynamic-delegation) for a working example.

## Routed Mode {#routed}

An LLM router picks the best agent from the SwarmRegistry based on the request.

```yaml
spec:
  routing:
    registryRef:
      name: default
    model: claude-haiku-4-5-20251001
    fallback: general-agent
```

No pipeline, no roles - the team adapts to what each request needs.

## Search Mode {#search}

A tree search where a planner agent explores multiple approaches, an evaluator scores each one, and weak branches are pruned. BFS and BeamSearch strategies with declarative convergence criteria.

```yaml
spec:
  roles:
    - name: planner
      model: claude-sonnet-4-6
    - name: worker
      model: claude-sonnet-4-6

  search:
    strategy: BFS
    plannerRole: planner
    executorRole: worker
    initialPrompt: "{{ .input.problem }}"
    minScorePercent: 85
    maxDepth: 3
```

The planner sees the current tree state and outputs structured actions: expand (create branches), prune (kill dead ends), converge (declare a winner). See [Search Mode](/orchestration/search) for details.

## Execution Records

Every run creates a `SwarmRun` - an immutable execution record with inputs, outputs, token counts and phase transitions. SwarmRun is to SwarmTeam what Job is to CronJob.

```bash
kubectl get swrun -w
kubectl describe swrun my-run-20260403
```
