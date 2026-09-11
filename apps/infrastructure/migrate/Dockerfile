FROM python:3.14-slim
RUN pip install --no-cache-dir yoyo-migrations==9.0.0 psycopg[binary] psycopg2-binary
WORKDIR /migrations
# Migrations mounted via compose volume ../db/migrations:/migrations:ro
CMD ["yoyo", "apply", "--batch"]
