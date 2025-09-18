module.exports = {
  apps: [
    {
      name: 'frontend',
      cwd: 'apps/web',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_BASE: '/api'
      }
    },
    {
      name: 'backend',
      cwd: 'apps/api',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      }
    }
  ]
}
