---
sidebar_position: 8
sidebar_label: "Artifact Storage"
description: "kubeswarm artifact storage - S3 and GCS backends for storing and passing file artifacts between agent pipeline steps on Kubernetes."
---

# kubeswarm Artifact Storage - S3 and GCS for Agent Pipelines

kubeswarm SwarmTeam pipelines can store and pass file artifacts between steps using S3 or GCS backends on Kubernetes.

## Supported Backends

| Backend | Endpoint                       | Auth                             |
| ------- | ------------------------------ | -------------------------------- |
| **S3**  | Any S3-compatible (AWS, MinIO) | Secret with access key           |
| **GCS** | Google Cloud Storage           | Secret with service account JSON |

## Configuration

```yaml
spec:
  artifactStore:
    type: s3
    s3:
      bucket: swarm-artifacts
      region: us-east-1
      endpoint: http://minio.kubeswarm-system:9000 # omit for AWS S3
      credentialsSecret:
        name: s3-credentials
```

## Pipeline Usage

Steps declare output artifacts and reference other steps' artifacts:

```yaml
pipeline:
  - role: analyst
    outputArtifacts:
      - name: report.md
        contentType: text/markdown
  - role: reviewer
    dependsOn: [analyst]
    inputArtifacts:
      report: "{{ .steps.analyst.artifacts.report.md }}"
```
