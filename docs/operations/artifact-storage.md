---
sidebar_position: 7
sidebar_label: "Artifact Storage"
description: "kubeswarm artifact storage - S3-compatible backends for storing and passing file artifacts between agent pipeline steps on Kubernetes."
---

# Artifact Storage

kubeswarm SwarmTeam pipelines can store and pass file artifacts between steps using S3-compatible backends on Kubernetes.

## Supported Backends

| Backend | Endpoint | Auth |
|---------|----------|------|
| **S3** | AWS S3 | Instance role, IRSA, or access key Secret |
| **S3-compatible** | MinIO, Ceph, Wasabi, etc. | Access key Secret + custom endpoint |
| **Local (file://)** | Node-local PVC | PVC mounted into agent pods |

S3-compatible endpoints cover most cloud providers. Use the `endpoint` parameter to point at any S3-compatible API (including GCS via its S3 interoperability endpoint).

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

### S3 URL format

The operator resolves the artifact store to a URL injected as `AGENT_ARTIFACT_STORE_URL`:

```
s3://bucket/prefix?region=us-east-1&endpoint=http://minio:9000
```

- `region` and `endpoint` are optional
- `endpoint` enables S3-compatible services (MinIO, Ceph, Wasabi)
- `UsePathStyle` is set automatically when a custom endpoint is provided

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

Artifact URLs use the store scheme: `s3://bucket/prefix/run/step/file`.

## Local Development

For `swarm run` (CLI), the `file://` backend writes to a local directory without any cloud credentials:

```yaml
spec:
  artifactStore:
    type: file
    file:
      path: /tmp/artifacts
```

For Kubernetes, `file://` requires a PVC mounted into agent pods via `spec.artifactStore.local.claimName`.
