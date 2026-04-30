#!/bin/sh
# Push a local Docker image to Docker Hub.
#
# Usage:
#   sh push_image.sh [local_image] [tag]
#
# Example:
#   sh push_image.sh 3d-printing-website-web latest

set -eu

# Hardcoded Docker Hub namespace (must be Docker Hub username, not email).
DOCKERHUB_USER="ngocanhknx"
LOCAL_IMAGE="${1:-3d-printing-website-web}"
IMAGE_TAG="${2:-latest}"

LOCAL_REF="${LOCAL_IMAGE}:${IMAGE_TAG}"
REMOTE_REF="${DOCKERHUB_USER}/${LOCAL_IMAGE}:${IMAGE_TAG}"

case "${DOCKERHUB_USER}" in
  *"@"*)
    echo "ERROR: DOCKERHUB_USER must be Docker Hub username (namespace), not email." >&2
    exit 1
    ;;
esac

echo "==> Checking local image: ${LOCAL_REF}"
if ! docker image inspect "${LOCAL_REF}" >/dev/null 2>&1; then
  echo "ERROR: Local image not found: ${LOCAL_REF}" >&2
  exit 1
fi

echo "==> Tagging image"
docker tag "${LOCAL_REF}" "${REMOTE_REF}"

echo "==> Pushing to Docker Hub: ${REMOTE_REF}"
docker push "${REMOTE_REF}"

echo "OK: Pushed ${REMOTE_REF}"
