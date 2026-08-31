import { defineConfig } from 'vite'

export default defineConfig(({ command }) => {
  const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'PaginaGimnasio'
  const isGitHubPages = command === 'build' && process.env.GITHUB_ACTIONS === 'true'

  return {
    base: isGitHubPages ? `/${repoName}/` : './',
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: true,
    },
    preview: {
      host: '0.0.0.0',
      port: 5000,
    },
  }
})