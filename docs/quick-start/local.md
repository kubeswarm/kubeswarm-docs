---
sidebar_position: 2
sidebar_label: "Local (No Cluster)"
slug: /quick-start/local
description: "Try kubeswarm locally without a Kubernetes cluster using the swarm CLI and Ollama. No cluster, no Helm, no API keys."
---

# Local Quick Start - No Cluster Required

Try kubeswarm locally without a Kubernetes cluster. The `swarm` CLI runs pipelines on your machine using the same SwarmAgent and SwarmTeam YAML you would deploy to Kubernetes.

Want to deploy to a real cluster instead? See the [standard quick start](/quick-start).

## Prerequisites

| Tool    | Version | Required                         |
| ------- | ------- | -------------------------------- |
| swarm   | latest  | Yes                              |
| Ollama  | latest  | For this guide (any provider works) |

No Kubernetes cluster, Helm, or kubectl needed.

## 1. Install the CLI

```bash
# macOS / Linux
brew install kubeswarm/tap/swarm

# or download directly
curl -fsSL https://get.kubeswarm.io | sh
```

## 2. Start Ollama

```bash
ollama pull qwen2.5:7b
ollama serve
```

## 3. Create an agent

```yaml
# agent.yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: hello-agent
spec:
  model: qwen2.5:7b
  prompt:
    inline: "You are a helpful assistant."
  guardrails:
    limits:
      tokensPerCall: 2048
      timeoutSeconds: 60
```

## 4. Run it

```bash
swarm run agent.yaml --prompt "What is Kubernetes? Answer in 2 sentences."
```

The CLI validates the YAML, starts the agent locally, submits the task, and streams the output.

## 5. Try a pipeline

```yaml
# team.yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmTeam
metadata:
  name: research-team
spec:
  roles:
    - name: researcher
      model: qwen2.5:7b
      prompt:
        inline: "You are a researcher. Be concise."
    - name: writer
      model: qwen2.5:7b
      prompt:
        inline: "You are a writer. Summarize the research."
  pipeline:
    - role: researcher
      inputs:
        prompt: "Research: {{ .input.topic }}"
    - role: writer
      dependsOn: [researcher]
      inputs:
        prompt: "Write a summary:\n{{ .steps.researcher.output }}"
  output: "{{ .steps.writer.output }}"
```

```bash
swarm run team.yaml --input '{"topic": "Kubernetes operators"}'
```

## What's different from production

The `swarm` CLI is a development tool. It runs agents as local processes, not Kubernetes pods. Features that require a cluster - autoscaling, KEDA, network policies, Redis task queue - are simulated or skipped.

| Feature | `swarm run` (local) | Kubernetes |
| --- | --- | --- |
| Agent execution | Local process | Pod |
| Task queue | In-memory | Redis Streams |
| Autoscaling | N/A | KEDA |
| Budget enforcement | Simulated | SwarmBudget CRD |
| MCP tools | Direct connection | Pod sidecar |

## Next steps

- [Deploy to Kubernetes](/quick-start) when you are ready for production
- [Connect MCP tools](/getting-started/connect-mcp-tools) to give agents capabilities
- [Create a pipeline](/getting-started/create-a-pipeline) with multiple agents
- Browse [cookbook recipes](/examples/) for production patterns
