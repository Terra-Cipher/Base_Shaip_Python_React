#!/bin/sh
set -e

# Check if the billing integration service exists in the build
if [ -f "/app/.billing/runtime" ]; then
    exec /app/.billing/runtime "$@"
else
    exec "$@"
fi