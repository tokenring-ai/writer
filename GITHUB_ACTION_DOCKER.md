# GitHub Action for Docker Build and Push

This document explains the GitHub Action workflow that builds and pushes the Docker image to GitHub Container Registry (
GHCR).

## Workflow Overview

The workflow is defined in `.github/workflows/docker-build-push.yml` and performs the following actions:

1. Builds the Docker image using the Dockerfile in the `docker` directory
2. Pushes the built image to GitHub Container Registry (GHCR)

## Triggers

The workflow is triggered by:

- Push to the `main` branch
- Push of version tags (e.g., `v1.0.0`)
- Pull requests to the `main` branch
- Manual workflow dispatch from the GitHub Actions UI

## Docker Image

The Docker image is built from the Dockerfile located at `docker/Dockerfile`. The image is tagged with:

- The semantic version (if a tag is pushed)
- The major.minor version (if a tag is pushed)
- The branch name (if a branch is pushed)
- The PR number (if a PR is created)
- The short SHA of the commit
- `latest` (if the push is to the default branch)

## Authentication

The workflow uses the `GITHUB_TOKEN` secret for authentication with GitHub Container Registry. No additional secrets
need to be configured.

## Permissions

The workflow requires the following permissions:

- `contents: read` - To read the repository contents
- `packages: write` - To push the Docker image to GHCR

## Usage

### Accessing the Docker Image

Once the workflow has run successfully, the Docker image will be available at:

```
ghcr.io/OWNER/REPOSITORY:TAG
```

Where:

- `OWNER` is the GitHub username or organization name
- `REPOSITORY` is the name of the repository
- `TAG` is one of the tags mentioned above

### Pulling the Docker Image

To pull the Docker image, you need to authenticate with GitHub Container Registry:

```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
docker pull ghcr.io/OWNER/REPOSITORY:TAG
```

### Running the Docker Image

To run the Docker image:

```bash
docker run -ti --net host -v ./:/work:rw ghcr.io/OWNER/REPOSITORY:TAG
```

## Troubleshooting

If the workflow fails, check the following:

1. Ensure the repository has the correct permissions for GitHub Actions
2. Check that the Dockerfile builds successfully locally
3. Verify that the GitHub token has the necessary permissions

## Manual Trigger

You can manually trigger the workflow from the GitHub Actions UI:

1. Go to the "Actions" tab in your repository
2. Select "Build and Push Docker Image" workflow
3. Click "Run workflow"
4. Select the branch to run the workflow on
5. Click "Run workflow"