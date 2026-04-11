---
sidebar_position: 2
sidebar_label: "Quick Start"
slug: /quick-start
description: "Deploy your first kubeswarm agent on Kubernetes in under 2 minutes using Ollama. No API keys needed. Step-by-step guide with kubectl."
---

# Quick Start - Deploy a kubeswarm Agent in 2 Minutes

Deploy your first kubeswarm agent on Kubernetes in under 2 minutes. This guide uses Ollama on a Kubernetes cluster so you can get started with **no API keys needed**.

Looking to try kubeswarm without a cluster? See the [local quick start](/quick-start/local) using the `swarm` CLI.

## Prerequisites

| Tool       | Version | Required                                   |
| ---------- | ------- | ------------------------------------------ |
| Kubernetes | 1.35+   | Yes (Docker Desktop, Kind, or any cluster) |
| Helm       | 3.16+   | Yes                                        |
| kubectl    | 1.35+   | Yes                                        |
| Ollama     | latest  | For this guide (cloud providers work too)  |

## 1. Install the operator

```bash
helm repo add kubeswarm https://kubeswarm.github.io/helm-charts
helm install kubeswarm kubeswarm/kubeswarm \
  --namespace kubeswarm-system --create-namespace
```

## 2. Start Ollama

```bash
ollama pull qwen2.5:7b
ollama serve
```

## 3. Deploy an agent

```yaml
# agent.yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: hello-agent
  namespace: default
spec:
  model: qwen2.5:7b
  prompt:
    inline: "You are a helpful assistant running on Kubernetes."
  guardrails:
    limits:
      tokensPerCall: 2048
      timeoutSeconds: 60
  runtime:
    replicas: 1
  envFrom:
    - configMapRef:
        name: ollama-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ollama-config
  namespace: default
data:
  AGENT_PROVIDER: openai
  OPENAI_BASE_URL: http://host.docker.internal:11434/v1
  OPENAI_API_KEY: "unused"
```

```bash
kubectl apply -f agent.yaml
kubectl get swagent hello-agent -w
```

Wait until `READY` shows `1`.

## 4. Submit a task

```bash
kubectl apply -f - <<EOF
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmRun
metadata:
  name: hello-run
spec:
  agent: hello-agent
  prompt: "What is Kubernetes? Answer in 2 sentences."
EOF
```

## 5. See the result

```bash
kubectl get swrun hello-run -o jsonpath='{.status.output}'
```

## Next steps

- [Connect MCP tools](/getting-started/connect-mcp-tools) to give your agent capabilities
- [Create a pipeline](/getting-started/create-a-pipeline) with multiple agents
- Try [cloud providers](/integrations/llm-providers) (Anthropic, OpenAI, Gemini)
- Browse [cookbook recipes](/examples/) for production patterns
