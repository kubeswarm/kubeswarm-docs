---
sidebar_position: 6
sidebar_label: "Reasoning Models"
description: "kubeswarm reasoning model support - enable extended thinking on Anthropic, OpenAI and local models with per-call budget control and thinking token observability on Kubernetes."
---

# kubeswarm Reasoning Models - Extended Thinking on Kubernetes

kubeswarm gives reasoning-capable LLMs (Anthropic extended thinking, OpenAI o-series, Qwen, and any model that produces reasoning content) a first-class configuration surface. Enable reasoning per agent, cap thinking tokens with guardrails, and see the cost split in `TokenUsage.ThinkingTokens`.

Reasoning content (the model's internal chain-of-thought) is consumed inside the agent pod and discarded. Only the token count is reported. Trace capture and retrieval are not part of this feature.

## Enabling reasoning

Add `spec.reasoning` to your SwarmAgent:

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: analyst
spec:
  model: claude-sonnet-4-6
  prompt:
    inline: "You are a careful analyst. Think step by step."
  infrastructure:
    apiKeyRef:
      name: provider-api-keys
      key: ANTHROPIC_API_KEY
  reasoning:
    mode: Auto
    budgetTokens: 8192
```

### `mode`

| Value | Behavior |
|---|---|
| `Disabled` | Reasoning is off. This is the default in v0.x to avoid surprise token costs on upgrade. |
| `Auto` | Reasoning is enabled. The operator trusts your declaration and sends reasoning parameters to the provider. If the model does not support reasoning, the call proceeds without it and `ThinkingTokens` stays zero. |
| `Explicit` | Same as Auto, but the intent is that reasoning is required. If the provider returns an error because the model does not support reasoning, the task fails. |

kubeswarm does **not** maintain a list of reasoning-capable model names. Your `mode: Auto` or `mode: Explicit` declaration is the signal. This works with any model from any provider - Claude, GPT, Qwen, Llama, or a local fine-tune behind Ollama.

### `effort`

The provider-neutral effort hint for OpenAI o-series models. Values: `Low`, `Medium`, `High`. Ignored by Anthropic (emits a `ReasoningFieldIgnored` Event if set on a Claude model).

### `budgetTokens`

The Anthropic thinking-token budget (how many tokens the model may spend on its internal reasoning pass). Ignored by OpenAI o-series (emits a `ReasoningFieldIgnored` Event if set on a GPT/o-series model). Range: 1024 - 200000.

You can set both `effort` and `budgetTokens` on the same agent. Each provider picks up the field it understands and ignores the other. This makes your YAML portable across providers - change `spec.model` and the right field takes effect.

## Budget control with guardrails

Guardrail limits cap what the runtime will actually send to the provider, regardless of what the agent author requested:

```yaml
spec:
  reasoning:
    mode: Auto
    budgetTokens: 16000
  guardrails:
    limits:
      maxThinkingTokensPerCall: 8000
      maxAnswerTokensPerCall: 4000
```

- **`maxThinkingTokensPerCall`** - the operator-enforced ceiling on thinking tokens per LLM turn. For Anthropic, the runtime clamps `budgetTokens` to this value. For OpenAI o-series, the runtime downgrades the effort level using a fixed table (High if >= 16384, Medium if >= 4096, Low otherwise).
- **`maxAnswerTokensPerCall`** - caps answer tokens per turn.

Both are `*int32` pointers: nil means no cap.

When the runtime clamps the budget, the `ReasoningActive` status condition reason changes to `ClampedByGuardrail` so you can see it in `kubectl get swarmagent -o wide`.

## Namespace defaults via SwarmSettings

Platform teams can set a namespace-wide reasoning posture via SwarmSettings:

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmSettings
metadata:
  name: team-defaults
  namespace: ml-team
spec:
  reasoning:
    mode: Auto
    budgetTokens: 4096
```

Per-agent `spec.reasoning` fields override the cascade. A per-agent `mode: Disabled` always wins over a cascaded `mode: Auto` - agent-level opt-out is respected.

## Observing reasoning

### Status condition

Every SwarmAgent gets a `ReasoningActive` condition:

```shell
kubectl get swarmagent -o wide
```

| Reason | Status | Meaning |
|---|---|---|
| `Disabled` | False | Reasoning is off (default or explicitly set) |
| `Active` | True | User opted in, no clamp detected |
| `ClampedByGuardrail` | True | Active but budget was clamped down by guardrails |
| `IgnoredModelNotCapable` | False | Model did not produce reasoning content at runtime |
| `FieldIgnored` | True | A provider-irrelevant field was set (e.g., `effort` on Claude) |
| `RejectedModelNotCapable` | False | `mode: Explicit` and the model returned an error on reasoning params |

The first three are set by the reconciler at reconcile time. The last three are set by the provider at runtime after the first LLM call.

### Token usage

`SwarmRunStepStatus.TokenUsage` gains a `ThinkingTokens` field:

```json
{
  "inputTokens": 1200,
  "outputTokens": 450,
  "thinkingTokens": 3800,
  "totalTokens": 5450
}
```

`ThinkingTokens` is counted **separately** from `OutputTokens` - they are not additive. Total tokens = input + output + thinking. Consumers that sum token costs must include all three.

For multi-turn steps (tool-use loops), `ThinkingTokens` is the sum across all turns in the step.

### OTel metrics

| Metric | Type | Description |
|---|---|---|
| `kubeswarm.llm.thinking_tokens` | Counter | Thinking tokens consumed (labels: namespace, agent, model, provider) |
| `kubeswarm.llm.reasoning.calls` | Counter | LLM calls with reasoning enabled |
| `kubeswarm.llm.reasoning.clamped` | Counter | Calls where the runtime clamped budget or effort (label: `reason`) |
| `kubeswarm.llm.reasoning.ignored` | Counter | Auto mode calls on non-reasoning models |
| `kubeswarm.llm.reasoning.rejected` | Counter | Explicit mode reconciles rejected |

## Provider-specific behavior

### Anthropic

- `budgetTokens` maps to `thinking.budget_tokens` on the API request.
- `maxThinkingTokensPerCall` clamps `budgetTokens` before sending.
- Anthropic requires `max_tokens > budget_tokens`; the runtime automatically adjusts `max_tokens` upward when needed.
- Thinking tokens are reported via the Anthropic SDK's usage fields.

### OpenAI / o-series

- `effort` maps to `reasoning.effort` on the API request (`Low`/`Medium`/`High` translated to vendor-specific lowercase).
- `maxThinkingTokensPerCall` downgrades effort via a fixed table: >= 16384 allows High, >= 4096 allows Medium, below 4096 forces Low.
- Thinking tokens come from `completion_tokens_details.reasoning_tokens` in the standard OpenAI response.

### Ollama and OpenAI-compatible servers

- Models like `qwen3:8b` expose reasoning content in a non-standard `message.reasoning` field.
- kubeswarm detects this field and estimates thinking tokens from it (chars/4 approximation) when the standard `completion_tokens_details.reasoning_tokens` is zero.
- No configuration needed - the fallback is automatic for any OpenAI-compatible server that returns a `reasoning` field.

## Cookbook examples

See the [09-reasoning-models](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/09-reasoning-models) cookbook for ready-to-use examples:

- **[minimal](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/09-reasoning-models/minimal)** - smallest possible reasoning opt-in
- **[budgets](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/09-reasoning-models/budgets)** - per-call thinking and answer caps
- **[crossprovider](https://github.com/kubeswarm/kubeswarm-cookbook/tree/main/teams/09-reasoning-models/crossprovider)** - same YAML for Anthropic and OpenAI

## Design reference

See [RFC-0033: Reasoning Model Provider Support](https://github.com/kubeswarm/kubeswarm-rfcs/blob/main/rfcs/0033-reasoning-model-provider-support.md) for the full design rationale, design decisions, and CNCF review notes.
