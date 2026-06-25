FROM python:3.11-slim

WORKDIR /app

# dependances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# code applicatif
COPY app ./app
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000

# l'entrypoint peuple la base au premier demarrage puis lance le serveur
CMD ["./docker-entrypoint.sh"]
