---
sidebar_position: 2
sidebar_label: "Create a Pipeline"
description: "Create a multi-agent pipeline on Kubernetes with kubeswarm. Compose SwarmAgents into a DAG workflow using SwarmTeam with step dependencies and template expressions."
---

# Pipelines

Compose multiple kubeswarm agents into a DAG pipeline using SwarmTeam. Each step targets an agent, passes data via template expressions and tracks execution in a SwarmRun record.

## Define agents

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: researcher
spec:
  model: claude-haiku-4-5-20251001
  prompt:
    inline: "You are a research assistant."
  infrastructure:
    apiKeyRef:
      name: provider-api-keys
      key: ANTHROPIC_API_KEY
---
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmAgent
metadata:
  name: writer
spec:
  model: claude-sonnet-4-6
  prompt:
    inline: "You are a technical writer."
  infrastructure:
    apiKeyRef:
      name: provider-api-keys
      key: ANTHROPIC_API_KEY
```

## Define the team

```yaml
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmTeam
metadata:
  name: blog-pipeline
spec:
  roles:
    - name: researcher
      swarmAgent: researcher
    - name: writer
      swarmAgent: writer

  inputs:
    - name: topic
      type: string
      required: true

  pipeline:
    - role: researcher
      inputs:
        prompt: "Research this topic: {{ .input.topic }}"
    - role: writer
      dependsOn: [researcher]
      inputs:
        prompt: |
          Write a blog post based on this research:
          {{ .steps.researcher.output }}

  output: "{{ .steps.writer.output }}"
  timeoutSeconds: 600
```

## Trigger a run

```bash
kubectl apply -f - <<EOF
apiVersion: kubeswarm.io/v1alpha1
kind: SwarmRun
metadata:
  name: blog-run-1
spec:
  teamRef: blog-pipeline
  input:
    topic: "Kubernetes-native agent orchestration"
EOF

kubectl get swrun blog-run-1 -w
```

## Template syntax

| Expression                             | Description             |
| -------------------------------------- | ----------------------- |
| `{{ .input.<key> }}`                   | Pipeline input value    |
| `{{ .steps.<role>.output }}`           | Previous step's output  |
| `{{ .steps.<role>.artifacts.<name> }}` | Step artifact reference |
