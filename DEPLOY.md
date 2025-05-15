# GitHub Pages Deployment Solution

If you are experiencing errors with GitHub Pages deployment through GitHub Actions, follow these instructions:

## GitHub Permissions Setup

1. Go to your repository on GitHub.
2. Click on "Settings".
3. Navigate to "Actions" > "General" in the sidebar menu.
4. In the "Workflow permissions" section, ensure that "Read and write permissions" is selected.
5. Save the changes.

## Using the Correct Token

In your workflow file (.github/workflows/deploy.yml), make sure you're using the correct token:

```yaml
- name: Deploy 🚀
    uses: peaceiris/actions-gh-pages@v3
    with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./deploy
```

## Verify Deployment Directory Exists

Ensure that the `./deploy` directory exists and contains the files you want to publish:

```bash
# Run the deployment preparation script
npm run prepare-deploy

# Verify directory contents
ls -la deploy/
```

## Manual Deployment (alternative)

If you continue to experience issues with automated actions, you can deploy manually:

```bash
# Run the deployment preparation script
npm run prepare-deploy

# Deploy with gh-pages
npm run deploy
```
