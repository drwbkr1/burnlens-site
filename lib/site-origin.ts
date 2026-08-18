const LOCAL_METADATA_ORIGIN = "https://burnlensproject.org";

export type DeploymentContext = "local" | "preview" | "production";

function getDeploymentContext(environment: NodeJS.ProcessEnv): DeploymentContext {
  const configuredContext = environment.PORTFOLIO_DEPLOYMENT_CONTEXT?.trim();

  if (configuredContext) {
    if (!(["local", "preview", "production"] as const).includes(configuredContext as DeploymentContext)) {
      throw new Error(
        "PORTFOLIO_DEPLOYMENT_CONTEXT must be local, preview, or production.",
      );
    }

    if (
      environment.VERCEL_ENV &&
      environment.VERCEL_ENV !== "development" &&
      environment.VERCEL_ENV !== configuredContext
    ) {
      throw new Error(
        "PORTFOLIO_DEPLOYMENT_CONTEXT must agree with VERCEL_ENV when both are present.",
      );
    }

    return configuredContext as DeploymentContext;
  }

  if (environment.VERCEL_ENV === "production") {
    return "production";
  }

  if (environment.VERCEL_ENV === "preview" || environment.VERCEL_ENV === "development") {
    return "preview";
  }

  return "local";
}

function isLoopbackHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
}

export function getSiteUrl(environment: NodeJS.ProcessEnv = process.env) {
  const deploymentContext = getDeploymentContext(environment);
  const configuredOrigin = environment.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredOrigin) {
    if (deploymentContext !== "local") {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is required for preview and production builds so canonical metadata cannot fall back silently.",
      );
    }

    // This keeps local builds deterministic against the selected future portfolio origin.
    return new URL(LOCAL_METADATA_ORIGIN);
  }

  let siteUrl: URL;

  try {
    siteUrl = new URL(configuredOrigin);
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an absolute HTTP(S) origin.");
  }

  if (siteUrl.protocol !== "https:" && siteUrl.protocol !== "http:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS.");
  }

  if (siteUrl.protocol === "http:" && !isLoopbackHostname(siteUrl.hostname)) {
    throw new Error("NEXT_PUBLIC_SITE_URL must use HTTPS unless it points to a loopback host.");
  }

  if (siteUrl.username || siteUrl.password) {
    throw new Error("NEXT_PUBLIC_SITE_URL must not contain credentials.");
  }

  if (siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an origin without a path, query, or fragment.");
  }

  return new URL(siteUrl.origin);
}

export function getSiteOrigin(environment: NodeJS.ProcessEnv = process.env) {
  return getSiteUrl(environment).origin;
}

export function shouldIndexSite(environment: NodeJS.ProcessEnv = process.env) {
  const deploymentContext = getDeploymentContext(environment);
  const directive = environment.NEXT_PUBLIC_SITE_INDEXING?.trim().toLowerCase();

  if (directive && directive !== "allow" && directive !== "deny") {
    throw new Error("NEXT_PUBLIC_SITE_INDEXING must be allow or deny.");
  }

  if (deploymentContext !== "production") {
    if (directive === "allow") {
      throw new Error("NEXT_PUBLIC_SITE_INDEXING=allow is valid only for an explicit production context.");
    }

    return false;
  }

  if (!environment.NEXT_PUBLIC_SITE_URL?.trim()) {
    throw new Error("Production indexing requires an exact NEXT_PUBLIC_SITE_URL.");
  }

  if (!directive) {
    throw new Error("Production builds require an explicit NEXT_PUBLIC_SITE_INDEXING decision.");
  }

  return directive === "allow";
}
