---
sidebar_position: 1
sidebar_label: "LLM Providers"
description: "kubeswarm LLM provider integrations - Anthropic Claude, OpenAI GPT, Google Gemini, Ollama, vLLM and custom gRPC providers for Kubernetes agents."
---

# kubeswarm LLM Providers - Anthropic, OpenAI, Gemini, Ollama

kubeswarm auto-detects the LLM provider from the model name. Built-in support for Anthropic Claude, OpenAI GPT, Google Gemini and any OpenAI-compatible endpoint like Ollama or vLLM. No configuration needed for built-in providers.

## Built-in Providers

| Provider          | Model patterns | API key env var     | Docs                                                     |
| ----------------- | -------------- | ------------------- | -------------------------------------------------------- |
| **Anthropic**     | `claude-*`     | `ANTHROPIC_API_KEY` | [anthropic.com](https://docs.anthropic.com/)             |
| **OpenAI**        | `gpt-*`, `o*`  | `OPENAI_API_KEY`    | [platform.openai.com](https://platform.openai.com/docs/) |
| **Google Gemini** | `gemini-*`     | `GOOGLE_API_KEY`    | [ai.google.dev](https://ai.google.dev/docs)              |

## OpenAI-compatible (Ollama, vLLM, LM Studio)

Any endpoint that implements the OpenAI Chat Completions API works:

```yaml
spec:
  model: qwen2.5:7b
  envFrom:
    - configMapRef:
        name: ollama-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ollama-config
data:
  AGENT_PROVIDER: openai
  OPENAI_BASE_URL: http://host.docker.internal:11434/v1
  OPENAI_API_KEY: "unused"
```

| Endpoint     | OPENAI_BASE_URL                                               |
| ------------ | ------------------------------------------------------------- |
| Ollama       | `http://host.docker.internal:11434/v1`                        |
| vLLM         | `http://vllm.svc:8000/v1`                                     |
| LM Studio    | `http://host.docker.internal:1234/v1`                         |
| Azure OpenAI | `https://<name>.openai.azure.com/openai/deployments/<deploy>` |

## Override auto-detection

Set `AGENT_PROVIDER` explicitly:

```yaml
envFrom:
  - configMapRef:
      name: provider-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: provider-config
data:
  AGENT_PROVIDER: openai # auto | anthropic | openai | gemini | mock
```

## Custom providers (gRPC plugin)

For providers without built-in support (AWS Bedrock, custom endpoints), deploy a gRPC service implementing the `LLMProvider` proto contract:

```yaml
spec:
  plugins:
    llm:
      address: bedrock-proxy.svc:50051
```

See [gRPC Plugins](/advanced/grpc-plugins) for details.
