/**
 * Central link and version configuration for kubeswarm docs.
 *
 * All external URLs and version strings live here so they can be updated
 * in one place when a new release ships. Content pages import from here
 * instead of hardcoding URLs.
 *
 * Usage in .mdx files:
 *   import { links, versions } from '@site/config/links';
 *
 * Usage in docusaurus.config.ts:
 *   import { links } from './config/links';
 */

export const versions = {
  kubeswarm: "0.3.0",
  helmChart: "0.3.0",
  cli: "0.3.0",
  kubernetes: "1.35",
  helm: "3.12",
  keda: "2.16",
};

export const links = {
  // GitHub repos
  github: {
    kubeswarm: "https://github.com/kubeswarm/kubeswarm",
    runtime: "https://github.com/kubeswarm/kubeswarm/tree/main/runtime",
    cli: "https://github.com/kubeswarm/kubeswarm-cli",
    helmCharts: "https://github.com/kubeswarm/helm-charts",
    cookbook: "https://github.com/kubeswarm/kubeswarm-cookbook",
    docs: "https://github.com/kubeswarm/kubeswarm-docs",
    dashboard: "https://github.com/kubeswarm/kubeswarm-dashboard",
    discussions: "https://github.com/kubeswarm/kubeswarm/discussions",
    issues: "https://github.com/kubeswarm/kubeswarm/issues",
  },

  // Helm
  helmRepo: "https://kubeswarm.github.io/helm-charts",
  helmOCI: "oci://ghcr.io/kubeswarm/helm-charts/kubeswarm",

  // Container images
  images: {
    operator: "ghcr.io/kubeswarm/kubeswarm-controller",
    agent: "ghcr.io/kubeswarm/kubeswarm-runtime",
    dashboard: "ghcr.io/kubeswarm/kubeswarm-dashboard",
    cli: "ghcr.io/kubeswarm/kubeswarm-cli",
  },

  // External docs
  external: {
    keda: "https://keda.sh/docs/deploy/",
    ollama: "https://ollama.com",
    qdrant: "https://qdrant.tech/documentation/",
    anthropic: "https://docs.anthropic.com/",
    openai: "https://platform.openai.com/docs/",
  },
};
