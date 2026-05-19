---
sidebar_position: 6
sidebar_label: "Search Mode"
description: "Tree-based search orchestration for kubeswarm. Explore multiple approaches, score results, prune dead ends and converge on the best solution using BFS or BeamSearch."
---

# Search Mode

Search mode lets a SwarmTeam explore a solution space using tree search strategies. Instead of a fixed pipeline DAG, the team becomes a search tree that expands dynamically based on agent outputs. A planner agent decides branching and pruning, executor agents do the work, and an optional evaluator scores results.

## When to use search

Use search mode when the problem has multiple valid approaches and you need to systematically find the best one:

- **Multi-hypothesis research** - explore several theories, prune disproven ones, go deeper on promising leads
- **Code generation with backtracking** - try different algorithms, backtrack from failures
- **Adversarial testing** - generate attack variants, score each, deepen on the most effective
- **Optimization** - explore prompt variants, score each on a test set, converge on the winner

Use [pipeline mode](/orchestration/pipelines) when the steps are predetermined. Use [dynamic mode](/orchestration/overview#dynamic) when agents should self-organize without scoring.

## Three roles

| Role | Required | Purpose |
|------|----------|---------|
| **Planner** | Yes | Sees the current tree state and decides what to explore, prune, or converge on |
| **Executor** | Yes | Executes each node's task and produces output |
| **Evaluator** | No | Scores executor output on a 0-1000 scale. Required for BeamSearch |

When no evaluator is set, the planner self-scores by including `scoreMillis` in its actions.

## Strategies

### BFS (Breadth-First Search)

Expand all nodes at the current depth before going deeper. Best for exhaustive exploration when depth is bounded.

```yaml
spec:
  roles:
    - name: planner
      model: claude-sonnet-4-6
      prompt:
        inline: |
          You receive the current search tree as JSON. Decide what to explore next.
          Respond ONLY with a JSON array of actions:
          [{"action": "expand"|"prune"|"converge", "parentNode": <id>, "task": "<string>", "scoreMillis": <0-1000>, "reason": "<string>"}]
    - name: worker
      model: claude-sonnet-4-6
      prompt:
        inline: "Execute the given task thoroughly."

  search:
    strategy: BFS
    plannerRole: planner
    executorRole: worker
    initialPrompt: "{{ .input.problem }}"
    maxDepth: 3
    maxNodes: 15
    minScorePercent: 85
```

### BeamSearch

Keep only the top K nodes at each depth level and prune the rest. Requires an evaluator role because beam pruning depends on score ordering.

```yaml
spec:
  roles:
    - name: investigator
      model: claude-sonnet-4-6
    - name: tester
      model: claude-sonnet-4-6
    - name: judge
      model: claude-haiku-4-5-20251001

  search:
    strategy: BeamSearch
    plannerRole: investigator
    executorRole: tester
    evaluatorRole: judge
    initialPrompt: "{{ .input.incident }}"
    beamWidth: 3
    minScorePercent: 85
    maxDepth: 5
    maxNodes: 30
    maxParallel: 3
```

The evaluator returns structured JSON scores:

```json
{
  "scoreMillis": 720,
  "reasoning": "Correct approach but missing edge case handling",
  "shouldPrune": false,
  "metadata": {"evidence_strength": "moderate"}
}
```

`scoreMillis` is 0-1000 (milli-units). `shouldPrune` lets the evaluator flag dead ends without waiting for the planner. `metadata` carries domain-specific signals.

## Convergence

Every search is bounded. The first condition hit terminates the search:

| Criterion | Field | Description |
|-----------|-------|-------------|
| Score threshold | `minScorePercent` | A node scores above this percentage (0-100) |
| Depth limit | `maxDepth` | Tree reaches this depth |
| Node limit | `maxNodes` | Total nodes created (max 200) |
| Iteration limit | `maxIterations` | Planner invoked this many times |
| Budget exhaustion | via `budgetRef` | SwarmBudget hard stop |
| Planner decision | `converge` action | Planner explicitly declares a solution |

When the search terminates, the highest-scoring node's output becomes the SwarmRun output. If no node meets `minScorePercent`, the run reports `SearchExhausted`.

## Configuration reference

```yaml
search:
  strategy: BFS              # BFS or BeamSearch
  plannerRole: planner        # must match a role in spec.roles
  executorRole: executor      # must match a role in spec.roles
  evaluatorRole: judge        # optional (required for BeamSearch)
  initialPrompt: "{{ .input.problem }}"

  # Convergence limits
  minScorePercent: 85         # 0-100, triggers convergence when exceeded
  maxDepth: 10                # default 10, 0 = no limit
  maxNodes: 50                # default 50, max 200
  maxIterations: 20           # default 20, 0 = no limit

  # Execution
  maxParallel: 3              # concurrent executor tasks per level
  maxOutputBytes: 4096        # truncate node output (default 4096, max 8192)

  # BeamSearch only
  beamWidth: 3                # nodes kept per depth level

  # Retry and resilience
  maxPlannerRetries: 2        # retries on invalid planner JSON
  maxEvaluatorRetries: 2      # retries on unparseable evaluator output
  stagnationThreshold: 5      # iterations without score improvement before warning
  plannerTimeoutSeconds: 120  # stale planner detection
```

## Observability

### Tree state

The full search tree is stored in `SwarmRun.status.searchTree`:

```bash
# View tree nodes with scores
kubectl get swrun my-search -o jsonpath='{.status.searchTree.nodes}' | \
  jq '.[] | {id, depth, phase, scoreMillis, task}'

# Check termination reason
kubectl get swrun my-search -o jsonpath='{.status.searchTree.terminationReason}'

# Node and iteration counts
kubectl get swrun my-search -o jsonpath='{.status.searchTree.iterations}'
```

### Kubernetes events

| Event | When |
|-------|------|
| `SearchExpanded` | New nodes created |
| `SearchPruned` | Dead ends pruned |
| `SearchConverged` | Solution found |
| `SearchExhausted` | No solution within limits |
| `EvaluatorParseFailed` | Evaluator output could not be parsed |
| `PlannerValidationFailed` | Planner output failed JSON validation |
| `StagnationDetected` | Best score flat for N iterations |

### OTel metrics

| Metric | Type | Description |
|--------|------|-------------|
| `kubeswarm.search.nodes.created` | Counter | Nodes created |
| `kubeswarm.search.nodes.pruned` | Counter | Nodes pruned |
| `kubeswarm.search.node.score` | Histogram | Score distribution (0-1000) |
| `kubeswarm.search.iterations` | Counter | Planner invocations |
| `kubeswarm.search.best_score` | Gauge | Current best score |
| `kubeswarm.search.evaluator.parse_failures` | Counter | Evaluator parse errors |
| `kubeswarm.search.planner.validation_failures` | Counter | Planner validation errors |
| `kubeswarm.search.stagnation_iterations` | Gauge | Iterations without improvement |

## Cost optimization

Search involves multiple LLM calls per iteration. Use different models for each role:

- **Planner**: expensive reasoning model (runs once per iteration)
- **Executor**: mid-tier model (runs once per node, parallel)
- **Evaluator**: cheap fast model (runs once per node, scoring is simple)

A BeamSearch with `beamWidth=3`, `maxDepth=5`, and `maxParallel=3` makes roughly 35 total LLM calls. Most of the cost is in the executor.

## Examples

- [Cookbook recipe 18 - Search Brainstorm](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/18-search-brainstorm) (BFS, planner self-scores)
- [Cookbook recipe 19 - Root Cause Analyzer](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/recipes/19-search-root-cause) (BeamSearch with evaluator)
