import React, { useEffect, useState } from "react";
import CodeBlock from "@theme/CodeBlock";

interface Versions {
  kubeswarm: string;
  cli: string;
  chart: string;
}

const FALLBACK: Versions = {
  kubeswarm: "LATEST",
  cli: "LATEST",
  chart: "LATEST",
};

function stripV(tag: string): string {
  return tag.replace(/^v/, "");
}

async function fetchVersions(): Promise<Versions> {
  const [kubeswarm, cli, chart] = await Promise.allSettled([
    fetch(
      "https://api.github.com/repos/kubeswarm/kubeswarm/releases/latest",
    ).then((r) => r.json()),
    fetch(
      "https://api.github.com/repos/kubeswarm/kubeswarm-cli/releases/latest",
    ).then((r) => r.json()),
    fetch(
      "https://api.github.com/repos/kubeswarm/helm-charts/releases/latest",
    ).then((r) => r.json()),
  ]);

  return {
    kubeswarm:
      kubeswarm.status === "fulfilled" && kubeswarm.value.tag_name
        ? stripV(kubeswarm.value.tag_name)
        : FALLBACK.kubeswarm,
    cli:
      cli.status === "fulfilled" && cli.value.tag_name
        ? stripV(cli.value.tag_name)
        : FALLBACK.cli,
    chart:
      chart.status === "fulfilled" && chart.value.tag_name
        ? stripV(chart.value.tag_name)
        : FALLBACK.chart,
  };
}

let cached: Versions | null = null;

interface Props {
  children: string;
  language?: string;
  title?: string;
}

/**
 * Replaces placeholders in code blocks with live GitHub release versions.
 *
 * Placeholders:
 *   VERSION        -> latest kubeswarm operator release tag
 *   CLI_VERSION    -> latest cli release tag
 *   CHART_VERSION  -> latest helm-charts release tag
 *
 * Usage in MDX:
 *   <VersionedCode language="bash">
 *   helm install kubeswarm oci://ghcr.io/kubeswarm/helm-charts/kubeswarm --version CHART_VERSION
 *   </VersionedCode>
 */
export default function VersionedCode({
  children,
  language = "bash",
  title,
}: Props): JSX.Element {
  const [versions, setVersions] = useState<Versions>(cached ?? FALLBACK);

  useEffect(() => {
    if (cached) {
      setVersions(cached);
      return;
    }
    fetchVersions().then((v) => {
      cached = v;
      setVersions(v);
    });
  }, []);

  // Replace longer tokens first so VERSION doesn't partially match CLI_VERSION/CHART_VERSION
  const resolved = children
    .replace(/CHART_VERSION/g, versions.chart)
    .replace(/CLI_VERSION/g, versions.cli)
    .replace(/VERSION/g, versions.kubeswarm);

  return (
    <CodeBlock language={language} title={title}>
      {resolved}
    </CodeBlock>
  );
}
