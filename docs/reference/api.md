---
id: api
title: API Reference
sidebar_position: 1
description: Complete field reference for all kubeswarm/v1alpha1 CRDs.
---

# API Reference

## Packages
- [kubeswarm.io/v1alpha1](#kubeswarmiov1alpha1)


## kubeswarm.io/v1alpha1

Package v1alpha1 contains API Schema definitions for the kubeswarm v1alpha1 API group.

### Resource Types
- [SwarmAgent](#swarmagent)
- [SwarmAgentList](#swarmagentlist)
- [SwarmBudget](#swarmbudget)
- [SwarmBudgetList](#swarmbudgetlist)
- [SwarmEvent](#swarmevent)
- [SwarmEventList](#swarmeventlist)
- [SwarmMemory](#swarmmemory)
- [SwarmMemoryList](#swarmmemorylist)
- [SwarmNotify](#swarmnotify)
- [SwarmNotifyList](#swarmnotifylist)
- [SwarmPolicy](#swarmpolicy)
- [SwarmPolicyList](#swarmpolicylist)
- [SwarmRegistry](#swarmregistry)
- [SwarmRegistryList](#swarmregistrylist)
- [SwarmRun](#swarmrun)
- [SwarmRunList](#swarmrunlist)
- [SwarmSettings](#swarmsettings)
- [SwarmSettingsList](#swarmsettingslist)
- [SwarmTeam](#swarmteam)
- [SwarmTeamList](#swarmteamlist)



#### AdvisorConnectionStatus



AdvisorConnectionStatus reports the health of one advisor connection.



_Appears in:_
- [SwarmAgentStatus](#swarmagentstatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name matches the AgentConnection name. |  |  |
| `ready` _boolean_ | Ready indicates the advisor agent exists and has ready replicas. |  |  |
| `toolInjected` _boolean_ | ToolInjected indicates the consult_&lt;name&gt; tool was successfully<br />added to the executor's tool list. |  |  |
| `toolName` _string_ | ToolName is the resolved tool name (consult_&lt;name&gt; or override). |  |  |
| `lastTransitionTime` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastTransitionTime is the last time Ready changed. |  |  |


#### AgentArtifactsConfig



AgentArtifactsConfig controls automatic artifact saving for completed tasks.



_Appears in:_
- [AgentRuntime](#agentruntime)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `saveOutput` _boolean_ | SaveOutput automatically writes the task's final output to the artifact<br />directory after each task completes. The file is named "output" with the<br />extension determined by Format (e.g. output.txt, output.json).<br />collectArtifacts then uploads it to the configured artifact store. |  | Optional: true <br /> |
| `format` _[ArtifactFormat](#artifactformat)_ | Format controls the file extension and content type of the saved output. | text | Enum: [text json markdown yaml] <br />Optional: true <br /> |


#### AgentCapability



AgentCapability advertises one capability this agent offers to SwarmRegistry and the MCP gateway.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name uniquely identifies this capability. Used for registry lookups and MCP tool naming. |  | MinLength: 1 <br />Required: true <br /> |
| `description` _string_ | Description explains the capability to human operators and LLM consumers. |  | Optional: true <br /> |
| `tags` _string array_ | Tags enable coarse-grained filtering in registry lookups.<br />A lookup matches agents that declare ALL listed tags. |  | MaxItems: 100 <br />Optional: true <br /> |
| `exposeMCP` _boolean_ | ExposeMCP registers this capability as a named tool at the MCP gateway endpoint<br />for this agent. Requires the MCP gateway to be enabled in the operator. | false | Optional: true <br /> |
| `inputSchema` _[RawExtension](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#rawextension-runtime-pkg)_ | InputSchema is a JSON Schema object describing the capability's input parameters.<br />Stored as a raw YAML/JSON object; enables CRD validation and tooling introspection. |  | Optional: true <br /> |
| `outputSchema` _[RawExtension](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#rawextension-runtime-pkg)_ | OutputSchema is a JSON Schema object describing the capability's output shape. |  | Optional: true <br /> |


#### AgentConnection



AgentConnection defines another agent callable as a tool via A2A.
Exactly one of agentRef or capabilityRef must be set.

Constraint matrix:

	C1: exactly one of agentRef or capabilityRef
	C2: advisor role requires agentRef and forbids capabilityRef
	C3: contextPropagation only valid with advisor role



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the local identifier for this agent connection.<br />Used in guardrails.tools allow/deny patterns: "&lt;name&gt;/&lt;capability&gt;". |  | MinLength: 1 <br />Required: true <br /> |
| `agentRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | AgentRef names a SwarmAgent in the same namespace whose MCP-exposed<br />capabilities are made available as tools. The target must have at least<br />one capability with exposeMCP: true. |  | Optional: true <br /> |
| `capabilityRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | CapabilityRef names a capability ID in the namespace's SwarmRegistry.<br />The operator resolves the MCP gateway URL at reconcile time. |  | Optional: true <br /> |
| `trust` _[ToolTrustLevel](#tooltrustlevel)_ | Trust classifies the trust level of this agent connection.<br />Defaults to guardrails.tools.trust.default when unset. |  | Enum: [internal external sandbox] <br />Optional: true <br /> |
| `instructions` _string_ | Instructions is operational context injected into the agent's system prompt<br />for calls to this agent. Use to constrain scope or set expectations. |  | Optional: true <br /> |
| `role` _[AgentConnectionRole](#agentconnectionrole)_ | Role defines the operational mode. "tool" (default) behaves as today.<br />"advisor" enables context propagation and auto-injects a consult_&lt;name&gt;<br />tool into the executor's tool list. | tool | Enum: [tool advisor] <br />Optional: true <br /> |
| `contextPropagation` _[ContextPropagationConfig](#contextpropagationconfig)_ | ContextPropagation configures how conversation context is forwarded to<br />an advisor agent. Only valid when role is "advisor". |  | Optional: true <br /> |


#### AgentConnectionRole

_Underlying type:_ _string_

AgentConnectionRole defines the operational mode of an agent connection.
"tool" (default): the agent is exposed as regular MCP tools, same as today.
"advisor": enables context propagation and auto-injects a consult_&lt;name&gt;
tool into the executor's tool list.

_Validation:_
- Enum: [tool advisor]

_Appears in:_
- [AgentConnection](#agentconnection)

| Field | Description |
| --- | --- |
| `tool` | AgentConnectionRoleTool is the default mode - the agent is exposed as regular MCP tools.<br /> |
| `advisor` | AgentConnectionRoleAdvisor enables context propagation and auto-injects a consult_&lt;name&gt; tool.<br /> |


#### AgentFleetEntry



AgentFleetEntry is one agent's summary in the registry fleet view.



_Appears in:_
- [SwarmRegistryStatus](#swarmregistrystatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the SwarmAgent name. |  |  |
| `model` _string_ | Model is the LLM model this agent is configured to use. |  |  |
| `readyReplicas` _integer_ | ReadyReplicas is the number of agent pods currently ready. |  |  |
| `dailyTokens` _integer_ | DailyTokens is the rolling 24h token usage copied from SwarmAgent.status. |  | Optional: true <br /> |
| `capabilities` _string array_ | Capabilities lists the capability IDs this agent contributes to the index. |  | MaxItems: 200 <br />Optional: true <br /> |


#### AgentGuardrails



AgentGuardrails groups tool permissions, budget reference, and execution limits.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `tools` _[ToolPermissions](#toolpermissions)_ | Tools configures allow/deny lists and trust policy for tool calls. |  | Optional: true <br /> |
| `budgetRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | BudgetRef references a SwarmBudget that governs token spend for this agent.<br />When the budget is exhausted new tasks are rejected. |  | Optional: true <br /> |
| `limits` _[GuardrailLimits](#guardraillimits)_ | Limits constrains per-agent resource and cost usage. |  | Optional: true <br /> |


#### AgentHealthCheck



AgentHealthCheck defines how agent health is evaluated.



_Appears in:_
- [AgentObservability](#agentobservability)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `type` _[HealthCheckType](#healthchecktype)_ | Type is the probe strategy. | semantic | Enum: [semantic ping] <br /> |
| `intervalSeconds` _integer_ | IntervalSeconds is how often the probe runs. | 30 | Optional: true <br /> |
| `prompt` _string_ | Prompt is the message sent when type is semantic. |  | Optional: true <br /> |
| `notifyRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | NotifyRef references a SwarmNotify policy used for AgentDegraded events. |  | Optional: true <br /> |


#### AgentInfrastructure



AgentInfrastructure groups cluster integration concerns for the agent.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `registryRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | RegistryRef names the SwarmRegistry this agent registers into.<br />Defaults to "default". Omit to opt out of all registry indexing. |  | Optional: true <br /> |
| `networkPolicy` _[NetworkPolicyMode](#networkpolicymode)_ | NetworkPolicy controls the NetworkPolicy generated for agent pods.<br />default: DNS + Redis + open HTTPS egress.<br />strict:  DNS + Redis; HTTPS egress restricted to declared MCP server IPs.<br />disabled: no NetworkPolicy generated (use when CNI manages policy externally). | default | Enum: [default strict disabled] <br />Optional: true <br /> |
| `apiKeyRef` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | APIKeyRef injects an LLM provider API key from a native Kubernetes Secret.<br />The key is set as the environment variable named by the Secret key<br />(e.g. key "ANTHROPIC_API_KEY" in Secret "my-keys" sets ANTHROPIC_API_KEY).<br />For multiple keys or complex setups, use envFrom instead. |  | Optional: true <br /> |
| `envFrom` _[EnvFromSource](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#envfromsource-v1-core) array_ | EnvFrom injects environment variables from Secrets or ConfigMaps into agent pods.<br />Entries listed here take precedence over the global kubeswarm-api-keys Secret. |  | Optional: true <br /> |
| `plugins` _[AgentPlugins](#agentplugins)_ | Plugins configures external gRPC provider or queue overrides (RFC-0025). |  | Optional: true <br /> |


#### AgentLogging



AgentLogging controls structured log emission from the agent runtime.
All logs are emitted as JSON via slog.



_Appears in:_
- [AgentObservability](#agentobservability)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `level` _[LogLevel](#loglevel)_ | Level is the minimum log level emitted. | info | Enum: [debug info warn error] <br />Optional: true <br /> |
| `toolCalls` _boolean_ | ToolCalls enables structured logging of tool invocations: tool name, args, and result.<br />Emits log lines with msg="tool_call". Disabled by default to avoid noisy logs. |  | Optional: true <br /> |
| `llmTurns` _boolean_ | LLMTurns enables logging of the full LLM message history per task.<br />Verbose and potentially sensitive - enable only for debugging. |  | Optional: true <br /> |
| `redaction` _[LogRedactionPolicy](#logredactionpolicy)_ | Redaction controls scrubbing of sensitive values from log output. |  | Optional: true <br /> |


#### AgentLoopMemory



AgentLoopMemory configures vector memory read/write within the tool-use loop.
Requires a SwarmMemory with a vector backend referenced via ref.



_Appears in:_
- [AgentLoopPolicy](#agentlooppolicy)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `ref` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | Ref references the SwarmMemory object providing the vector backend. |  | Optional: true <br /> |
| `store` _boolean_ | Store enables writing a summary of each tool result to the vector store after execution. |  | Optional: true <br /> |
| `retrieve` _boolean_ | Retrieve enables fetching similar prior findings from the vector store before each tool call.<br />Findings are injected as a &lt;swarm:prior-findings&gt; block with the tool result. |  | Optional: true <br /> |
| `topK` _integer_ | TopK is the maximum number of prior findings injected per tool call. | 3 | Optional: true <br /> |
| `minSimilarityPercent` _integer_ | MinSimilarityPercent is the minimum cosine similarity percentage for a retrieved<br />finding to be injected. Findings below this threshold are silently dropped.<br />Must be between 0 and 100. Default 70. | 70 | Maximum: 100 <br />Minimum: 0 <br />Optional: true <br /> |
| `summaryTokens` _integer_ | SummaryTokens is the advisory token limit for per-result summaries stored in the vector store.<br />When > 0 a cheap model call produces the summary before storing.<br />When 0 the raw result is truncated to MaxTokens instead. | 256 | Optional: true <br /> |
| `maxTokens` _integer_ | MaxTokens is the hard truncation limit applied when SummaryTokens is 0. | 1024 | Optional: true <br /> |


#### AgentLoopPolicy



AgentLoopPolicy configures the agent runner's agentic loop behaviour.



_Appears in:_
- [AgentRuntime](#agentruntime)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `dedup` _boolean_ | Dedup skips tool calls whose fingerprint (tool name + args hash) was already<br />executed in the current task. The dedup set is task-local and discarded on completion. |  | Optional: true <br /> |
| `compression` _[LoopCompressionConfig](#loopcompressionconfig)_ | Compression configures in-loop context compression. When set, the runner summarises<br />older conversation turns when accumulated tokens exceed the threshold, allowing the<br />agent to run beyond the model's context window. |  | Optional: true <br /> |
| `memory` _[AgentLoopMemory](#agentloopmemory)_ | Memory configures vector memory read/write during the tool-use loop.<br />Requires a SwarmMemory with a vector backend referenced via memory.ref. |  | Optional: true <br /> |


#### AgentObservability



AgentObservability groups health check, logging, metrics, and audit configuration.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `healthCheck` _[AgentHealthCheck](#agenthealthcheck)_ | HealthCheck defines how agent health is evaluated and how degraded agents are alerted. |  | Optional: true <br /> |
| `logging` _[AgentLogging](#agentlogging)_ | Logging controls structured log emission from the agent runtime. |  | Optional: true <br /> |
| `auditLog` _[AuditLogConfig](#auditlogconfig)_ | AuditLog configures the structured audit trail.<br />When set, overrides namespace (SwarmSettings) and cluster (Helm) audit config. |  | Optional: true <br /> |
| `notifyRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | NotifyRef references a SwarmNotify policy for this agent's notifications.<br />Covers both health degradation alerts (AgentDegraded) and run completion<br />notifications (TeamSucceeded/TeamFailed) for standalone agent runs.<br />Takes precedence over healthCheck.notifyRef when both are set. |  | Optional: true <br /> |


#### AgentPlugins



AgentPlugins configures external gRPC plugin overrides for the LLM provider and task queue.
These are escape hatches for environments where the built-in providers are insufficient.
See RFC-0025.



_Appears in:_
- [AgentInfrastructure](#agentinfrastructure)
- [SwarmTeamRole](#swarmteamrole)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `llm` _[PluginEndpoint](#pluginendpoint)_ | LLM is the host:port of an external gRPC LLM provider plugin.<br />When set the agent uses the gRPC adapter instead of the built-in provider. |  | Optional: true <br /> |
| `queue` _[PluginEndpoint](#pluginendpoint)_ | Queue is the host:port of an external gRPC task queue plugin.<br />When set TASK_QUEUE_URL is ignored and the agent uses the gRPC queue adapter. |  | Optional: true <br /> |


#### AgentPrompt



AgentPrompt configures the agent's system prompt.
Exactly one of inline or from must be set.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)
- [SwarmTeamRole](#swarmteamrole)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `inline` _string_ | Inline is the system prompt text written directly in the manifest.<br />For long or frequently-iterated prompts prefer from. |  | Optional: true <br /> |
| `from` _[SystemPromptSource](#systempromptsource)_ | From references a ConfigMap or Secret key whose content is used as the system prompt.<br />Updating the referenced object triggers an automatic rolling restart of agent pods. |  | Optional: true <br /> |


#### AgentRuntime



AgentRuntime groups all execution concerns for the agent deployment.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)
- [SwarmTeamRole](#swarmteamrole)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `replicas` _integer_ | Replicas is the number of agent instances to run.<br />Ignored when autoscaling is set; autoscaling.minReplicas acts as the floor. | 1 | Maximum: 50 <br />Minimum: 0 <br />Optional: true <br /> |
| `autoscaling` _[SwarmAgentAutoscaling](#swarmagentautoscaling)_ | Autoscaling configures KEDA-based autoscaling. When set, replicas is ignored.<br />Requires KEDA v2 installed in the cluster. |  | Optional: true <br /> |
| `resources` _[ResourceRequirements](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#resourcerequirements-v1-core)_ | Resources sets CPU and memory requests/limits for agent pods.<br />When not set the operator injects safe defaults:<br />  requests: cpu=100m, memory=128Mi<br />  limits:   cpu=500m, memory=512Mi, ephemeral-storage=256Mi |  | Optional: true <br /> |
| `loop` _[AgentLoopPolicy](#agentlooppolicy)_ | Loop configures deep-research runtime features: semantic dedup, in-loop context<br />compression, and vector memory read/write. All features are disabled by default. |  | Optional: true <br /> |
| `artifacts` _[AgentArtifactsConfig](#agentartifactsconfig)_ | Artifacts configures automatic artifact saving for completed tasks. |  | Optional: true <br /> |
| `drainTimeoutSeconds` _integer_ | DrainTimeoutSeconds is the time to wait for in-flight tasks to complete during<br />pod shutdown (rolling update, scale-down). Maps to terminationGracePeriodSeconds<br />on the generated pod spec. Should be >= guardrails.limits.timeoutSeconds.<br />Default: 150 (2.5 minutes, giving a 120s task 30s of margin). | 150 | Maximum: 600 <br />Minimum: 30 <br />Optional: true <br /> |


#### AgentTools



AgentTools groups all tool connections available to the agent.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)
- [SwarmTeamRole](#swarmteamrole)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `mcp` _[MCPToolSpec](#mcptoolspec) array_ | MCP lists MCP server connections. Each entry exposes multiple tools<br />via the Model Context Protocol SSE transport. |  | MaxItems: 50 <br />Optional: true <br /> |
| `webhooks` _[WebhookToolSpec](#webhooktoolspec) array_ | Webhooks lists inline single-endpoint HTTP tools. |  | MaxItems: 50 <br />Optional: true <br /> |


#### ArtifactFormat

_Underlying type:_ _string_

ArtifactFormat identifies the output format for saved artifacts.

_Validation:_
- Enum: [text json markdown yaml]

_Appears in:_
- [AgentArtifactsConfig](#agentartifactsconfig)

| Field | Description |
| --- | --- |
| `text` |  |
| `json` |  |
| `markdown` |  |
| `yaml` |  |


#### ArtifactSpec



ArtifactSpec declares a named file artifact produced by a pipeline step.
The agent is expected to write the artifact file under $AGENT_ARTIFACT_DIR/&lt;name&gt;.



_Appears in:_
- [SwarmTeamPipelineStep](#swarmteampipelinestep)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the artifact identifier, used in template references:<br />\{\{ .steps.&lt;stepName&gt;.artifacts.&lt;name&gt; \}\} |  | MinLength: 1 <br />Required: true <br /> |
| `description` _string_ | Description documents the artifact for operators and tooling. |  | Optional: true <br /> |
| `contentType` _string_ | ContentType is the MIME type hint for the artifact (e.g. application/pdf). |  | Optional: true <br /> |


#### ArtifactStoreLocalSpec



ArtifactStoreLocalSpec configures a volume-backed local artifact store.
In Kubernetes, set ClaimName to mount a PersistentVolumeClaim into every agent pod
in the team. For single-process local runs (swarm run CLI), ClaimName is not needed
and Path is used as a plain directory on the local filesystem.



_Appears in:_
- [ArtifactStoreSpec](#artifactstorespec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `path` _string_ | Path is the mount path inside agent pods (and the directory path for swarm run).<br />Defaults to /artifacts in Kubernetes (when ClaimName is set) or<br />/tmp/swarm-artifacts for CLI runs. |  | Optional: true <br /> |
| `claimName` _string_ | ClaimName is the name of a PersistentVolumeClaim to mount at Path inside agent pods.<br />Required for Kubernetes deployments; omit for swarm run (CLI) local testing.<br />The PVC must support ReadWriteMany if multiple agent replicas run concurrently;<br />ReadWriteOnce is sufficient for single-replica agents. |  | Optional: true <br /> |


#### ArtifactStoreS3Spec



ArtifactStoreS3Spec configures Amazon S3 (or S3-compatible) artifact storage.



_Appears in:_
- [ArtifactStoreSpec](#artifactstorespec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `bucket` _string_ | Bucket is the S3 bucket name. |  | Required: true <br /> |
| `region` _string_ | Region is the AWS region (e.g. us-east-1). |  | Optional: true <br /> |
| `prefix` _string_ | Prefix is an optional key prefix applied to all stored artifacts. |  | Optional: true <br /> |
| `endpoint` _string_ | Endpoint is the S3-compatible endpoint URL for MinIO, Ceph, R2, etc.<br />When empty, the default AWS S3 endpoint is used. |  | Optional: true <br /> |
| `credentialsSecret` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | CredentialsSecret references a k8s Secret containing AWS_ACCESS_KEY_ID<br />and AWS_SECRET_ACCESS_KEY keys. When empty, the default credential chain<br />is used (instance roles, IRSA, env vars). |  | Optional: true <br /> |


#### ArtifactStoreSpec



ArtifactStoreSpec configures where pipeline file artifacts are stored.



_Appears in:_
- [SwarmTeamSpec](#swarmteamspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `type` _[ArtifactStoreType](#artifactstoretype)_ | Type selects the storage backend. |  | Enum: [local s3] <br />Required: true <br /> |
| `local` _[ArtifactStoreLocalSpec](#artifactstorelocalspec)_ | Local configures local-disk storage. Only used when type=local. |  | Optional: true <br /> |
| `s3` _[ArtifactStoreS3Spec](#artifactstores3spec)_ | S3 configures Amazon S3 (or S3-compatible) storage. Only used when type=s3. |  | Optional: true <br /> |


#### ArtifactStoreType

_Underlying type:_ _string_

ArtifactStoreType identifies the storage backend for file artifacts.

_Validation:_
- Enum: [local s3]

_Appears in:_
- [ArtifactStoreSpec](#artifactstorespec)

| Field | Description |
| --- | --- |
| `local` | ArtifactStoreLocal stores artifacts on the local filesystem (swarm run only).<br /> |
| `s3` | ArtifactStoreS3 stores artifacts in an Amazon S3 (or S3-compatible) bucket.<br /> |


#### AuditLogConfig



AuditLogConfig configures the structured audit trail for agent actions.
See RFC-0030 for the full design.



_Appears in:_
- [AgentObservability](#agentobservability)
- [SwarmSettingsSpec](#swarmsettingsspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `mode` _[AuditLogMode](#auditlogmode)_ | Mode controls the verbosity of audit logging.<br />off: no audit events emitted (default).<br />actions: emit structured action events.<br />verbose: emit action events plus full LLM conversation turns. | off | Enum: [off actions verbose] <br />Optional: true <br /> |
| `redact` _string array_ | Redact is a list of glob patterns for field path redaction.<br />Patterns use dot-separated paths matched via Go's path.Match,<br />where * matches exactly one path segment.<br />Example: "detail.input.*.apiKey" |  | MaxItems: 20 <br />Optional: true <br /> |


#### AuditLogMode

_Underlying type:_ _string_

AuditLogMode controls the verbosity of audit event emission.

_Validation:_
- Enum: [off actions verbose]

_Appears in:_
- [AuditLogConfig](#auditlogconfig)

| Field | Description |
| --- | --- |
| `off` | AuditLogModeOff disables audit logging (default).<br /> |
| `actions` | AuditLogModeActions emits structured action events (tool calls, delegations, lifecycle, budget).<br /> |
| `verbose` | AuditLogModeVerbose emits action events plus full LLM conversation turns (expensive).<br /> |


#### BearerAuth



BearerAuth configures bearer token authentication for an MCP server.
The token value is never inlined into the pod spec - it is injected as an env var.



_Appears in:_
- [MCPServerAuth](#mcpserverauth)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `secretKeyRef` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | SecretKeyRef selects the key of a Secret containing the bearer token. |  |  |


#### BudgetStatus

_Underlying type:_ _string_

BudgetStatus is the phase summary for an SwarmBudget.

_Validation:_
- Enum: [OK Warning Exceeded]

_Appears in:_
- [SwarmBudgetStatus](#swarmbudgetstatus)

| Field | Description |
| --- | --- |
| `OK` |  |
| `Warning` |  |
| `Exceeded` |  |


#### CircuitBreakerConfig



CircuitBreakerConfig configures the circuit breaker for LLM and tool calls.



_Appears in:_
- [GuardrailLimits](#guardraillimits)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `failureThreshold` _integer_ | FailureThreshold is consecutive failures before the circuit opens. Default 5. | 5 | Maximum: 100 <br />Minimum: 1 <br /> |
| `cooldownSeconds` _integer_ | CooldownSeconds is how long the circuit stays open. Default 30. | 30 | Maximum: 600 <br />Minimum: 1 <br /> |
| `halfOpenMaxCalls` _integer_ | HalfOpenMaxCalls is probe calls allowed in half-open state. Default 1. | 1 | Maximum: 10 <br />Minimum: 1 <br /> |


#### ConcurrencyPolicy

_Underlying type:_ _string_

ConcurrencyPolicy controls what happens when a trigger fires while a
previously dispatched pipeline is still running.

_Validation:_
- Enum: [Allow Forbid]

_Appears in:_
- [SwarmEventSpec](#swarmeventspec)

| Field | Description |
| --- | --- |
| `Allow` | ConcurrencyAllow always dispatches a new pipeline run, even if a previous one is still running.<br /> |
| `Forbid` | ConcurrencyForbid skips the fire if any pipeline owned by this trigger is still Running.<br /> |


#### ContextCompressConfig



ContextCompressConfig configures the compression LLM call.



_Appears in:_
- [StepContextPolicy](#stepcontextpolicy)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `targetTokens` _integer_ | TargetTokens is the advisory token budget for the compressed output.<br />0 means no explicit budget - the agent uses its own judgement. |  | Optional: true <br /> |
| `model` _string_ | Model is the model used for compression.<br />Defaults to the pipeline's configured model when unset.<br />A cheaper model (e.g. claude-haiku-4-5) is recommended. |  | Optional: true <br /> |
| `prompt` _string_ | Prompt overrides the system prompt sent to the compression LLM.<br />The placeholder "\{\{ .targetTokens \}\}" is available.<br />When unset, a built-in summarisation prompt is used. |  | Optional: true <br /> |


#### ContextPropagationConfig



ContextPropagationConfig controls how conversation context is forwarded
to an advisor agent.



_Appears in:_
- [AgentConnection](#agentconnection)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `recentMessages` _integer_ | RecentMessages is the number of recent conversation entries from the<br />executor's conversation to include in the advisor's context. | 20 | Maximum: 200 <br />Minimum: 1 <br />Optional: true <br /> |
| `maxCallsPerTask` _integer_ | MaxCallsPerTask caps how many times the executor can consult this<br />advisor in a single task execution attempt. The counter resets when<br />the task queue retries the task (new attempt = new counter). | 3 | Maximum: 50 <br />Minimum: 1 <br />Optional: true <br /> |
| `timeoutSeconds` _integer_ | TimeoutSeconds is the wall-clock timeout for an individual advisor<br />call, from initiation to final response byte. | 60 | Maximum: 300 <br />Minimum: 5 <br />Optional: true <br /> |
| `maxAdvisorTokensPerTask` _integer_ | MaxAdvisorTokensPerTask caps cumulative advisor input+output tokens<br />across all calls to this advisor within one execution attempt.<br />0 means no per-advisor limit (cost control deferred to SwarmBudget). | 0 | Minimum: 0 <br />Optional: true <br /> |
| `maxContextBytes` _integer_ | MaxContextBytes caps the serialised context payload. Oldest messages<br />are dropped to fit. Default 256KB. | 262144 | Maximum: 1.048576e+06 <br />Minimum: 1024 <br />Optional: true <br /> |
| `excludeSystemPrompt` _boolean_ | ExcludeSystemPrompt prevents the executor's system prompt from being<br />included in the context sent to the advisor. |  | Optional: true <br /> |
| `toolName` _string_ | ToolName overrides the auto-generated tool name. When empty, the<br />tool is named consult_&lt;sanitised_name&gt;. |  | MaxLength: 63 <br />Pattern: `^[a-z][a-z0-9_]*$` <br />Optional: true <br /> |


#### EffectivePolicySpec



EffectivePolicySpec is the merged result of all SwarmPolicies in the namespace.
Read-only, computed by the controller.



_Appears in:_
- [SwarmPolicyStatus](#swarmpolicystatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `limits` _[PolicyLimits](#policylimits)_ | Limits is the merged ceiling/floor result. |  | Optional: true <br /> |
| `toolDeny` _string array_ | ToolDeny is the union of all policy deny lists. |  | MaxItems: 100 <br />Optional: true <br /> |
| `forceTrustLevel` _[ToolTrustLevel](#tooltrustlevel)_ | ForceTrustLevel is the strictest trust level across all policies. |  | Enum: [internal external sandbox] <br />Optional: true <br /> |
| `minValidation` _[PolicyOutputLevel](#policyoutputlevel)_ | MinValidation is the strictest validation level across all policies. |  | Enum: [none pattern schema semantic] <br /> |
| `denyPatterns` _string array_ | DenyPatterns is the union of all policy output deny patterns. |  | MaxItems: 50 <br />Optional: true <br /> |
| `models` _[PolicyModels](#policymodels)_ | Models is the merged model restriction. |  | Optional: true <br /> |
| `requirements` _[PolicyRequirements](#policyrequirements)_ | Requirements is the merged boolean requirements (OR across policies). |  |  |
| `enforcementMode` _[PolicyEnforcementMode](#policyenforcementmode)_ | EnforcementMode is the strictest mode across all policies.<br />Enforce > Warn > Audit. |  | Enum: [Audit Warn Enforce] <br /> |


#### EmbeddingConfig



EmbeddingConfig configures the embedding model used to convert text into vectors
for the vector-store backend (RFC-0026). Required when backend is "vector-store"
and spec.vectorStore is set.



_Appears in:_
- [SwarmMemorySpec](#swarmmemoryspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `model` _string_ | Model is the embedding model ID.<br />Supported: text-embedding-3-small, text-embedding-3-large (OpenAI). |  | MinLength: 1 <br />Required: true <br /> |
| `provider` _string_ | Provider selects the embedding provider.<br />When "auto" (default), the provider is inferred from the model name. | auto | Enum: [auto openai] <br />Optional: true <br /> |
| `dimensions` _integer_ | Dimensions is the output vector dimension. When 0 the model default is used.<br />Use this to select a smaller dimension on models that support Matryoshka representations<br />(e.g. text-embedding-3-small supports 512 or 1536). |  | Optional: true <br /> |
| `apiKeyRef` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | APIKeyRef references a Secret key that holds the embedding provider API key.<br />When not set, the agent falls back to the same provider key used for the LLM<br />(OPENAI_API_KEY etc.). Required when the embedding provider differs from the LLM provider. |  | Optional: true <br /> |


#### GatewayConfig



GatewayConfig controls the scope and behavior of a gateway agent.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `registryRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | RegistryRef names the SwarmRegistry to query for capability discovery.<br />Required. The registry's spec.scope controls whether discovery is<br />namespace-scoped or cluster-wide. |  | Required: true <br /> |
| `filterByTags` _string array_ | FilterByTags filters discovery to capabilities matching ALL listed tags.<br />Empty means no tag filtering - all capabilities in the registry are visible.<br />Filters by AgentCapability.Tags values, not capability IDs. |  | MaxItems: 50 <br />Optional: true <br /> |
| `dispatchMode` _[GatewayDispatchMode](#gatewaydispatchmode)_ | DispatchMode controls whether the gateway can dispatch work to other agents.<br />"enabled" (default): registry_search and dispatch tools are both injected.<br />"disabled": only registry_search is injected; the gateway can search but not dispatch. | enabled | Enum: [enabled disabled] <br />Optional: true <br /> |
| `dispatchTimeoutSeconds` _integer_ | DispatchTimeoutSeconds is the maximum time the gateway will wait for<br />a single dispatched task to complete. | 120 | Maximum: 3600 <br />Minimum: 10 <br />Optional: true <br /> |
| `maxDispatchDepth` _integer_ | MaxDispatchDepth is the maximum dispatch chain depth per task. | 3 | Maximum: 10 <br />Minimum: 1 <br />Optional: true <br /> |
| `maxResultsPerSearch` _integer_ | MaxResultsPerSearch caps how many capabilities registry_search returns<br />to the LLM per call. | 10 | Maximum: 50 <br />Minimum: 1 <br />Optional: true <br /> |
| `maxDispatchCalls` _integer_ | MaxDispatchCalls caps how many times the LLM can call dispatch in a single task. | 5 | Maximum: 20 <br />Minimum: 1 <br />Optional: true <br /> |
| `maxSearchCalls` _integer_ | MaxSearchCalls caps how many times the LLM can call registry_search in a single task. | 3 | Maximum: 20 <br />Minimum: 1 <br />Optional: true <br /> |
| `fallback` _[GatewayFallback](#gatewayfallback)_ | Fallback controls what happens when no capability matches.<br />When nil, defaults to answer-directly behavior. |  | Optional: true <br /> |
| `allowedTargets` _string array_ | AllowedTargets restricts which agents the gateway can dispatch to.<br />Entries are SwarmAgent names. When empty, all non-gateway agents<br />discoverable via the registry are allowed. |  | MaxItems: 100 <br />Optional: true <br /> |
| `allowGatewayTargets` _boolean_ | AllowGatewayTargets permits dispatching to other gateway agents.<br />When false (default), the operator excludes agents with spec.gateway<br />set from the capability list. | false | Optional: true <br /> |


#### GatewayDispatchMode

_Underlying type:_ _string_

GatewayDispatchMode controls whether a gateway agent can dispatch work.

_Validation:_
- Enum: [enabled disabled]

_Appears in:_
- [GatewayConfig](#gatewayconfig)

| Field | Description |
| --- | --- |
| `enabled` | GatewayDispatchEnabled injects both registry_search and dispatch tools.<br /> |
| `disabled` | GatewayDispatchDisabled injects only registry_search (search-only gateway).<br /> |


#### GatewayFallback



GatewayFallback controls behavior when no capability matches the user's request.



_Appears in:_
- [GatewayConfig](#gatewayconfig)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `mode` _[GatewayFallbackMode](#gatewayfallbackmode)_ | Mode determines the fallback behavior. | answer-directly | Enum: [fail answer-directly agent] <br /> |
| `agentRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | AgentRef names the fallback agent to dispatch to when Mode is "agent".<br />Required when Mode is "agent", ignored otherwise. |  | Optional: true <br /> |


#### GatewayFallbackMode

_Underlying type:_ _string_

GatewayFallbackMode controls behavior when no capability matches a user's request.

_Validation:_
- Enum: [fail answer-directly agent]

_Appears in:_
- [GatewayFallback](#gatewayfallback)

| Field | Description |
| --- | --- |
| `fail` | GatewayFallbackFail returns an error to the caller.<br /> |
| `answer-directly` | GatewayFallbackAnswerDirectly lets the gateway respond using its own model.<br /> |
| `agent` | GatewayFallbackAgent dispatches to a specific fallback agent.<br /> |


#### GatewayStatus



GatewayStatus reports gateway-specific observable state beyond conditions.



_Appears in:_
- [SwarmAgentStatus](#swarmagentstatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `routableCapabilities` _integer_ | RoutableCapabilities is the count of capabilities injected into the<br />gateway pod after tag filtering, readiness checks, and the 50-entry cap. |  | Optional: true <br /> |
| `totalMatchingCapabilities` _integer_ | TotalMatchingCapabilities is the count before the 50-entry cap. |  | Optional: true <br /> |
| `lastCapabilitySync` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastCapabilitySync is the time the operator last updated the<br />gateway's capability list. |  | Optional: true <br /> |


#### GuardrailLimits



GuardrailLimits constrains per-agent resource and cost usage.



_Appears in:_
- [AgentGuardrails](#agentguardrails)
- [SwarmTeamRole](#swarmteamrole)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `tokensPerCall` _integer_ | TokensPerCall is the maximum number of tokens per LLM API call. | 8000 | Optional: true <br /> |
| `concurrentTasks` _integer_ | ConcurrentTasks is the maximum number of tasks processed in parallel per replica. | 5 | Optional: true <br /> |
| `timeoutSeconds` _integer_ | TimeoutSeconds is the per-task deadline in seconds. | 120 | Optional: true <br /> |
| `dailyTokens` _integer_ | DailyTokens is the rolling 24-hour token budget (input + output combined).<br />When reached the operator scales replicas to 0 and sets a BudgetExceeded condition.<br />Resumes automatically when the 24-hour window rotates. Zero means no daily limit. |  | Minimum: 1 <br />Optional: true <br /> |
| `retries` _integer_ | Retries is the number of times a failed task is requeued before dead-lettering.<br />Set to 0 to disable retries entirely. | 3 | Maximum: 100 <br />Minimum: 0 <br />Optional: true <br /> |
| `maxThinkingTokensPerCall` _integer_ | MaxThinkingTokensPerCall caps thinking tokens per LLM call (per turn,<br />not per step). The runtime enforces this provider-aware: Anthropic<br />clamps spec.reasoning.budgetTokens down to this ceiling; OpenAI<br />downgrades the effort level. Nil means no cap. |  | Maximum: 200000 <br />Minimum: 1 <br />Optional: true <br /> |
| `maxAnswerTokensPerCall` _integer_ | MaxAnswerTokensPerCall caps answer tokens per LLM call (per turn).<br />Nil means no cap. |  | Maximum: 200000 <br />Minimum: 1 <br />Optional: true <br /> |
| `circuitBreaker` _[CircuitBreakerConfig](#circuitbreakerconfig)_ | CircuitBreaker configures the circuit breaker for LLM and tool calls. |  | Optional: true <br /> |


#### HealthCheckType

_Underlying type:_ _string_

HealthCheckType is the strategy used to evaluate agent health.

_Validation:_
- Enum: [semantic ping]

_Appears in:_
- [AgentHealthCheck](#agenthealthcheck)

| Field | Description |
| --- | --- |
| `semantic` | HealthCheckSemantic sends a prompt to the agent and evaluates the response via LLM.<br /> |
| `ping` | HealthCheckPing sends an HTTP request to the agent's health endpoint.<br /> |


#### IndexedCapability



IndexedCapability is one capability entry in the SwarmRegistry status index.



_Appears in:_
- [SwarmRegistryStatus](#swarmregistrystatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `id` _string_ | ID is the capability identifier. |  |  |
| `description` _string_ | Description is the human-readable description of the capability, taken from the<br />first agent that declares it. Used by the router LLM to select the right agent. |  |  |
| `agents` _string array_ | Agents is the list of SwarmAgent names that advertise this capability. |  | MaxItems: 1000 <br /> |
| `tags` _string array_ | Tags is the union of all tags declared for this capability across all agents. |  | MaxItems: 100 <br /> |


#### LogLevel

_Underlying type:_ _string_

LogLevel is the minimum log level emitted by the agent runtime.

_Validation:_
- Enum: [debug info warn error]

_Appears in:_
- [AgentLogging](#agentlogging)

| Field | Description |
| --- | --- |
| `debug` |  |
| `info` |  |
| `warn` |  |
| `error` |  |


#### LogRedactionPolicy



LogRedactionPolicy controls what is scrubbed from agent runtime logs.



_Appears in:_
- [AgentLogging](#agentlogging)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `secrets` _boolean_ | Secrets scrubs values sourced from secretKeyRef from tool call args and results. | true | Optional: true <br /> |
| `pii` _boolean_ | PII scrubs common PII patterns (email addresses, IP addresses, phone numbers)<br />from tool call args and results. |  | Optional: true <br /> |


#### LoopCompressionConfig



LoopCompressionConfig controls when and how the runner compresses accumulated context.



_Appears in:_
- [AgentLoopPolicy](#agentlooppolicy)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `thresholdPercent` _integer_ | ThresholdPercent is the percentage of the resolved context window at which<br />compression is triggered. Must be between 50 and 95. Default 75. | 75 | Maximum: 95 <br />Minimum: 50 <br />Optional: true <br /> |
| `preserveRecentTurns` _integer_ | PreserveRecentTurns is the number of most recent turns kept verbatim during<br />compression. The system prompt is always preserved. | 4 | Optional: true <br /> |
| `model` _string_ | Model is the model used for the compression call.<br />A cheap fast model is recommended (e.g. claude-haiku-4-5-20251001).<br />Defaults to claude-haiku-4-5-20251001 when unset. |  | Optional: true <br /> |
| `timeoutSeconds` _integer_ | TimeoutSeconds is the maximum time allowed for the compression model call.<br />If exceeded compression is skipped and a CompressionTimeout warning event is recorded. | 30 | Optional: true <br /> |
| `contextWindow` _integer_ | ContextWindow explicitly sets the model's context window size in tokens.<br />When set, overrides provider metadata and the built-in model map.<br />Useful for custom or private model endpoints. |  | Optional: true <br /> |
| `instructions` _string_ | Instructions overrides the built-in system prompt for the compression call. |  | Optional: true <br /> |


#### LoopSpec



LoopSpec defines loop behaviour for a pipeline step.



_Appears in:_
- [SwarmTeamPipelineStep](#swarmteampipelinestep)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `condition` _string_ | Condition is a Go template expression evaluated after each iteration.<br />The step repeats while this evaluates to a truthy value ("true", non-empty, non-"false", non-"0").<br />Example: "\{\{ gt (len .steps.collect.output) 0 \}\}" |  | Required: true <br /> |
| `maxIterations` _integer_ | MaxIterations caps the number of loop repetitions to prevent infinite loops. | 10 | Maximum: 100 <br />Minimum: 1 <br /> |


#### MCPBinding



MCPBinding maps a capability ID to the MCP server URL that provides it in this deployment.
Used to resolve MCPServerSpec.capabilityRef at reconcile time so that shared agent
definitions (e.g. from cookbook) remain URL-free.



_Appears in:_
- [SwarmRegistrySpec](#swarmregistryspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `capabilityId` _string_ | CapabilityID is the capability identifier to resolve.<br />Must match MCPServerSpec.capabilityRef on the referencing agent. |  | MinLength: 1 <br />Required: true <br /> |
| `url` _string_ | URL is the SSE endpoint of the MCP server that provides this capability. |  | MinLength: 1 <br />Required: true <br /> |


#### MCPDiscoveryConfig



MCPDiscoveryConfig configures dynamic tool discovery for an MCP server.



_Appears in:_
- [MCPToolSpec](#mcptoolspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `dynamic` _boolean_ | Dynamic enables runtime tool list refresh. Default false. |  |  |
| `pollIntervalSeconds` _integer_ | PollIntervalSeconds is the fallback polling interval when the server<br />does not support list_changed notifications. Default 300. 0 disables polling. |  | Maximum: 3600 <br />Minimum: 0 <br /> |


#### MCPHeader



MCPHeader defines a single HTTP header sent with every request to an MCP server.
Exactly one of value or secretKeyRef must be set.



_Appears in:_
- [MCPToolSpec](#mcptoolspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the HTTP header name. |  | MinLength: 1 <br />Required: true <br /> |
| `value` _string_ | Value is a literal header value. Use for non-sensitive headers. |  | Optional: true <br /> |
| `secretKeyRef` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | SecretKeyRef selects a key of a Secret for sensitive header values. |  | Optional: true <br /> |


#### MCPServerAuth



MCPServerAuth configures authentication for a single MCP server connection.
Exactly one of bearer or mtls must be set.



_Appears in:_
- [MCPToolSpec](#mcptoolspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `bearer` _[BearerAuth](#bearerauth)_ | Bearer configures Authorization: Bearer token authentication. |  | Optional: true <br /> |
| `mtls` _[MTLSAuth](#mtlsauth)_ | MTLS configures mTLS client certificate authentication. |  | Optional: true <br /> |


#### MCPToolSpec



MCPToolSpec defines one MCP server connection available to the agent.
Exactly one of url or capabilityRef must be set.



_Appears in:_
- [AgentTools](#agenttools)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is a unique identifier for this MCP server within the agent.<br />Used in guardrails.tools allow/deny patterns: "&lt;name&gt;/&lt;tool&gt;". |  | MinLength: 1 <br />Required: true <br /> |
| `url` _string_ | URL is the direct SSE endpoint of the MCP server.<br />Mutually exclusive with capabilityRef. |  | Optional: true <br /> |
| `capabilityRef` _string_ | CapabilityRef names a capability ID in the namespace's SwarmRegistry.<br />The operator resolves the actual MCP server URL at reconcile time.<br />Use this in shareable agent definitions so the URL is supplied per-deployment.<br />Mutually exclusive with url. |  | Optional: true <br /> |
| `trust` _[ToolTrustLevel](#tooltrustlevel)_ | Trust classifies the trust level of this MCP server.<br />Defaults to the guardrails.tools.trust.default when unset. |  | Enum: [internal external sandbox] <br />Optional: true <br /> |
| `instructions` _string_ | Instructions is operational context injected into the agent's system prompt<br />for this tool server. Use for deployment-specific constraints (branch, project key,<br />environment). General tool documentation belongs in the MCP tool's own description. |  | Optional: true <br /> |
| `auth` _[MCPServerAuth](#mcpserverauth)_ | Auth configures authentication for this MCP server.<br />When not set the connection is unauthenticated. |  | Optional: true <br /> |
| `headers` _[MCPHeader](#mcpheader) array_ | Headers is a list of HTTP headers sent with every request to this MCP server. |  | Optional: true <br /> |
| `discovery` _[MCPDiscoveryConfig](#mcpdiscoveryconfig)_ | Discovery configures dynamic tool list refresh for this MCP server.<br />When dynamic is true, the agent re-discovers tools at runtime. |  | Optional: true <br /> |


#### MTLSAuth



MTLSAuth configures mTLS client certificate authentication for an MCP server.
The Secret is mounted as a read-only volume inside the agent pod.
It must contain tls.crt, tls.key, and optionally ca.crt.



_Appears in:_
- [MCPServerAuth](#mcpserverauth)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `secretRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | SecretRef names the Secret containing the TLS credentials. |  |  |


#### MemoryBackend

_Underlying type:_ _string_

MemoryBackend defines the memory storage strategy for an agent.

_Validation:_
- Enum: [in-context vector-store redis]

_Appears in:_
- [SwarmMemorySpec](#swarmmemoryspec)
- [SwarmSettingsSpec](#swarmsettingsspec)

| Field | Description |
| --- | --- |
| `in-context` |  |
| `vector-store` |  |
| `redis` |  |


#### NetworkPolicyMode

_Underlying type:_ _string_

NetworkPolicyMode controls how the operator generates a NetworkPolicy for agent pods.

_Validation:_
- Enum: [default strict disabled]

_Appears in:_
- [AgentInfrastructure](#agentinfrastructure)

| Field | Description |
| --- | --- |
| `default` | NetworkPolicyModeDefault allows DNS, Redis, and open HTTPS egress.<br /> |
| `strict` | NetworkPolicyModeStrict allows DNS and Redis egress only; HTTPS egress is restricted<br />to the resolved IPs of declared MCP servers.<br /> |
| `disabled` | NetworkPolicyModeDisabled skips NetworkPolicy generation entirely.<br />Use when the cluster CNI (Cilium, Calico) manages network policy externally.<br /> |


#### NotifyChannelSpec



NotifyChannelSpec defines a single notification channel.



_Appears in:_
- [SwarmNotifySpec](#swarmnotifyspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `type` _[NotifyChannelType](#notifychanneltype)_ | Type determines the channel implementation. |  | Enum: [webhook slack] <br /> |
| `webhook` _[WebhookChannelSpec](#webhookchannelspec)_ | Webhook configures a generic HTTP POST channel. Required when type is "webhook". |  | Optional: true <br /> |
| `slack` _[SlackChannelSpec](#slackchannelspec)_ | Slack configures a Slack incoming webhook channel. Required when type is "slack". |  | Optional: true <br /> |
| `template` _string_ | Template is an optional Go template for the message body.<br />Context is NotifyPayload. Overrides the channel's default format.<br />For "webhook": template output is the raw POST body.<br />For "slack": template output replaces the default Block Kit message text. |  | Optional: true <br /> |


#### NotifyChannelType

_Underlying type:_ _string_

NotifyChannelType determines which channel implementation to use.

_Validation:_
- Enum: [webhook slack]

_Appears in:_
- [NotifyChannelSpec](#notifychannelspec)

| Field | Description |
| --- | --- |
| `webhook` |  |
| `slack` |  |


#### NotifyDispatchResult



NotifyDispatchResult records the most recent dispatch attempt for one channel.



_Appears in:_
- [SwarmNotifyStatus](#swarmnotifystatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `channelIndex` _integer_ | ChannelIndex is the zero-based index of the channel in spec.channels. |  |  |
| `lastFiredAt` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastFiredAt is when the most recent dispatch attempt was made. |  | Optional: true <br /> |
| `lastEvent` _[NotifyEvent](#notifyevent)_ | LastEvent is the event type that triggered the most recent dispatch. |  | Enum: [TeamSucceeded TeamFailed TeamTimedOut BudgetWarning BudgetExceeded DailyLimitReached AgentDegraded] <br />Optional: true <br /> |
| `succeeded` _boolean_ | Succeeded is false when all retry attempts failed. |  |  |
| `error` _string_ | Error is the last error message when Succeeded is false. |  | Optional: true <br /> |


#### NotifyEvent

_Underlying type:_ _string_

NotifyEvent is the type of event that triggers a notification.

_Validation:_
- Enum: [TeamSucceeded TeamFailed TeamTimedOut BudgetWarning BudgetExceeded DailyLimitReached AgentDegraded]

_Appears in:_
- [NotifyDispatchResult](#notifydispatchresult)
- [SwarmNotifySpec](#swarmnotifyspec)

| Field | Description |
| --- | --- |
| `TeamSucceeded` |  |
| `TeamFailed` |  |
| `TeamTimedOut` |  |
| `BudgetWarning` |  |
| `BudgetExceeded` |  |
| `DailyLimitReached` |  |
| `AgentDegraded` |  |


#### OnFailureAction

_Underlying type:_ _string_

StepValidation configures output validation for a pipeline step.
At least one of Contains, Schema, or Semantic must be set.
OnFailureAction controls what happens when step validation fails.

_Validation:_
- Enum: [fail retry]

_Appears in:_
- [StepValidation](#stepvalidation)

| Field | Description |
| --- | --- |
| `fail` | OnFailureFail marks the step Failed immediately (default).<br /> |
| `retry` | OnFailureRetry resets the step to Pending for re-execution.<br /> |


#### PipelineStepPhase

_Underlying type:_ _string_

PipelineStepPhase describes the execution state of a single pipeline step.

_Validation:_
- Enum: [Pending WarmingUp Running Validating Succeeded Failed Skipped]

_Appears in:_
- [PipelineStepStatus](#pipelinestepstatus)

| Field | Description |
| --- | --- |
| `Pending` |  |
| `WarmingUp` | PipelineStepPhaseWarmingUp means the step is waiting for its assigned agent's pods to<br />become ready after a scale-from-zero event. Transitions to Running once ready.<br /> |
| `Running` |  |
| `Validating` | PipelineStepPhaseValidating means the step completed and is awaiting output validation.<br /> |
| `Succeeded` |  |
| `Failed` |  |
| `Skipped` | PipelineStepPhaseSkipped means the step was bypassed because its If condition evaluated to false.<br /> |


#### PipelineStepStatus



PipelineStepStatus captures the observed state of a single step.



_Appears in:_
- [SwarmRunStatus](#swarmrunstatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name matches the step name in spec. |  |  |
| `phase` _[PipelineStepPhase](#pipelinestepphase)_ | Phase is the current execution phase. |  | Enum: [Pending WarmingUp Running Validating Succeeded Failed Skipped] <br /> |
| `taskID` _string_ | TaskID is the Redis stream message ID of the submitted task, used to<br />correlate results from the agent-tasks-results stream. |  |  |
| `output` _string_ | Output is the agent's response after context policy has been applied.<br />For strategy=full this is the verbatim agent output (current behaviour).<br />For strategy=compress this is the compressed summary.<br />For strategy=extract this is the extracted value.<br />For strategy=none this is empty. |  |  |
| `rawOutput` _string_ | RawOutput is the original unprocessed agent output.<br />Only populated when contextPolicy.strategy is compress or extract, so<br />downstream steps can access pre-policy output via "\{\{ .steps.&lt;name&gt;.rawOutput \}\}". |  | Optional: true <br /> |
| `compressionTokens` _integer_ | CompressionTokens is the token count of the compressed output.<br />Only populated when contextPolicy.strategy=compress. |  | Optional: true <br /> |
| `outputJSON` _string_ | OutputJSON is the agent's response as a JSON string, populated when the step<br />has an OutputSchema and the response is valid JSON. Downstream steps can<br />reference fields via "\{\{ .steps.&lt;name&gt;.data.&lt;field&gt; \}\}". |  |  |
| `startTime` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | StartTime is when the step started executing. |  |  |
| `completionTime` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | CompletionTime is when the step finished (success or failure). |  |  |
| `message` _string_ | Message holds a human-readable status detail. |  |  |
| `iterations` _integer_ | Iterations is the number of times this step has been executed (for loop steps). |  |  |
| `tokenUsage` _[TokenUsage](#tokenusage)_ | TokenUsage reports the tokens consumed by this step's LLM calls. |  |  |
| `costUSD` _string_ | CostUSD is the estimated dollar cost of this step's LLM calls, calculated<br />using the operator's configured CostProvider. Decimal string; empty for unknown/local models. |  |  |
| `validationAttempts` _integer_ | ValidationAttempts counts how many times output validation has been run on this step.<br />Incremented on each validation attempt; reset when the step is retried from Pending. |  |  |
| `validationMessage` _string_ | ValidationMessage holds the most recent validation failure reason.<br />Cleared when validation passes. |  |  |
| `artifacts` _object (keys:string, values:string)_ | Artifacts maps artifact names to their storage URLs or local paths.<br />Populated after the step completes when spec.artifactStore is configured.<br />Downstream steps reference artifacts via "\{\{ .steps.&lt;name&gt;.artifacts.&lt;key&gt; \}\}". |  |  |
| `errorCode` _string_ | ErrorCode is the structured error code when the step failed. Empty on success. |  | Optional: true <br /> |
| `errorSuggestion` _string_ | ErrorSuggestion is a user-facing hint for resolving the error. Empty on success. |  | Optional: true <br /> |
| `resolvedAgent` _string_ | ResolvedAgent is the SwarmAgent name selected by a registry lookup for this step.<br />Empty when the step uses a static role reference. |  | Optional: true <br /> |
| `selectedCapability` _string_ | SelectedCapability is the capability ID chosen by the router LLM.<br />Only set for the synthetic "route" step in routed-mode runs. |  | Optional: true <br /> |
| `routingReason` _string_ | RoutingReason is the router LLM's one-sentence explanation for its choice.<br />Only set for the synthetic "route" step in routed-mode runs. |  | Optional: true <br /> |


#### PluginEndpoint



PluginEndpoint defines a gRPC plugin connection address and optional TLS config.



_Appears in:_
- [AgentPlugins](#agentplugins)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `address` _string_ | Address is the host:port of the gRPC plugin server. |  | MinLength: 1 <br />Required: true <br /> |
| `tlsSecretRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | TLSSecretRef references a Secret containing TLS credentials for mTLS.<br />The Secret must contain tls.crt, tls.key, and ca.crt.<br />When not set the connection is plaintext. |  | Optional: true <br /> |


#### PolicyEnforcementMode

_Underlying type:_ _string_

PolicyEnforcementMode controls whether the policy rejects, warns, or only audits.

_Validation:_
- Enum: [Audit Warn Enforce]

_Appears in:_
- [EffectivePolicySpec](#effectivepolicyspec)
- [SwarmPolicySpec](#swarmpolicyspec)

| Field | Description |
| --- | --- |
| `Audit` | PolicyEnforcementAudit logs violations without rejecting. Default.<br /> |
| `Warn` | PolicyEnforcementWarn returns admission warnings visible in kubectl<br />output and logs violations. Does not reject.<br /> |
| `Enforce` | PolicyEnforcementEnforce rejects non-compliant agents at admission.<br /> |


#### PolicyLimits



PolicyLimits defines ceilings and floors for agent execution parameters.
All fields are pointers: nil means "no constraint from this policy."
When multiple policies exist, the strictest non-nil value wins.
All token fields refer to total tokens (input + output) unless explicitly
suffixed. Cached/prompt-cached tokens count toward limits (conservative default).



_Appears in:_
- [EffectivePolicySpec](#effectivepolicyspec)
- [SwarmPolicySpec](#swarmpolicyspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `maxDailyTokens` _integer_ | MaxDailyTokens is the ceiling on guardrails.limits.dailyTokens.<br />An agent requesting more is rejected (Enforce), warned (Warn),<br />or flagged (Audit). An agent omitting dailyTokens gets this as<br />the effective limit at runtime. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxTokensPerCall` _integer_ | MaxTokensPerCall is the ceiling on guardrails.limits.tokensPerCall. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxTimeoutSeconds` _integer_ | MaxTimeoutSeconds is the ceiling on guardrails.limits.timeoutSeconds. |  | Minimum: 1 <br />Optional: true <br /> |
| `minTimeoutSeconds` _integer_ | MinTimeoutSeconds is the floor on guardrails.limits.timeoutSeconds.<br />Prevents agents from setting unreasonably short timeouts. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxConcurrentTasks` _integer_ | MaxConcurrentTasks is the ceiling on guardrails.limits.concurrentTasks. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxThinkingTokensPerCall` _integer_ | MaxThinkingTokensPerCall is the ceiling on guardrails.limits.maxThinkingTokensPerCall. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxAnswerTokensPerCall` _integer_ | MaxAnswerTokensPerCall is the ceiling on guardrails.limits.maxAnswerTokensPerCall. |  | Minimum: 1 <br />Optional: true <br /> |


#### PolicyModels



PolicyModels restricts which models agents may use. Both fields support
glob patterns: exact match or wildcard with `*`. Deny takes precedence
over allow.



_Appears in:_
- [EffectivePolicySpec](#effectivepolicyspec)
- [SwarmPolicySpec](#swarmpolicyspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `allowed` _string array_ | Allowed is a list of glob patterns for permitted models.<br />When multiple policies specify allowed lists, the intersection is used. |  | MaxItems: 100 <br />Optional: true <br /> |
| `denied` _string array_ | Denied is a list of glob patterns for forbidden models.<br />When multiple policies specify denied lists, the union is used. |  | MaxItems: 100 <br />Optional: true <br /> |


#### PolicyOutput



PolicyOutput defines output validation requirements.



_Appears in:_
- [SwarmPolicySpec](#swarmpolicyspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `minValidation` _[PolicyOutputLevel](#policyoutputlevel)_ | MinValidation is the minimum validation level required on all<br />SwarmTeam steps referencing agents in this namespace. | none | Enum: [none pattern schema semantic] <br />Optional: true <br /> |
| `denyPatterns` _string array_ | DenyPatterns are RE2 regex patterns merged into every step's<br />rejectPatterns at runtime. Invalid regexes are rejected at admission. |  | MaxItems: 50 <br />Optional: true <br /> |


#### PolicyOutputLevel

_Underlying type:_ _string_

PolicyOutputLevel defines the minimum validation level required.
Ordering: semantic (strictest) > schema > pattern > none (most permissive).
Each level is independent - schema does not require pattern.

_Validation:_
- Enum: [none pattern schema semantic]

_Appears in:_
- [EffectivePolicySpec](#effectivepolicyspec)
- [PolicyOutput](#policyoutput)

| Field | Description |
| --- | --- |
| `none` |  |
| `pattern` |  |
| `schema` |  |
| `semantic` |  |


#### PolicyRequirements



PolicyRequirements groups boolean requirements that all agents must satisfy.



_Appears in:_
- [EffectivePolicySpec](#effectivepolicyspec)
- [SwarmPolicySpec](#swarmpolicyspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `budgetRef` _boolean_ | BudgetRef requires all agents in the namespace to reference a SwarmBudget. |  | Optional: true <br /> |
| `audit` _boolean_ | Audit requires all agents to have audit logging enabled. |  | Optional: true <br /> |
| `allowList` _boolean_ | AllowList requires all agents to have a non-empty tool allow list. |  | Optional: true <br /> |


#### PolicyTools



PolicyTools defines tool access policy enforced at runtime.
Deny entries use glob patterns (not regex). Exact match or wildcard
with `*`. Examples: "shell/*" (all shell tools), "filesystem/write_file"
(exact tool), "*/execute_code" (tool across all namespaces).



_Appears in:_
- [SwarmPolicySpec](#swarmpolicyspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `deny` _string array_ | Deny is a deny list merged with each agent's guardrails.tools.deny.<br />Agents cannot remove entries from the policy deny list. Deny always<br />takes precedence over allow. |  | MaxItems: 100 <br />Optional: true <br /> |
| `forceTrustLevel` _[ToolTrustLevel](#tooltrustlevel)_ | ForceTrustLevel sets the minimum trust level for all agents.<br />Agents cannot use a more permissive level.<br />Ordering: sandbox (strictest) > external > internal (most permissive). |  | Enum: [internal external sandbox] <br />Optional: true <br /> |




#### PromptFragment



PromptFragment is one composable piece of text injected into the agent system prompt.
Fragments from multiple SwarmSettings objects are composed using the settingsRefs list on
SwarmAgent or SwarmTeamRole. Within a single SwarmSettings, fragments are applied in list order.
When the same fragment name appears in multiple referenced settings, the last occurrence wins.



_Appears in:_
- [SwarmSettingsSpec](#swarmsettingsspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name identifies this fragment. Must be unique within the SwarmSettings object.<br />Used for override resolution when the same name appears in multiple settings. |  | MinLength: 1 <br />Required: true <br /> |
| `text` _string_ | Text is the fragment content. May be multi-line. |  | Required: true <br /> |
| `position` _string_ | Position controls where this fragment is injected relative to the agent's systemPrompt.<br />  prepend - inserted before systemPrompt (persona, context, constraints)<br />  append  - inserted after systemPrompt (output rules, closing instructions) | append | Enum: [prepend append] <br /> |


#### PromptFragments



PromptFragments holds reusable prompt components.
Deprecated: use Fragments instead. Retained for backward compatibility.



_Appears in:_
- [SwarmSettingsSpec](#swarmsettingsspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `persona` _string_ | Persona is a persona/role description prepended to the system prompt.<br />Deprecated: define a PromptFragment with position=prepend instead. |  |  |
| `outputRules` _string_ | OutputRules defines output format constraints appended to the system prompt.<br />Deprecated: define a PromptFragment with position=append instead. |  |  |


#### ReasoningConfig



ReasoningConfig configures reasoning behavior for a SwarmAgent.

Provider field applicability (surfaced via kubectl explain):
  - Anthropic: BudgetTokens is honored; Effort is ignored and emits
    ReasoningFieldIgnored if set.
  - OpenAI o-series: Effort is honored; BudgetTokens is ignored and emits
    ReasoningFieldIgnored if set.
  - Non-reasoning models under mode Auto: entire block is silently ignored
    and a ReasoningIgnored Event fires. ReasoningActive condition is set
    to IgnoredModelNotCapable.
  - Non-reasoning models under mode Explicit: reconcile fails.



_Appears in:_
- [SwarmAgentSpec](#swarmagentspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `mode` _[ReasoningMode](#reasoningmode)_ | Mode controls whether reasoning is enabled. Default Disabled. | Disabled | Enum: [Disabled Auto Explicit] <br />Optional: true <br /> |
| `effort` _[ReasoningEffort](#reasoningeffort)_ | Effort is the provider-neutral effort hint for OpenAI o-series models.<br />Ignored by Anthropic; emits a ReasoningFieldIgnored Event on mismatch. |  | Enum: [Low Medium High] <br />Optional: true <br /> |
| `budgetTokens` _integer_ | BudgetTokens is the Anthropic thinking-token budget. Clamped to<br />spec.guardrails.limits.maxThinkingTokensPerCall when both are set.<br />Ignored by OpenAI o-series; emits a ReasoningFieldIgnored Event on<br />mismatch. The upper bound of 200000 is the current Anthropic ceiling<br />and may change as vendors update their APIs; operators who need a<br />higher value should request a bump in a follow-up RFC. |  | Maximum: 200000 <br />Minimum: 1024 <br />Optional: true <br /> |


#### ReasoningDefaults



ReasoningDefaults is the SwarmSettings-facing shape of ReasoningConfig.
It is structurally identical to ReasoningConfig except Mode has no
kubebuilder default - an unset SwarmSettings.defaults.reasoning.mode
means "no namespace default" and the agent-level default (Disabled)
applies directly. Without this split, the Mode default marker on
ReasoningConfig would cause every SwarmSettings object to implicitly
cascade mode: Disabled even when the admin never wrote it, which would
mask agent-level Auto overrides under the RFC-0012 cascade rules.



_Appears in:_
- [SwarmSettingsSpec](#swarmsettingsspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `mode` _[ReasoningMode](#reasoningmode)_ | Mode is the namespace-wide default reasoning mode. Leave unset to<br />mean "no default" (agents use their own default of Disabled). |  | Enum: [Disabled Auto Explicit] <br />Optional: true <br /> |
| `effort` _[ReasoningEffort](#reasoningeffort)_ | Effort is the namespace-wide default OpenAI effort hint. |  | Enum: [Low Medium High] <br />Optional: true <br /> |
| `budgetTokens` _integer_ | BudgetTokens is the namespace-wide default Anthropic thinking budget. |  | Maximum: 200000 <br />Minimum: 1024 <br />Optional: true <br /> |


#### ReasoningEffort

_Underlying type:_ _string_

ReasoningEffort is the provider-neutral effort hint. Translated to the
vendor's native effort value at the runtime boundary (OpenAI takes lowercase
low/medium/high; Anthropic ignores this field).

_Validation:_
- Enum: [Low Medium High]

_Appears in:_
- [ReasoningConfig](#reasoningconfig)
- [ReasoningDefaults](#reasoningdefaults)

| Field | Description |
| --- | --- |
| `Low` |  |
| `Medium` |  |
| `High` |  |


#### ReasoningMode

_Underlying type:_ _string_

ReasoningMode controls whether reasoning is enabled for the agent.

_Validation:_
- Enum: [Disabled Auto Explicit]

_Appears in:_
- [ReasoningConfig](#reasoningconfig)
- [ReasoningDefaults](#reasoningdefaults)

| Field | Description |
| --- | --- |
| `Disabled` | ReasoningDisabled turns reasoning off even for reasoning-capable models.<br /> |
| `Auto` | ReasoningAuto enables reasoning when the model supports it, silent no-op otherwise.<br /> |
| `Explicit` | ReasoningExplicit requires reasoning; reconcile fails on non-reasoning-capable models.<br /> |


#### RedisMemoryConfig



RedisMemoryConfig configures the Redis memory backend.



_Appears in:_
- [SwarmMemorySpec](#swarmmemoryspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `secretRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | SecretRef names a Secret whose REDIS_URL key is injected into agent pods. |  |  |
| `ttlSeconds` _integer_ | TTLSeconds is how long memory entries are retained. 0 means no expiry. | 3600 |  |
| `maxEntries` _integer_ | MaxEntries caps the number of stored entries per agent instance. 0 means unlimited. |  |  |


#### RegistryLookupSpec



RegistryLookupSpec configures runtime agent resolution via SwarmRegistry.



_Appears in:_
- [SwarmTeamPipelineStep](#swarmteampipelinestep)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `capability` _string_ | Capability is the exact capability ID to match. |  | MinLength: 1 <br />Required: true <br /> |
| `tags` _string array_ | Tags narrows candidates to agents that declare ALL listed tags. |  | MaxItems: 100 <br />Optional: true <br /> |
| `strategy` _[RegistryLookupStrategy](#registrylookupstrategy)_ | Strategy controls which agent is selected when multiple match. | least-busy | Enum: [least-busy round-robin random] <br /> |
| `registryRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | RegistryRef names the SwarmRegistry to query. Defaults to first registry in namespace. |  | Optional: true <br /> |
| `fallback` _string_ | Fallback is the role/agent name to use when no agent matches.<br />If unset and no match, the step fails with RegistryLookupFailed. |  | Optional: true <br /> |


#### RegistryLookupStrategy

_Underlying type:_ _string_

RegistryLookupStrategy controls which agent wins when multiple match.

_Validation:_
- Enum: [least-busy round-robin random]

_Appears in:_
- [RegistryLookupSpec](#registrylookupspec)

| Field | Description |
| --- | --- |
| `least-busy` |  |
| `round-robin` |  |
| `random` |  |


#### RegistryScope

_Underlying type:_ _string_

RegistryScope controls which SwarmAgents are indexed by an SwarmRegistry.

_Validation:_
- Enum: [namespace-scoped cluster-wide]

_Appears in:_
- [SwarmRegistrySpec](#swarmregistryspec)

| Field | Description |
| --- | --- |
| `namespace-scoped` | RegistryScopeNamespace indexes only SwarmAgents in the same namespace (default).<br /> |
| `cluster-wide` | RegistryScopeCluster indexes all SwarmAgents cluster-wide. Requires a ClusterRole<br />that grants cross-namespace SwarmAgent reads.<br /> |


#### SlackChannelSpec



SlackChannelSpec configures a Slack incoming webhook notification channel.



_Appears in:_
- [NotifyChannelSpec](#notifychannelspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `webhookURLFrom` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | WebhookURLFrom reads the Slack incoming webhook URL from a Secret key. |  |  |


#### StepContextPolicy



StepContextPolicy controls how a step's output is prepared before injection
into downstream step prompts via "&#123;&#123; .steps.&lt;name&gt;.output &#125;&#125;".



_Appears in:_
- [SwarmRunSpec](#swarmrunspec)
- [SwarmTeamPipelineStep](#swarmteampipelinestep)
- [SwarmTeamSpec](#swarmteamspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `strategy` _string_ | Strategy determines how the output is handled before downstream injection.<br />full: verbatim injection wrapped in &lt;swarm:step-output&gt; (default, current behaviour).<br />compress: output is summarised by an LLM call before injection.<br />extract: a JSONPath or regexp is applied; only the matched value is injected.<br />none: nothing is injected; "\{\{ .steps.&lt;name&gt;.output \}\}" resolves to "". | full | Enum: [full compress extract none] <br /> |
| `compress` _[ContextCompressConfig](#contextcompressconfig)_ | Compress configures LLM-based summarisation. Only used when strategy=compress. |  | Optional: true <br /> |
| `extractPath` _string_ | ExtractPath is evaluated as a JSONPath expression when the step output is valid JSON,<br />or as a Go regexp (first capture group) for prose output.<br />Only used when strategy=extract. |  | Optional: true <br /> |


#### StepValidation



When multiple modes are configured all must pass; evaluation order is
Contains -> Schema -> Semantic (cheapest first).



_Appears in:_
- [SwarmTeamPipelineStep](#swarmteampipelinestep)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `contains` _string_ | Contains is a RE2 regular expression that must match somewhere in the step output.<br />Avoid anchoring on multi-byte characters (e.g. emoji) - use substring match instead. |  | Optional: true <br /> |
| `schema` _string_ | Schema is a JSON Schema string. The step output must be valid JSON that satisfies<br />the schema's required fields and top-level property type constraints. |  | Optional: true <br /> |
| `semantic` _string_ | Semantic is a natural-language validator prompt sent to an LLM.<br />The LLM must respond with "PASS" (case-insensitive) for validation to pass.<br />Use \{\{ .output \}\} in the prompt to embed the step output. |  | Optional: true <br /> |
| `semanticModel` _string_ | SemanticModel overrides the LLM model used for semantic validation.<br />Defaults to the step's SwarmAgent model when empty.<br />Recommended: use a stronger model than the step agent to avoid grading its own output. |  | Optional: true <br /> |
| `onFailure` _[OnFailureAction](#onfailureaction)_ | OnFailure controls what happens when validation fails.<br />OnFailureFail (default) marks the step Failed immediately.<br />OnFailureRetry resets the step to Pending for re-execution. | fail | Enum: [fail retry] <br />Optional: true <br /> |
| `maxRetries` _integer_ | MaxRetries caps validation-level retries when OnFailure is "retry".<br />Independent of queue-level task retries. | 2 | Maximum: 10 <br />Minimum: 0 <br />Optional: true <br /> |
| `rejectPatterns` _string array_ | RejectPatterns is a list of RE2 regular expressions that act as a security gate<br />against prompt injection. A match against any pattern causes the step to fail<br />immediately with reason OutputRejected, regardless of other validation settings.<br />Evaluated before Contains, Schema, and Semantic checks.<br />Example: ["(?i)ignore.*previous.*instructions", "(?i)act as"] |  | MaxItems: 50 <br />Optional: true <br /> |


#### SwarmAgent



SwarmAgent manages a pool of LLM agent instances.



_Appears in:_
- [SwarmAgentList](#swarmagentlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmAgent` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  | Optional: true <br /> |
| `spec` _[SwarmAgentSpec](#swarmagentspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmAgentStatus](#swarmagentstatus)_ |  |  | Optional: true <br /> |


#### SwarmAgentAutoscaling



SwarmAgentAutoscaling configures KEDA-based autoscaling for the agent's deployment.
Requires KEDA v2 installed in the cluster.
When set on an agent, runtime.replicas is ignored.



_Appears in:_
- [AgentRuntime](#agentruntime)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `minReplicas` _integer_ | MinReplicas is the minimum replica count (idle floor). | 1 | Minimum: 0 <br />Optional: true <br /> |
| `maxReplicas` _integer_ | MaxReplicas is the maximum replica count. | 10 | Minimum: 1 <br />Optional: true <br /> |
| `targetPendingTasks` _integer_ | TargetPendingTasks is the number of pending queue entries per replica used<br />as the KEDA scale trigger. Scale-up fires when pending tasks exceed this threshold. | 5 | Minimum: 1 <br />Optional: true <br /> |


#### SwarmAgentList



SwarmAgentList contains a list of SwarmAgent.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmAgentList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmAgent](#swarmagent) array_ |  |  |  |


#### SwarmAgentMCPStatus



SwarmAgentMCPStatus reports the last observed health of one MCP server.



_Appears in:_
- [SwarmAgentStatus](#swarmagentstatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name matches MCPToolSpec.name. |  |  |
| `url` _string_ | URL is the MCP server endpoint that was probed. |  |  |
| `healthy` _boolean_ | Healthy is true when the last probe received a non-5xx HTTP response.<br />Nil means the server has not been probed yet. |  | Optional: true <br /> |
| `message` _string_ | Message holds error detail when Healthy is false. |  | Optional: true <br /> |
| `lastCheck` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastCheck is when the probe was last run. |  | Optional: true <br /> |
| `authType` _string_ | AuthType reports what authentication the controller configured for this<br />server: "none", "bearer", or "mtls". Empty means not yet evaluated. |  | Enum: [none bearer mtls] <br />Optional: true <br /> |
| `trust` _[ToolTrustLevel](#tooltrustlevel)_ | Trust is the trust level assigned to this MCP server.<br />Mirrors spec for observability - confirms the controller applied it. |  | Enum: [internal external sandbox] <br />Optional: true <br /> |


#### SwarmAgentSpec



SwarmAgentSpec defines the desired state of a SwarmAgent.



_Appears in:_
- [SwarmAgent](#swarmagent)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `model` _string_ | Model is the LLM model ID (e.g. "claude-sonnet-4-6"). |  | MinLength: 1 <br />Required: true <br /> |
| `prompt` _[AgentPrompt](#agentprompt)_ | Prompt configures the agent's system prompt. |  | Required: true <br /> |
| `settings` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core) array_ | Settings references SwarmSettings objects whose fragments are composed into<br />this agent's system prompt, in list order. Last occurrence wins for duplicate keys. |  | MaxItems: 50 <br />Optional: true <br /> |
| `capabilities` _[AgentCapability](#agentcapability) array_ | Capabilities advertises what this agent can do to SwarmRegistry and the MCP gateway.<br />Agents without capabilities are invisible to registry lookups. |  | MaxItems: 200 <br />Optional: true <br /> |
| `tools` _[AgentTools](#agenttools)_ | Tools groups MCP server connections and inline webhook tools. |  | Optional: true <br /> |
| `agents` _[AgentConnection](#agentconnection) array_ | Agents lists other SwarmAgent or registry capabilities callable as tools via A2A. |  | MaxItems: 50 <br />Optional: true <br /> |
| `guardrails` _[AgentGuardrails](#agentguardrails)_ | Guardrails groups tool permissions, budget enforcement, and execution limits. |  | Optional: true <br /> |
| `reasoning` _[ReasoningConfig](#reasoningconfig)_ | Reasoning configures reasoning-capable LLM behavior. See ReasoningConfig<br />for the provider-applicability matrix. |  | Optional: true <br /> |
| `runtime` _[AgentRuntime](#agentruntime)_ | Runtime groups replica count, autoscaling, resources, and loop policy. | \{  \} |  |
| `infrastructure` _[AgentInfrastructure](#agentinfrastructure)_ | Infrastructure groups cluster integration concerns: registry, network policy,<br />API key injection, environment variables, and gRPC plugin overrides. |  | Optional: true <br /> |
| `observability` _[AgentObservability](#agentobservability)_ | Observability groups health check, logging, and metrics configuration. |  | Optional: true <br /> |
| `gateway` _[GatewayConfig](#gatewayconfig)_ | Gateway configures this agent as a gateway to the swarm.<br />When set, the operator injects registry_search and dispatch tools<br />and adds a GatewayReady condition to status.<br />Mutually exclusive with being an inline role in a SwarmTeam<br />(enforced by admission webhook). |  | Optional: true <br /> |


#### SwarmAgentStatus



SwarmAgentStatus defines the observed state of SwarmAgent.



_Appears in:_
- [SwarmAgent](#swarmagent)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `readyReplicas` _integer_ | ReadyReplicas is the number of agent pods ready to accept tasks. |  |  |
| `replicas` _integer_ | Replicas is the total number of agent pods (ready or not). |  |  |
| `desiredReplicas` _integer_ | DesiredReplicas is the autoscaling-computed target replica count.<br />Nil for standalone agents not managed by a team autoscaler. |  | Optional: true <br /> |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `dailyTokenUsage` _[TokenUsage](#tokenusage)_ | DailyTokenUsage is the sum of tokens consumed in the rolling 24-hour window.<br />Populated only when guardrails.limits.dailyTokens is set. |  | Optional: true <br /> |
| `dedupEnabled` _boolean_ | DedupEnabled surfaces whether tool-call deduplication is active for this agent. |  | Optional: true <br /> |
| `toolConnections` _[SwarmAgentMCPStatus](#swarmagentmcpstatus) array_ | ToolConnections reports the last observed connectivity state of each configured MCP server. |  | Optional: true <br /> |
| `systemPromptHash` _string_ | SystemPromptHash is the SHA-256 hex digest of the resolved system prompt last applied. |  | Optional: true <br /> |
| `exposedMCPCapabilities` _string array_ | ExposedMCPCapabilities lists the capability names currently registered at the MCP gateway. |  | MaxItems: 100 <br />Optional: true <br /> |
| `toolAgentConnections` _[ToolAgentConnectionStatus](#toolagentconnectionstatus) array_ | ToolAgentConnections reports the status of tool-role agent connections. |  | Optional: true <br /> |
| `advisorConnections` _[AdvisorConnectionStatus](#advisorconnectionstatus) array_ | AdvisorConnections reports the status of advisor-role agent connections. |  | Optional: true <br /> |
| `appliedSettings` _string array_ | AppliedSettings lists the names of SwarmSettings objects that were<br />successfully resolved and composed into this agent's configuration.<br />Empty when no settingsRefs are configured. |  | Optional: true <br /> |
| `appliedFragmentCount` _integer_ | AppliedFragmentCount is the number of prompt fragments composed into<br />the system prompt from all applied SwarmSettings. Zero when no<br />fragments are configured or no settings are referenced. |  | Optional: true <br /> |
| `gateway` _[GatewayStatus](#gatewaystatus)_ | Gateway reports gateway-specific observable state.<br />Only populated when spec.gateway is set. |  | Optional: true <br /> |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the SwarmAgent. |  |  |


#### SwarmBudget



SwarmBudget defines a spend limit for one or more SwarmTeams.
The SwarmBudgetController recalculates status every 5 minutes by querying the
configured SpendStore. When hardStop is true, the SwarmRunReconciler blocks new
runs that would violate the budget.



_Appears in:_
- [SwarmBudgetList](#swarmbudgetlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmBudget` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[SwarmBudgetSpec](#swarmbudgetspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmBudgetStatus](#swarmbudgetstatus)_ |  |  | Optional: true <br /> |


#### SwarmBudgetList



SwarmBudgetList contains a list of SwarmBudget.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmBudgetList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmBudget](#swarmbudget) array_ |  |  |  |


#### SwarmBudgetSelector



SwarmBudgetSelector scopes a budget to a subset of resources.



_Appears in:_
- [SwarmBudgetSpec](#swarmbudgetspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `namespace` _string_ | Namespace scopes this budget to a single namespace.<br />Empty means all namespaces in the cluster. |  | Optional: true <br /> |
| `team` _string_ | Team scopes this budget to a single SwarmTeam by name.<br />Empty means all teams in the selected namespace(s). |  | Optional: true <br /> |
| `matchLabels` _object (keys:string, values:string)_ | MatchLabels selects SwarmTeams by label. Applied in addition to Namespace/Team. |  | Optional: true <br /> |


#### SwarmBudgetSpec



SwarmBudgetSpec defines the desired state of an SwarmBudget.



_Appears in:_
- [SwarmBudget](#swarmbudget)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `selector` _[SwarmBudgetSelector](#swarmbudgetselector)_ | Selector scopes this budget to matching resources. |  | Required: true <br /> |
| `period` _string_ | Period is the rolling window for spend accumulation. | monthly | Enum: [daily weekly monthly] <br />Optional: true <br /> |
| `limit` _string_ | Limit is the maximum spend in the configured currency for one period.<br />Value is a decimal string (e.g., "100.00"). |  | Pattern: `^[0-9]+(\.[0-9]+)?$` <br /> |
| `currency` _string_ | Currency is the ISO 4217 currency code. Must match the operator's CostProvider. | USD | Optional: true <br /> |
| `warnAt` _integer_ | WarnAt is the percentage of the limit at which a BudgetWarning notification fires (0–100).<br />Zero disables warnings. Default: 80. | 80 | Maximum: 100 <br />Minimum: 0 <br />Optional: true <br /> |
| `hardStop` _boolean_ | HardStop blocks new SwarmRuns when the limit is exceeded.<br />When false (default), runs continue but a BudgetExceeded notification fires.<br />When true, new SwarmRuns fail immediately with BudgetExceeded before any tokens are spent. | false | Optional: true <br /> |
| `notifyRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | NotifyRef references an SwarmNotify policy for budget alerts.<br />Fires BudgetWarning (at warnAt%) and BudgetExceeded (at 100%). |  | Optional: true <br /> |


#### SwarmBudgetStatus



SwarmBudgetStatus defines the observed state of an SwarmBudget.



_Appears in:_
- [SwarmBudget](#swarmbudget)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `phase` _[BudgetStatus](#budgetstatus)_ | Phase summarises the current budget state. |  | Enum: [OK Warning Exceeded] <br /> |
| `spentUSD` _string_ | SpentUSD is the total spend in the current period window as a decimal string. |  |  |
| `pctUsed` _string_ | PctUsed is SpentUSD / Limit as a percentage string (0-100). |  |  |
| `periodStart` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | PeriodStart is the start of the current budget window. |  | Optional: true <br /> |
| `lastUpdated` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastUpdated is when the status was last recalculated. |  | Optional: true <br /> |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the budget. |  |  |


#### SwarmEvent



SwarmEvent fires SwarmTeam pipeline runs in response to external events:
a cron schedule, an inbound HTTP webhook, or another team pipeline completing.



_Appears in:_
- [SwarmEventList](#swarmeventlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmEvent` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  | Optional: true <br /> |
| `spec` _[SwarmEventSpec](#swarmeventspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmEventStatus](#swarmeventstatus)_ |  |  | Optional: true <br /> |


#### SwarmEventList



SwarmEventList contains a list of SwarmEvent.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmEventList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmEvent](#swarmevent) array_ |  |  |  |


#### SwarmEventSource



SwarmEventSource defines what fires the trigger.



_Appears in:_
- [SwarmEventSpec](#swarmeventspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `type` _[TriggerSourceType](#triggersourcetype)_ | Type is the source type: cron \| webhook \| team-output. |  | Enum: [cron webhook team-output] <br />Required: true <br /> |
| `cron` _string_ | Cron is a standard 5-field cron expression (minute hour dom month dow).<br />Only used when type=cron.<br />Example: "0 9 * * 1-5" (9am on weekdays) |  |  |
| `teamOutput` _[TeamOutputSource](#teamoutputsource)_ | TeamOutput triggers when the named SwarmTeam pipeline reaches a phase.<br />Only used when type=team-output. |  |  |


#### SwarmEventSpec



SwarmEventSpec defines the desired state of SwarmEvent.



_Appears in:_
- [SwarmEvent](#swarmevent)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `source` _[SwarmEventSource](#swarmeventsource)_ | Source defines what fires this trigger. |  | Required: true <br /> |
| `targets` _[SwarmEventTarget](#swarmeventtarget) array_ | Targets is the list of team pipelines to dispatch when the trigger fires. |  | MaxItems: 20 <br />MinItems: 1 <br />Required: true <br /> |
| `concurrencyPolicy` _[ConcurrencyPolicy](#concurrencypolicy)_ | ConcurrencyPolicy controls what happens when the trigger fires while a previous<br />run is still in progress. Defaults to Allow. | Allow | Enum: [Allow Forbid] <br /> |
| `suspended` _boolean_ | Suspended pauses the trigger without deleting it. | false |  |


#### SwarmEventStatus



SwarmEventStatus defines the observed state of SwarmEvent.



_Appears in:_
- [SwarmEvent](#swarmevent)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `lastFiredAt` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastFiredAt is when the trigger last dispatched team runs. |  |  |
| `nextFireAt` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | NextFireAt is the next scheduled fire time (cron type only). |  |  |
| `firedCount` _integer_ | FiredCount is the total number of times this trigger has fired. |  |  |
| `webhookURL` _string_ | WebhookURL is the URL to POST to in order to fire this trigger (webhook type only).<br />Requires --trigger-webhook-url to be configured on the operator. |  |  |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the trigger. |  |  |


#### SwarmEventTarget



SwarmEventTarget describes what to dispatch when the trigger fires.
Exactly one of Team or Agent must be set.



_Appears in:_
- [SwarmEventSpec](#swarmeventspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `team` _string_ | Team is the name of the SwarmTeam to dispatch a pipeline run for.<br />Exactly one of Team or Agent must be set. |  | Optional: true <br /> |
| `agent` _string_ | Agent is the name of the SwarmAgent to invoke directly.<br />When set, the event creates an SwarmRun with spec.agent and spec.prompt.<br />Exactly one of Team or Agent must be set. |  | Optional: true <br /> |
| `prompt` _string_ | Prompt is the task text submitted to the agent when Agent is set.<br />Supports Go template syntax evaluated with the trigger fire context:<br />  \{\{ .trigger.name \}\}    - trigger name<br />  \{\{ .trigger.firedAt \}\} - RFC3339 fire timestamp<br />  \{\{ .trigger.body.* \}\} - JSON fields from the webhook request body (webhook type only)<br />  \{\{ .trigger.output \}\} - upstream team output (team-output type only) |  | Optional: true <br /> |
| `input` _object (keys:string, values:string)_ | Input values to set on the dispatched team pipeline, overriding the template team's inputs.<br />Values are Go template strings evaluated with the trigger fire context (same as Prompt).<br />Only used when Team is set. |  | Optional: true <br /> |


#### SwarmMemory



SwarmMemory defines the persistent memory backend for agent instances.
Reference it from an SwarmAgent via spec.memoryRef to give agents
durable memory across tasks.



_Appears in:_
- [SwarmMemoryList](#swarmmemorylist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmMemory` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  | Optional: true <br /> |
| `spec` _[SwarmMemorySpec](#swarmmemoryspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmMemoryStatus](#swarmmemorystatus)_ |  |  | Optional: true <br /> |


#### SwarmMemoryList



SwarmMemoryList contains a list of SwarmMemory.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmMemoryList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmMemory](#swarmmemory) array_ |  |  |  |


#### SwarmMemorySpec



SwarmMemorySpec defines the desired memory configuration.



_Appears in:_
- [SwarmMemory](#swarmmemory)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `backend` _[MemoryBackend](#memorybackend)_ | Backend selects the memory storage strategy. |  | Enum: [in-context vector-store redis] <br />Required: true <br /> |
| `redis` _[RedisMemoryConfig](#redismemoryconfig)_ | Redis configures the Redis backend. Required when backend is "redis". |  |  |
| `vectorStore` _[VectorStoreMemoryConfig](#vectorstorememoryconfig)_ | VectorStore configures the vector-store backend. Required when backend is "vector-store". |  |  |
| `embedding` _[EmbeddingConfig](#embeddingconfig)_ | Embedding configures the embedding model used for vector memory operations (RFC-0026).<br />Required when backend is "vector-store". The operator injects the resolved model ID,<br />provider, and API key reference as environment variables into agent pods. |  | Optional: true <br /> |


#### SwarmMemoryStatus



SwarmMemoryStatus defines the observed state of SwarmMemory.



_Appears in:_
- [SwarmMemory](#swarmmemory)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the SwarmMemory. |  |  |


#### SwarmNotify



SwarmNotify defines a reusable notification policy that routes run events to
one or more channels (Slack, generic webhook, etc.).



_Appears in:_
- [SwarmNotifyList](#swarmnotifylist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmNotify` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  | Optional: true <br /> |
| `spec` _[SwarmNotifySpec](#swarmnotifyspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmNotifyStatus](#swarmnotifystatus)_ |  |  | Optional: true <br /> |


#### SwarmNotifyList



SwarmNotifyList contains a list of SwarmNotify.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmNotifyList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmNotify](#swarmnotify) array_ |  |  |  |


#### SwarmNotifySpec



SwarmNotifySpec defines the desired state of SwarmNotify.



_Appears in:_
- [SwarmNotify](#swarmnotify)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `on` _[NotifyEvent](#notifyevent) array_ | On lists the events that trigger notifications.<br />If empty, all events fire. |  | Enum: [TeamSucceeded TeamFailed TeamTimedOut BudgetWarning BudgetExceeded DailyLimitReached AgentDegraded] <br />MaxItems: 10 <br />Optional: true <br /> |
| `channels` _[NotifyChannelSpec](#notifychannelspec) array_ | Channels lists the notification targets. |  | MaxItems: 20 <br />MinItems: 1 <br /> |
| `rateLimitSeconds` _integer_ | RateLimitSeconds is the minimum interval between notifications for the<br />same (team, event) pair. Default: 300. Set to 0 to disable rate limiting. | 300 | Minimum: 0 <br />Optional: true <br /> |


#### SwarmNotifyStatus



SwarmNotifyStatus defines the observed state of SwarmNotify.



_Appears in:_
- [SwarmNotify](#swarmnotify)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `lastDispatches` _[NotifyDispatchResult](#notifydispatchresult) array_ | LastDispatches records the most recent dispatch result per channel index. |  | Optional: true <br /> |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the SwarmNotify. |  | Optional: true <br /> |


#### SwarmPolicy



SwarmPolicy defines platform-level guardrails enforced on all SwarmAgents
in the namespace. Agent authors cannot weaken policy constraints.



_Appears in:_
- [SwarmPolicyList](#swarmpolicylist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmPolicy` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[SwarmPolicySpec](#swarmpolicyspec)_ |  |  |  |
| `status` _[SwarmPolicyStatus](#swarmpolicystatus)_ |  |  |  |


#### SwarmPolicyList



SwarmPolicyList contains a list of SwarmPolicy.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmPolicyList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmPolicy](#swarmpolicy) array_ |  |  |  |


#### SwarmPolicySpec



SwarmPolicySpec defines the policy constraints.



_Appears in:_
- [SwarmPolicy](#swarmpolicy)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `enforcementMode` _[PolicyEnforcementMode](#policyenforcementmode)_ | EnforcementMode controls whether violations cause admission rejection<br />(Enforce), admission warnings (Warn), or are only logged (Audit).<br />Default: Audit. | Audit | Enum: [Audit Warn Enforce] <br />Optional: true <br /> |
| `limits` _[PolicyLimits](#policylimits)_ | Limits sets ceilings and floors on agent execution parameters. |  | Optional: true <br /> |
| `tools` _[PolicyTools](#policytools)_ | Tools sets tool access restrictions. |  | Optional: true <br /> |
| `output` _[PolicyOutput](#policyoutput)_ | Output sets minimum output validation requirements. |  | Optional: true <br /> |
| `models` _[PolicyModels](#policymodels)_ | Models restricts which models agents may use. |  | Optional: true <br /> |
| `requirements` _[PolicyRequirements](#policyrequirements)_ | Requirements defines boolean requirements that all agents must satisfy. |  | Optional: true <br /> |


#### SwarmPolicyStatus



SwarmPolicyStatus reports the compliance state of agents in the namespace.



_Appears in:_
- [SwarmPolicy](#swarmpolicy)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `agentCount` _integer_ | AgentCount is the total number of SwarmAgents in the namespace. |  |  |
| `compliantCount` _integer_ | CompliantCount is the number of agents satisfying all policy constraints. |  |  |
| `effectivePolicy` _[EffectivePolicySpec](#effectivepolicyspec)_ | EffectivePolicy is the merged result of all SwarmPolicies in the namespace. |  | Optional: true <br /> |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the policy controller's state. |  |  |


#### SwarmRegistry



SwarmRegistry is a Kubernetes-native capability index that lets pipeline steps
resolve an agent at runtime by what it can do rather than by a hardcoded name.
Agents advertise capabilities via spec.capabilities on SwarmAgentSpec.



_Appears in:_
- [SwarmRegistryList](#swarmregistrylist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmRegistry` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  | Optional: true <br /> |
| `spec` _[SwarmRegistrySpec](#swarmregistryspec)_ |  |  | Optional: true <br /> |
| `status` _[SwarmRegistryStatus](#swarmregistrystatus)_ |  |  | Optional: true <br /> |


#### SwarmRegistryList



SwarmRegistryList contains a list of SwarmRegistry.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmRegistryList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmRegistry](#swarmregistry) array_ |  |  |  |


#### SwarmRegistrySpec



SwarmRegistrySpec defines the desired state of SwarmRegistry.



_Appears in:_
- [SwarmRegistry](#swarmregistry)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `scope` _[RegistryScope](#registryscope)_ | Scope controls which SwarmAgents are indexed.<br />namespace-scoped: only SwarmAgents in the same namespace (default).<br />cluster-wide: all SwarmAgents cluster-wide (requires ClusterRole). | namespace-scoped | Enum: [namespace-scoped cluster-wide] <br /> |
| `maxDepth` _integer_ | MaxDepth is the maximum agent-to-agent delegation depth allowed for registry-resolved steps.<br />Prevents runaway recursion. | 3 | Maximum: 20 <br />Minimum: 1 <br />Optional: true <br /> |
| `mcpBindings` _[MCPBinding](#mcpbinding) array_ | MCPBindings maps capability IDs to MCP server URLs for this deployment.<br />Agents that declare mcpServers with capabilityRef have their URLs resolved<br />from this list at reconcile time. This allows cookbook-style agent definitions<br />to remain URL-free; operators supply the bindings per namespace. |  | MaxItems: 50 <br />Optional: true <br /> |


#### SwarmRegistryStatus



SwarmRegistryStatus defines the observed state of SwarmRegistry.



_Appears in:_
- [SwarmRegistry](#swarmregistry)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `indexedAgents` _integer_ | IndexedAgents is the total number of SwarmAgents indexed by this registry. |  |  |
| `fleet` _[AgentFleetEntry](#agentfleetentry) array_ | Fleet is the list of SwarmAgents currently registered with this registry,<br />with per-agent readiness and token usage. Replaces the implicit<br />"all agents in namespace" model with an explicit opt-in list. |  | MaxItems: 1000 <br />Optional: true <br /> |
| `lastRebuild` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastRebuild is the time the index was last rebuilt. |  | Optional: true <br /> |
| `capabilities` _[IndexedCapability](#indexedcapability) array_ | Capabilities lists all capabilities indexed, with their associated agents and tags. |  | MaxItems: 200 <br />Optional: true <br /> |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the SwarmRegistry. |  |  |


#### SwarmRun



SwarmRun is an immutable execution record. It covers both standalone agent
invocations (spec.agent + spec.prompt) and team pipeline runs (spec.teamRef).
Created automatically by SwarmEvent or directly via kubectl apply.



_Appears in:_
- [SwarmRunList](#swarmrunlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmRun` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[SwarmRunSpec](#swarmrunspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmRunStatus](#swarmrunstatus)_ |  |  | Optional: true <br /> |


#### SwarmRunList



SwarmRunList contains a list of SwarmRun.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmRunList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmRun](#swarmrun) array_ |  |  |  |


#### SwarmRunPhase

_Underlying type:_ _string_

SwarmRunPhase describes the overall execution state of an SwarmRun.

_Validation:_
- Enum: [Pending Running Succeeded Failed]

_Appears in:_
- [SwarmRunStatus](#swarmrunstatus)
- [SwarmTeamStatus](#swarmteamstatus)

| Field | Description |
| --- | --- |
| `Pending` |  |
| `Running` |  |
| `Succeeded` |  |
| `Failed` |  |


#### SwarmRunSpec



SwarmRunSpec is an immutable snapshot of everything needed to execute one run.
Exactly one of TeamRef or Agent must be set.
For team runs it is populated at trigger time from the parent SwarmTeam spec.
For standalone agent runs only Agent and Prompt are required.



_Appears in:_
- [SwarmRun](#swarmrun)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `teamRef` _string_ | TeamRef is the name of the SwarmTeam that owns this run.<br />Exactly one of TeamRef or Agent must be set. |  | Optional: true <br /> |
| `agent` _string_ | Agent is the name of the SwarmAgent to invoke for a standalone run.<br />Exactly one of TeamRef or Agent must be set. |  | Optional: true <br /> |
| `prompt` _string_ | Prompt is the task text submitted to the agent for a standalone run.<br />Required when Agent is set. |  | Optional: true <br /> |
| `teamGeneration` _integer_ | TeamGeneration is the SwarmTeam spec.generation at the time this run was<br />created. Allows correlating a run with the exact team spec that was in effect.<br />Only set for team runs. |  | Optional: true <br /> |
| `input` _object (keys:string, values:string)_ | Input is the resolved input map for this run: team default inputs merged with<br />any per-trigger overrides supplied via swarm trigger --input or SwarmEvent.<br />Step inputs reference these values via "\{\{ .input.&lt;key&gt; \}\}". |  | Optional: true <br /> |
| `pipeline` _[SwarmTeamPipelineStep](#swarmteampipelinestep) array_ | Pipeline is a snapshot of the SwarmTeam pipeline DAG at trigger time.<br />Empty for routed-mode runs. |  | MaxItems: 100 <br />Optional: true <br /> |
| `defaultContextPolicy` _[StepContextPolicy](#stepcontextpolicy)_ | DefaultContextPolicy is a snapshot of the team's defaultContextPolicy at trigger time.<br />Applied to non-adjacent step references; per-step contextPolicy takes precedence. |  | Optional: true <br /> |
| `roles` _[SwarmTeamRole](#swarmteamrole) array_ | Roles is a snapshot of the SwarmTeam role definitions at trigger time.<br />Empty for routed-mode runs. |  | MaxItems: 50 <br />Optional: true <br /> |
| `output` _string_ | Output is a Go template expression that selects the final run result.<br />Example: "\{\{ .steps.summarize.output \}\}"<br />For routed-mode runs this defaults to "\{\{ .steps.route.output \}\}" at trigger time. |  | Optional: true <br /> |
| `routing` _[SwarmTeamRoutingSpec](#swarmteamroutingspec)_ | Routing is a snapshot of the SwarmTeam routing config at trigger time.<br />Set when the team operates in routed mode. Mutually exclusive with Pipeline. |  | Optional: true <br /> |
| `timeoutSeconds` _integer_ | TimeoutSeconds is the maximum wall-clock seconds this run may take.<br />Zero means no timeout. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxTokens` _integer_ | MaxTokens is the total token budget for this run across all steps.<br />Zero means no limit. |  | Minimum: 1 <br />Optional: true <br /> |


#### SwarmRunStatus



SwarmRunStatus defines the observed execution state of an SwarmRun.



_Appears in:_
- [SwarmRun](#swarmrun)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `phase` _[SwarmRunPhase](#swarmrunphase)_ | Phase is the overall execution state. |  | Enum: [Pending Running Succeeded Failed] <br /> |
| `steps` _[PipelineStepStatus](#pipelinestepstatus) array_ | Steps holds the per-step execution state for this run, including full<br />step outputs. Unlike SwarmTeam.Status, this is never reset - it is the<br />permanent record of what happened during this run. |  | MaxItems: 100 <br /> |
| `output` _string_ | Output is the resolved final pipeline output once phase is Succeeded. |  |  |
| `startTime` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | StartTime is when this run began executing. |  |  |
| `completionTime` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | CompletionTime is when this run reached a terminal phase (Succeeded or Failed). |  |  |
| `totalTokenUsage` _[TokenUsage](#tokenusage)_ | TotalTokenUsage is the sum of token usage across all steps in this run. |  |  |
| `totalCostUSD` _string_ | TotalCostUSD is the estimated total dollar cost of this run, summed across<br />all steps using the operator's configured CostProvider. Decimal string. |  |  |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the SwarmRun. |  |  |


#### SwarmSettings



SwarmSettings holds shared configuration consumed by SwarmAgents.



_Appears in:_
- [SwarmSettingsList](#swarmsettingslist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmSettings` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  | Optional: true <br /> |
| `spec` _[SwarmSettingsSpec](#swarmsettingsspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmSettingsStatus](#swarmsettingsstatus)_ |  |  | Optional: true <br /> |


#### SwarmSettingsList



SwarmSettingsList contains a list of SwarmSettings.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmSettingsList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmSettings](#swarmsettings) array_ |  |  |  |


#### SwarmSettingsSecurity



SwarmSettingsSecurity defines operator-level MCP security policy enforced at admission time.
The admission webhook loads all SwarmSettings in a namespace and applies the strictest
policy found - a single settings object with requireMCPAuth: true enforces it on all agents.



_Appears in:_
- [SwarmSettingsSpec](#swarmsettingsspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `mcpAllowlist` _string array_ | MCPAllowlist is a list of URL prefixes. When set, the admission webhook rejects<br />SwarmAgent specs that reference MCP server URLs not matching any listed prefix.<br />Use this to prevent agents from calling arbitrary external MCP endpoints (T9).<br />Example: ["https://search.mcp.example.com/", "https://browser.mcp.example.com/"] |  | MaxItems: 50 <br />Optional: true <br /> |
| `requireMCPAuth` _boolean_ | RequireMCPAuth: when true, the webhook rejects SwarmAgent specs that declare MCP<br />servers without an auth configuration (spec.mcpServers[*].auth.type must not be "none").<br />Ensures no agent can call an MCP server without verified credentials. |  | Optional: true <br /> |


#### SwarmSettingsSpec



SwarmSettingsSpec defines the shared configuration values.



_Appears in:_
- [SwarmSettings](#swarmsettings)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `temperature` _string_ | Temperature controls response randomness (0.0–1.0). |  | Pattern: `^(0(\.[0-9]+)?\|1(\.0+)?)$` <br /> |
| `outputFormat` _string_ | OutputFormat specifies the expected output format (e.g. "structured-json"). |  |  |
| `memoryBackend` _[MemoryBackend](#memorybackend)_ | MemoryBackend defines where agent memory is stored. | in-context | Enum: [in-context vector-store redis] <br /> |
| `fragments` _[PromptFragment](#promptfragment) array_ | Fragments is an ordered list of named prompt fragments composed into the agent system prompt.<br />Fragments from all referenced SwarmSettings are applied in settingsRefs list order.<br />When the same fragment name appears in multiple settings, the last occurrence wins. |  | MaxItems: 50 <br />Optional: true <br /> |
| `promptFragments` _[PromptFragments](#promptfragments)_ | PromptFragments is deprecated. Use Fragments instead.<br />When both are set, Fragments takes precedence and PromptFragments is ignored.<br />Retained for backward compatibility; will be removed in v1beta1. |  | Optional: true <br /> |
| `security` _[SwarmSettingsSecurity](#swarmsettingssecurity)_ | Security configures MCP server access policy enforced by the admission webhook.<br />The strictest policy across all referenced SwarmSettings wins. |  | Optional: true <br /> |
| `auditLog` _[AuditLogConfig](#auditlogconfig)_ | Observability configures namespace-level observability settings.<br />Overrides cluster-level (Helm) defaults; can be overridden per-agent.<br />AuditLog configures the structured audit trail at namespace level.<br />Overrides cluster-level (Helm) audit config; can be overridden per-agent. |  | Optional: true <br /> |
| `reasoning` _[ReasoningDefaults](#reasoningdefaults)_ | Reasoning sets the namespace-wide default reasoning config for SwarmAgents.<br />Per-agent spec.reasoning overrides per the RFC-0012 cascade rules.<br />Uses ReasoningDefaults (not ReasoningConfig) so Mode has no CRD-level<br />default - an unset cascade means "no namespace default", distinct from<br />"namespace default Disabled". |  | Optional: true <br /> |


#### SwarmSettingsStatus



SwarmSettingsStatus defines the observed state of SwarmSettings.



_Appears in:_
- [SwarmSettings](#swarmsettings)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the SwarmSettings. |  |  |


#### SwarmTeam



SwarmTeam is the unified resource for agent teams. It supports three execution modes:
dynamic mode (no spec.pipeline - service semantics, roles use delegate() for routing),
pipeline mode (spec.pipeline set - job semantics, DAG execution), and
routed mode (spec.routing set - LLM-driven capability dispatch via SwarmRegistry, RFC-0019).



_Appears in:_
- [SwarmTeamList](#swarmteamlist)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmTeam` | | |
| `metadata` _[ObjectMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#objectmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `spec` _[SwarmTeamSpec](#swarmteamspec)_ |  |  | Required: true <br /> |
| `status` _[SwarmTeamStatus](#swarmteamstatus)_ |  |  | Optional: true <br /> |


#### SwarmTeamAutoscaling



SwarmTeamAutoscaling configures demand-driven replica scaling for a team's inline agents.
The operator adjusts replicas between 0 and spec.roles[].replicas based on active pipeline steps.
This is distinct from KEDA-based autoscaling on individual SwarmAgents.



_Appears in:_
- [SwarmTeamSpec](#swarmteamspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `enabled` _boolean_ | Enabled turns on team-owned autoscaling. When false the operator does not touch replicas. |  | Optional: true <br /> |
| `scaleToZero` _[SwarmTeamScaleToZero](#swarmteamscaletozero)_ | ScaleToZero configures idle scale-to-zero.<br />When unset, roles are always kept at their configured replica count. |  | Optional: true <br /> |


#### SwarmTeamInputSpec



SwarmTeamInputSpec defines one formal input parameter for a pipeline.
Parameters declared here are validated and defaulted when an SwarmRun is created.



_Appears in:_
- [SwarmTeamSpec](#swarmteamspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the parameter key, referenced in step prompts via "\{\{ .input.&lt;name&gt; \}\}". |  | MinLength: 1 <br />Required: true <br /> |
| `type` _string_ | Type is the expected type of the value, used for documentation and tooling.<br />The operator enforces presence/default but does not coerce string values. | string | Enum: [string number boolean object array] <br />Optional: true <br /> |
| `description` _string_ | Description documents the parameter for operators and tooling. |  | Optional: true <br /> |
| `required` _boolean_ | Required marks this parameter as mandatory. When true and the parameter is<br />absent from spec.input at run creation, the SwarmRun is immediately failed. |  | Optional: true <br /> |
| `default` _string_ | Default is the value applied when Required is false and the parameter<br />is not provided in spec.input. |  | Optional: true <br /> |


#### SwarmTeamList



SwarmTeamList contains a list of SwarmTeam.





| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `apiVersion` _string_ | `kubeswarm.io/v1alpha1` | | |
| `kind` _string_ | `SwarmTeamList` | | |
| `metadata` _[ListMeta](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#listmeta-v1-meta)_ | Refer to Kubernetes API documentation for fields of `metadata`. |  |  |
| `items` _[SwarmTeam](#swarmteam) array_ |  |  |  |


#### SwarmTeamPhase

_Underlying type:_ _string_

SwarmTeamPhase describes the overall state of an SwarmTeam.

_Validation:_
- Enum: [Pending Ready Running Succeeded Failed]

_Appears in:_
- [SwarmTeamStatus](#swarmteamstatus)
- [TeamOutputSource](#teamoutputsource)

| Field | Description |
| --- | --- |
| `Pending` |  |
| `Ready` |  |
| `Running` |  |
| `Succeeded` |  |
| `Failed` |  |


#### SwarmTeamPipelineStep



SwarmTeamPipelineStep is one node in the SwarmTeam DAG pipeline.



_Appears in:_
- [SwarmRunSpec](#swarmrunspec)
- [SwarmTeamSpec](#swarmteamspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `role` _string_ | Role references a role name in spec.roles. The step name equals the role name. |  | MinLength: 1 <br />Required: true <br /> |
| `inputs` _object (keys:string, values:string)_ | Inputs is a map of input key -> Go template expression referencing pipeline<br />inputs or earlier step outputs. Example: "\{\{ .steps.research.output \}\}" |  |  |
| `dependsOn` _string array_ | DependsOn lists role names (step names) that must complete before this step runs. |  | MaxItems: 20 <br /> |
| `if` _string_ | If is an optional Go template expression. When set, the step only executes if the<br />expression evaluates to a truthy value. A falsy result marks the step Skipped. |  |  |
| `loop` _[LoopSpec](#loopspec)_ | Loop makes this step repeat until Condition evaluates to false or MaxIterations is reached. |  |  |
| `outputSchema` _string_ | OutputSchema is an optional JSON Schema string that constrains this step's output. |  |  |
| `validate` _[StepValidation](#stepvalidation)_ | Validate configures optional output validation for this step.<br />When set, the step enters Validating phase after the agent completes and only<br />transitions to Succeeded once all configured checks pass. |  | Optional: true <br /> |
| `outputArtifacts` _[ArtifactSpec](#artifactspec) array_ | OutputArtifacts declares file artifacts this step produces.<br />The agent writes each artifact to $AGENT_ARTIFACT_DIR/&lt;name&gt; after its task.<br />Artifact URLs are stored in PipelineStepStatus.Artifacts and available to<br />downstream steps via "\{\{ .steps.&lt;stepName&gt;.artifacts.&lt;name&gt; \}\}". |  | MaxItems: 20 <br />Optional: true <br /> |
| `inputArtifacts` _object (keys:string, values:string)_ | InputArtifacts maps a local artifact name to an upstream step's artifact.<br />The value format is "&lt;stepName&gt;.&lt;artifactName&gt;".<br />The resolved URL is injected via AGENT_INPUT_ARTIFACTS env var as a JSON map. |  | Optional: true <br /> |
| `registryLookup` _[RegistryLookupSpec](#registrylookupspec)_ | RegistryLookup resolves the executing agent by capability at runtime.<br />The SwarmRun controller resolves this before the step starts and records<br />the resolved agent in status.resolvedAgent. |  | Optional: true <br /> |
| `contextPolicy` _[StepContextPolicy](#stepcontextpolicy)_ | ContextPolicy controls how this step's output is prepared before injection<br />into downstream step prompts. Defaults to strategy=full (verbatim, current behaviour). |  | Optional: true <br /> |
| `maxOutputBytes` _integer_ | MaxOutputBytes limits the size of stored step output. Default: 65536 (64KB).<br />Outputs exceeding this limit are truncated with a "[truncated]" marker.<br />Set to 0 for unlimited (not recommended - risks exceeding etcd object size limits). | 65536 | Minimum: 0 <br />Optional: true <br /> |


#### SwarmTeamRole



SwarmTeamRole defines one role in the team.



_Appears in:_
- [SwarmRunSpec](#swarmrunspec)
- [SwarmTeamSpec](#swarmteamspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the unique role identifier (e.g. "researcher", "coordinator"). |  | MinLength: 1 <br />Required: true <br /> |
| `swarmAgent` _string_ | SwarmAgent is the name of an existing SwarmAgent in the same namespace.<br />Mutually exclusive with Model+SystemPrompt (inline definition). |  | Optional: true <br /> |
| `swarmTeam` _string_ | SwarmTeam is the name of another SwarmTeam in the same namespace whose entry role<br />fulfils this role. Only valid in pipeline mode (spec.pipeline must be set). |  | Optional: true <br /> |
| `model` _string_ | Model is the LLM model ID for an inline role definition.<br />If set, the operator auto-creates an SwarmAgent named \{team\}-\{role\}. |  | Optional: true <br /> |
| `prompt` _[AgentPrompt](#agentprompt)_ | Prompt configures the system prompt for an inline role's auto-created SwarmAgent.<br />Matches the SwarmAgent spec.prompt structure (inline or from ConfigMap/Secret). |  | Optional: true <br /> |
| `tools` _[AgentTools](#agenttools)_ | Tools groups MCP server connections and inline webhook tools for an inline role.<br />Matches the SwarmAgent spec.tools structure. |  | Optional: true <br /> |
| `runtime` _[AgentRuntime](#agentruntime)_ | Runtime groups replica count, autoscaling, and resources for an inline role. |  | Optional: true <br /> |
| `limits` _[GuardrailLimits](#guardraillimits)_ | Limits constrains per-agent resource usage for an inline role definition. |  | Optional: true <br /> |
| `canDelegate` _string array_ | CanDelegate lists role names this role is permitted to call via delegate().<br />Empty means this is a leaf role - it cannot delegate further. |  | MaxItems: 20 <br />Optional: true <br /> |
| `settings` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core) array_ | Settings references SwarmSettings objects whose fragments are composed into this<br />role's system prompt, in list order. Only applies to inline roles.<br />For roles referencing an external SwarmAgent, set settings on the SwarmAgent CR directly. |  | Optional: true <br /> |
| `envFrom` _[EnvFromSource](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#envfromsource-v1-core) array_ | EnvFrom injects environment variables from Secrets or ConfigMaps into the agent pods<br />created for this role. Use this to supply API keys on a per-role basis.<br />Only applies to inline roles. |  | Optional: true <br /> |
| `plugins` _[AgentPlugins](#agentplugins)_ | Plugins configures external gRPC provider or queue overrides for this role (RFC-0025).<br />Only applies to inline roles. |  | Optional: true <br /> |


#### SwarmTeamRoleStatus



SwarmTeamRoleStatus captures the observed state of one team role.



_Appears in:_
- [SwarmTeamStatus](#swarmteamstatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name matches SwarmTeamRole.Name. |  |  |
| `readyReplicas` _integer_ | ReadyReplicas is the number of agent pods ready to accept tasks. |  |  |
| `desiredReplicas` _integer_ | DesiredReplicas is the configured replica count for this role. |  |  |
| `managedSwarmAgent` _string_ | ManagedSwarmAgent is the name of the auto-created SwarmAgent for inline roles. |  |  |


#### SwarmTeamRoutingSpec



SwarmTeamRoutingSpec configures routed mode execution for an SwarmTeam.
When set on an SwarmTeam, incoming tasks are dispatched automatically to the
best-matching agent by an LLM router call against SwarmRegistry - no pipeline
DAG or hardcoded roles required.



_Appears in:_
- [SwarmRunSpec](#swarmrunspec)
- [SwarmTeamSpec](#swarmteamspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `registryRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | RegistryRef names the SwarmRegistry to query for capability resolution.<br />Defaults to the first SwarmRegistry found in the namespace when omitted. |  | Optional: true <br /> |
| `model` _string_ | Model is the LLM model used for the router call.<br />A lightweight model (e.g. haiku) is sufficient and recommended.<br />Defaults to the operator-wide default model when omitted. |  | MinLength: 1 <br />Optional: true <br /> |
| `systemPrompt` _string_ | SystemPrompt overrides the default router system prompt.<br />Use \{\{ .Capabilities \}\} to embed the capability list and<br />\{\{ .Input \}\} to embed the task input in a custom prompt. |  | Optional: true <br /> |
| `fallback` _string_ | Fallback is the name of a standalone SwarmAgent to use when no capability<br />matches or the router LLM fails to select one.<br />When absent and no match is found, the run fails with RoutingFailed. |  | Optional: true <br /> |


#### SwarmTeamScaleToZero



SwarmTeamScaleToZero configures scale-to-zero behaviour for a team's inline agents.



_Appears in:_
- [SwarmTeamAutoscaling](#swarmteamautoscaling)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `enabled` _boolean_ | Enabled activates scale-to-zero. When true, idle roles are scaled to 0 replicas after<br />AfterSeconds of inactivity and are warmed back up automatically when a new run triggers. |  | Optional: true <br /> |
| `afterSeconds` _integer_ | AfterSeconds is how long a role must be idle (no active steps) before it is scaled to zero.<br />Minimum 30. Defaults to 300 (5 minutes). | 300 | Minimum: 30 <br />Optional: true <br /> |


#### SwarmTeamSpec



SwarmTeamSpec defines the desired state of SwarmTeam.



_Appears in:_
- [SwarmTeam](#swarmteam)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `entry` _string_ | Entry is the role name that receives external tasks in dynamic mode.<br />Exactly one role should be the entry point for dynamic teams.<br />In pipeline mode (spec.pipeline set), entry is optional. |  | Optional: true <br /> |
| `output` _string_ | Output is a Go template expression that selects the final pipeline result.<br />Example: "\{\{ .steps.summarize.output \}\}"<br />Only used in pipeline mode. |  | Optional: true <br /> |
| `inputs` _[SwarmTeamInputSpec](#swarmteaminputspec) array_ | Inputs defines the formal schema for pipeline input parameters.<br />When set, required parameters are enforced and defaults are applied before<br />an SwarmRun starts executing. Steps reference these values via "\{\{ .input.&lt;name&gt; \}\}". |  | MaxItems: 20 <br />Optional: true <br /> |
| `input` _object (keys:string, values:string)_ | Input is the initial data passed into the pipeline.<br />Step inputs can reference these values via "\{\{ .input.&lt;key&gt; \}\}".<br />Only used in pipeline mode. |  | Optional: true <br /> |
| `timeoutSeconds` _integer_ | TimeoutSeconds is the maximum wall-clock seconds the pipeline may run.<br />Zero means no timeout. Only used in pipeline mode. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxTokens` _integer_ | MaxTokens is the total token budget for the entire pipeline run.<br />Zero means no limit. Only used in pipeline mode. |  | Minimum: 1 <br />Optional: true <br /> |
| `maxDailyTokens` _integer_ | MaxDailyTokens is the rolling 24-hour token budget across the whole team pipeline.<br />Zero means no daily limit. |  | Minimum: 1 <br />Optional: true <br /> |
| `roles` _[SwarmTeamRole](#swarmteamrole) array_ | Roles defines the roles that make up this team.<br />At least one role is required unless spec.routing is set (routed mode). |  | MaxItems: 50 <br />Optional: true <br /> |
| `pipeline` _[SwarmTeamPipelineStep](#swarmteampipelinestep) array_ | Pipeline defines an optional DAG of steps that drive ordered execution.<br />When set, the team operates in pipeline mode (job semantics).<br />When unset, the team operates in dynamic mode (service semantics). |  | MaxItems: 100 <br />Optional: true <br /> |
| `defaultContextPolicy` _[StepContextPolicy](#stepcontextpolicy)_ | DefaultContextPolicy is applied to any step's output when it is referenced<br />by a non-adjacent downstream step. A step is considered adjacent when it<br />appears in the consuming step's dependsOn list, or is the immediately<br />preceding step when dependsOn is absent.<br />Per-step contextPolicy takes precedence over this default.<br />When unset, strategy=full is used for all steps (current behaviour). |  | Optional: true <br /> |
| `successfulRunsHistoryLimit` _integer_ | SuccessfulRunsHistoryLimit is the number of successful SwarmRun objects to<br />retain for this team. Oldest runs beyond this limit are deleted automatically.<br />Set to 0 to delete successful runs immediately after completion. | 10 | Minimum: 0 <br />Optional: true <br /> |
| `failedRunsHistoryLimit` _integer_ | FailedRunsHistoryLimit is the number of failed SwarmRun objects to retain. | 3 | Minimum: 0 <br />Optional: true <br /> |
| `runRetainFor` _[Duration](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#duration-v1-meta)_ | RunRetainFor is the maximum age of completed SwarmRun objects for this team.<br />Runs older than this duration are deleted regardless of the history limits.<br />Zero means no age-based cleanup (only count-based limits apply).<br />Example: "168h" (7 days), "720h" (30 days). |  | Optional: true <br /> |
| `notifyRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | NotifyRef references an SwarmNotify policy in the same namespace.<br />When set, the operator dispatches notifications after terminal phase transitions. |  | Optional: true <br /> |
| `budgetRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | BudgetRef references an SwarmBudget in the same namespace that governs token<br />spend for this team. When the budget is exhausted, new runs are blocked. |  | Optional: true <br /> |
| `registryRef` _string_ | RegistryRef names the SwarmRegistry used for registryLookup steps and routed<br />mode agent resolution. Defaults to "default". | default | Optional: true <br /> |
| `artifactStore` _[ArtifactStoreSpec](#artifactstorespec)_ | ArtifactStore configures where pipeline file artifacts are stored.<br />When unset, file artifact support is disabled and any OutputArtifacts<br />declarations on pipeline steps are ignored. |  | Optional: true <br /> |
| `autoscaling` _[SwarmTeamAutoscaling](#swarmteamautoscaling)_ | Autoscaling configures demand-driven replica scaling for this team's inline agents.<br />When enabled, the operator scales each role's managed SwarmAgent between 0 and its<br />configured replica count based on the number of active pipeline steps for that role.<br />Only applies to inline roles (those with model+systemPrompt); external SwarmAgent references<br />are not scaled by the team controller. |  | Optional: true <br /> |
| `routing` _[SwarmTeamRoutingSpec](#swarmteamroutingspec)_ | Routing configures routed mode. When set, the team operates in routed mode:<br />tasks are dispatched automatically via an LLM router call against SwarmRegistry.<br />Mutually exclusive with spec.pipeline and spec.roles. |  | Optional: true <br /> |


#### SwarmTeamStatus



SwarmTeamStatus defines the observed state of SwarmTeam.



_Appears in:_
- [SwarmTeam](#swarmteam)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `phase` _[SwarmTeamPhase](#swarmteamphase)_ | Phase is the overall team state.<br />For pipeline teams this mirrors the most recent SwarmRun phase.<br />For dynamic teams this reflects infrastructure readiness. |  | Enum: [Pending Ready Running Succeeded Failed] <br /> |
| `roles` _[SwarmTeamRoleStatus](#swarmteamrolestatus) array_ | Roles lists the observed state of each role. |  |  |
| `entryRole` _string_ | EntryRole is the role name that is the external submission point. |  |  |
| `lastRunName` _string_ | LastRunName is the name of the most recently created SwarmRun for this team.<br />Empty when no run has been triggered yet. |  |  |
| `lastRunPhase` _[SwarmRunPhase](#swarmrunphase)_ | LastRunPhase is the phase of the most recently created SwarmRun.<br />Mirrors SwarmRun.Status.Phase for quick visibility in kubectl get swarmteam. |  | Enum: [Pending Running Succeeded Failed] <br /> |
| `scaledToZero` _boolean_ | ScaledToZero is true when all inline-role agents have been scaled to 0 replicas<br />due to team autoscaling idle timeout. The team warms up automatically when triggered. |  | Optional: true <br /> |
| `lastActiveTime` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastActiveTime is when the team last had an active (running) pipeline step.<br />Used by the autoscaler to decide when to scale idle roles to zero. |  | Optional: true <br /> |
| `observedGeneration` _integer_ | ObservedGeneration is the .metadata.generation this status reflects. |  |  |
| `conditions` _[Condition](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#condition-v1-meta) array_ | Conditions reflect the current state of the SwarmTeam. |  |  |


#### SystemPromptSource



SystemPromptSource selects a system prompt from a ConfigMap or Secret key.
Exactly one of configMapKeyRef and secretKeyRef must be set.



_Appears in:_
- [AgentPrompt](#agentprompt)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `configMapKeyRef` _[ConfigMapKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#configmapkeyselector-v1-core)_ | ConfigMapKeyRef selects a key of a ConfigMap in the same namespace. |  | Optional: true <br /> |
| `secretKeyRef` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | SecretKeyRef selects a key of a Secret in the same namespace.<br />Use when the prompt contains sensitive instructions. |  | Optional: true <br /> |


#### TeamOutputSource



TeamOutputSource references an SwarmTeam whose pipeline completion fires the trigger.



_Appears in:_
- [SwarmEventSource](#swarmeventsource)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the SwarmTeam to watch. |  | Required: true <br /> |
| `onPhase` _[SwarmTeamPhase](#swarmteamphase)_ | OnPhase is the team phase that fires the trigger. Defaults to Succeeded. | Succeeded | Enum: [Pending Ready Running Succeeded Failed] <br /> |


#### TokenUsage



TokenUsage records the number of tokens consumed by a single step or the whole pipeline.



_Appears in:_
- [PipelineStepStatus](#pipelinestepstatus)
- [SwarmAgentStatus](#swarmagentstatus)
- [SwarmRunStatus](#swarmrunstatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `inputTokens` _integer_ | InputTokens is the total number of prompt/input tokens sent to the LLM. |  |  |
| `outputTokens` _integer_ | OutputTokens is the total number of final-answer/completion tokens generated<br />by the LLM. This does NOT include thinking tokens - those are counted<br />separately in ThinkingTokens. |  |  |
| `thinkingTokens` _integer_ | ThinkingTokens is the number of tokens spent on the model's internal<br />reasoning pass, billed at the provider's thinking-token rate.<br />Counted separately from OutputTokens, not additive. Total tokens per<br />step is InputTokens + OutputTokens + ThinkingTokens; consumers must sum<br />all three to avoid undercounting. Zero on non-reasoning calls. For<br />multi-turn steps (tool-use loops), this is the sum across all turns in<br />the step. |  | Optional: true <br /> |
| `totalTokens` _integer_ | TotalTokens is InputTokens + OutputTokens + ThinkingTokens, provided for<br />convenient display. |  |  |
| `model` _string_ | Model identifies which model generated this usage record.<br />Populated for advisor calls to enable per-model cost attribution. |  | Optional: true <br /> |


#### ToolAgentConnectionStatus



ToolAgentConnectionStatus reports the status of one tool-role agent connection.



_Appears in:_
- [SwarmAgentStatus](#swarmagentstatus)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name matches the AgentConnection name. |  |  |
| `ready` _boolean_ | Ready indicates the target agent exists and has ready replicas. |  |  |
| `trust` _[ToolTrustLevel](#tooltrustlevel)_ | Trust is the trust level assigned to this connection. |  | Enum: [internal external sandbox] <br />Optional: true <br /> |
| `lastTransitionTime` _[Time](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#time-v1-meta)_ | LastTransitionTime is the last time Ready changed. |  |  |


#### ToolPermissions



ToolPermissions defines allow/deny lists and trust policy for tool calls.



_Appears in:_
- [AgentGuardrails](#agentguardrails)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `allow` _string array_ | Allow is an allowlist of tool calls in "&lt;server-name&gt;/&lt;tool-name&gt;" format.<br />Wildcards are supported: "filesystem/*" allows all tools from the filesystem server.<br />When set, only listed tool calls are permitted. Deny takes precedence over allow. |  | MaxItems: 100 <br />Optional: true <br /> |
| `deny` _string array_ | Deny is a denylist of tool calls in "&lt;server-name&gt;/&lt;tool-name&gt;" format.<br />Wildcards are supported: "shell/*" denies all shell tools.<br />Deny takes precedence over allow when both match. |  | MaxItems: 100 <br />Optional: true <br /> |
| `trust` _[ToolTrustPolicy](#tooltrustpolicy)_ | Trust configures the default trust level and input validation policy. |  | Optional: true <br /> |


#### ToolTrustLevel

_Underlying type:_ _string_

ToolTrustLevel classifies the trust level of a tool or agent connection.
Used by the admission controller and runtime to enforce input validation policy.

_Validation:_
- Enum: [internal external sandbox]

_Appears in:_
- [AgentConnection](#agentconnection)
- [EffectivePolicySpec](#effectivepolicyspec)
- [MCPToolSpec](#mcptoolspec)
- [PolicyTools](#policytools)
- [SwarmAgentMCPStatus](#swarmagentmcpstatus)
- [ToolAgentConnectionStatus](#toolagentconnectionstatus)
- [ToolTrustPolicy](#tooltrustpolicy)
- [WebhookToolSpec](#webhooktoolspec)

| Field | Description |
| --- | --- |
| `internal` | ToolTrustInternal is for tools within the same organisation / cluster.<br /> |
| `external` | ToolTrustExternal is for third-party or internet-facing tools.<br /> |
| `sandbox` | ToolTrustSandbox is for untrusted or experimental tools; enforces strictest validation.<br /> |


#### ToolTrustPolicy



ToolTrustPolicy sets the default trust level and validation behaviour for tools.



_Appears in:_
- [ToolPermissions](#toolpermissions)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `default` _[ToolTrustLevel](#tooltrustlevel)_ | Default is the trust level applied to tools and agents that do not declare<br />an explicit trust field. Defaults to external. | external | Enum: [internal external sandbox] <br />Optional: true <br /> |


#### TriggerSourceType

_Underlying type:_ _string_

TriggerSourceType identifies what fires the trigger.

_Validation:_
- Enum: [cron webhook team-output]

_Appears in:_
- [SwarmEventSource](#swarmeventsource)

| Field | Description |
| --- | --- |
| `cron` | TriggerSourceCron fires on a cron schedule.<br /> |
| `webhook` | TriggerSourceWebhook fires when an HTTP POST is received at the trigger's webhook URL.<br /> |
| `team-output` | TriggerSourceTeamOutput fires when a named SwarmTeam pipeline reaches a given phase.<br /> |


#### VectorStoreMemoryConfig



VectorStoreMemoryConfig configures the vector-store memory backend.



_Appears in:_
- [SwarmMemorySpec](#swarmmemoryspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `provider` _[VectorStoreProvider](#vectorstoreprovider)_ | Provider is the vector database to use. |  | Enum: [qdrant pgvector] <br /> |
| `endpoint` _string_ | Endpoint is the base URL of the vector database (e.g. "http://qdrant:6333"). |  | Required: true <br /> |
| `collection` _string_ | Collection is the collection/index name to store memories in. | agent-memories |  |
| `secretRef` _[LocalObjectReference](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#localobjectreference-v1-core)_ | SecretRef optionally names a Secret whose VECTOR_STORE_API_KEY is injected into agent pods. |  |  |
| `ttlSeconds` _integer_ | TTLSeconds is how long memory entries are retained. 0 means no expiry. |  |  |


#### VectorStoreProvider

_Underlying type:_ _string_

VectorStoreProvider names a supported vector database.

_Validation:_
- Enum: [qdrant pgvector]

_Appears in:_
- [VectorStoreMemoryConfig](#vectorstorememoryconfig)

| Field | Description |
| --- | --- |
| `qdrant` |  |
| `pgvector` |  |


#### WebhookChannelSpec



WebhookChannelSpec configures a generic HTTP POST notification channel.



_Appears in:_
- [NotifyChannelSpec](#notifychannelspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `url` _string_ | URL is the webhook endpoint as a literal string. |  | Optional: true <br /> |
| `urlFrom` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | URLFrom reads the URL from a Secret key. Takes precedence over URL. |  | Optional: true <br /> |
| `method` _string_ | Method is the HTTP method. Defaults to POST. | POST | Enum: [GET POST PUT PATCH] <br /> |
| `headers` _[WebhookHeader](#webhookheader) array_ | Headers are additional HTTP headers included in every request. |  | MaxItems: 20 <br />Optional: true <br /> |


#### WebhookHeader



WebhookHeader defines a single HTTP header added to outbound webhook requests.



_Appears in:_
- [WebhookChannelSpec](#webhookchannelspec)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the HTTP header name. |  |  |
| `value` _string_ | Value is the literal header value. |  | Optional: true <br /> |
| `valueFrom` _[SecretKeySelector](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#secretkeyselector-v1-core)_ | ValueFrom reads the header value from a Secret key. |  | Optional: true <br /> |


#### WebhookToolSpec



WebhookToolSpec defines an inline HTTP tool available to the agent without a full MCP server.
Use for simple single-endpoint callbacks. For rich integrations prefer an MCP server.



_Appears in:_
- [AgentTools](#agenttools)

| Field | Description | Default | Validation |
| --- | --- | --- | --- |
| `name` _string_ | Name is the tool identifier exposed to the LLM. Must be unique within the agent. |  | MinLength: 1 <br />Required: true <br /> |
| `url` _string_ | URL is the HTTP endpoint the agent calls when the LLM invokes this tool. |  | Required: true <br /> |
| `method` _string_ | Method is the HTTP method used when calling the endpoint. | POST | Enum: [GET POST PUT PATCH] <br /> |
| `description` _string_ | Description explains the tool's purpose to the LLM and to human operators. |  | Optional: true <br /> |
| `trust` _[ToolTrustLevel](#tooltrustlevel)_ | Trust classifies the trust level of this webhook endpoint.<br />Defaults to the guardrails.tools.trust.default when unset. |  | Enum: [internal external sandbox] <br />Optional: true <br /> |
| `schema` _[RawExtension](https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.33/#rawextension-runtime-pkg)_ | Schema is a JSON Schema object describing the tool's input parameters.<br />Stored as a raw JSON/YAML object; validated by the LLM runtime. |  | Optional: true <br /> |


