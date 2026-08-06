FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY ./display/package*.json ./
RUN npm ci

COPY ./display/ ./display/
WORKDIR /app/display
RUN npm run build
# =========================================================
FROM python:3.11-slim AS runtime
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PORT=8080

COPY ./app/requirements.txt ./app/
RUN pip install --no-cache-dir -r ./app/requirements.txt

COPY ./app/ ./app/

# Copy compiled React assets to python backend package
COPY --from=frontend-builder /app/display/dist ./app/static

# Copy the fallback entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]