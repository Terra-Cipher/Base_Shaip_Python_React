FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY index.html vite.config.js postcss.config.js tailwind.config.js index.css main.tsx App.tsx tsconfig.json vite-env.d.ts ./
ENV VITE_BASE_URL=/display/
RUN npm run build

# =========================================================
FROM python:3.11-slim AS runtime
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PORT=8080

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

# Copy compiled React assets to python backend package
COPY --from=frontend-builder /app/dist ./static

# Copy the fallback entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Safely copy the precompiled billing folder if present (wildcard prevents build failures)
COPY .billing* /app/.billing/
RUN if [ -f /app/.billing/runtime ]; then chmod +x /app/.billing/runtime; fi

EXPOSE 8080

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]