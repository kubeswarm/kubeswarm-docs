import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "kubeswarm",
  tagline: "Orchestrate AI agents at swarm scale",
  favicon: "https://assets.kubeswarm.io/favicon.png",

  url: "https://docs.kubeswarm.io",
  baseUrl: "/",

  organizationName: "kubeswarm",
  projectName: "kubeswarm",

  trailingSlash: true,
  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          routeBasePath: "/",
          editUrl: "https://github.com/kubeswarm/kubeswarm-docs/edit/main/",
          lastVersion: "current",
          versions: {
            current: {
              label: "v0.1.0-alpha.1",
              path: "/",
            },
          },
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
        },
      } satisfies Preset.Options,
    ],
  ],

  headTags: [
    {
      tagName: "meta",
      attributes: {
        name: "keywords",
        content:
          "kubeswarm, kubernetes ai agents, ai agent orchestration, mcp tools, llm kubernetes, ai agent platform, kubernetes operator ai, swarm agents",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "robots",
        content: "index, follow, noai, noimageai",
      },
    },
  ],

  themeConfig: {
    image: "https://assets.kubeswarm.io/kubeswarm-social.svg",
    metadata: [
      {
        name: "description",
        content:
          "kubeswarm documentation - Kubernetes operator for AI agent orchestration. Deploy, scale and operate LLM agents with MCP tools, guardrails and team workflows.",
      },
    ],
    colorMode: {
      defaultMode: "dark",
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "kubeswarm",
      logo: {
        alt: "kubeswarm - agents are workloads, manage them like it",
        src: "https://assets.kubeswarm.io/logo.svg",
        srcDark: "https://assets.kubeswarm.io/logo.svg",
        height: "32",
      },
      items: [
        {
          type: "docsVersionDropdown",
          position: "right",
          dropdownActiveClassDisabled: true,
        },
        {
          href: "https://github.com/kubeswarm/kubeswarm",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            { label: "Quick Start", to: "/quick-start" },
            { label: "Safety & Governance", to: "/safety/overview" },
            { label: "Custom Resources", to: "/reference/custom-resources" },
            { label: "API Reference", to: "/reference/api" },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/kubeswarm/kubeswarm",
            },
            {
              label: "GitHub Discussions",
              href: "https://github.com/kubeswarm/kubeswarm/discussions",
            },
          ],
        },
      ],
      copyright: `Copyright ${new Date().getFullYear()} kubeswarm`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.oneDark,
      additionalLanguages: ["bash", "yaml", "go", "json", "toml"],
    },
    algolia: {
      appId: "69NESW31GA",
      apiKey: "aa69e2cda16d37bceb79fa2ca43d7882",
      indexName: "kubeswarm",
      contextualSearch: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
