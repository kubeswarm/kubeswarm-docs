---
sidebar_position: 5
sidebar_label: "Parallel Fan-Out"
description: "kubeswarm parallel fan-out and fan-in - spawn_and_collect and collect_results built-in tools for parallel subtask execution across agent replicas."
---

# Parallel Fan-Out / Fan-In

An agent can fan out work to multiple replicas in parallel and collect the results back into its own loop. This enables patterns like parallel research, batch analysis, and distributed data processing without leaving the agent's tool-use loop.

## Built-in tools

Two built-in tools are available when the agent has a task queue configured (i.e., running in-cluster, not via the local CLI):

| Tool                | Purpose                                                                     |
| ------------------- | --------------------------------------------------------------------------- |
| `spawn_and_collect` | Submit multiple tasks in parallel and wait for all results in a single call |
| `collect_results`   | Poll for completed results by task ID (for advanced multi-step patterns)    |

Both tools are registered automatically - no configuration needed.

## spawn_and_collect

The primary fan-out tool. The agent calls it with a list of tasks, each with a prompt and an optional role for cross-agent delegation.

**Input schema:**

```json
{
  "tasks": [
    { "prompt": "Research competitor A" },
    { "prompt": "Research competitor B" },
    { "prompt": "Analyze findings", "role": "analyst" }
  ],
  "timeout_seconds": 120
}
```

- Tasks without a `role` are submitted to the agent's own queue (self-queue). Other replicas of the same agent pick them up.
- Tasks with a `role` are delegated to that role's queue in the SwarmTeam. This enables cross-agent fan-out.
- `timeout_seconds` defaults to 120. If some tasks don't complete in time, partial results are returned.

**Return format:**

```json
{
  "completed": {
    "task-123": { "prompt": "Research competitor A", "output": "..." },
    "task-456": { "prompt": "Research competitor B", "output": "..." }
  },
  "pending": ["task-789"]
}
```

The agent receives completed results and can decide what to do with any pending tasks - retry, proceed with partial results, or cancel.

## collect_results

A lower-level tool for advanced patterns where the agent needs fine-grained control over submission and collection.

**Typical flow:**

1. Agent calls `submit_subtask` multiple times, collecting task IDs
2. Agent does other work while subtasks execute
3. Agent calls `collect_results` with the task IDs to gather results

**Input schema:**

```json
{
  "task_ids": ["task-123", "task-456", "task-789"],
  "timeout_seconds": 120
}
```

**Return format:**

```json
{
  "completed": {
    "task-123": "Result for task 123",
    "task-456": "Result for task 456"
  },
  "pending": ["task-789"]
}
```

## How it works with autoscaling

Fan-out naturally increases the pending task count on the agent's queue. When [KEDA-based autoscaling](/scaling/autoscaling) is enabled, this triggers pod scale-up:

1. Agent submits 10 subtasks via `spawn_and_collect`
2. 10 pending messages appear on the Redis Stream
3. KEDA sees pending count exceed `targetPendingTasks` and scales up replicas
4. New pods start, poll tasks, execute them in parallel
5. Results land in Redis and the originating agent collects them
6. Pending count drops and KEDA scales replicas back down

No changes to the autoscaling configuration are needed. The existing pending-task metric drives the right behavior.

## How it works with budgets

Each subtask is a separate task execution that consumes tokens from the agent's [SwarmBudget](/scaling/budget-management). The originating agent's own token usage for the fan-out/collect cycle is minimal (tool call overhead only). The real cost is in the subtask executions, which are tracked individually.

## Example

See [cookbook recipe 07 - Parallel Fan-Out](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/07-parallel-fan-out) for a complete working example with a coordinator agent that fans out competitive research to worker replicas.

## Limitations

- **Cluster only** - `spawn_and_collect` and `collect_results` require a task queue (Redis). They are not available when running locally via `swarm run`.
- **Model dependent** - the LLM must understand and correctly use the tool schema. Larger models (Claude Sonnet, GPT-4o, Qwen 32B+) are more reliable at multi-step tool use than smaller models.
- **No cancellation** - there is no built-in way to cancel in-flight subtasks from within the agent loop. The run-level timeout handles cleanup.
