# Deployment Checklist for Battle Arena

## 1. VPS Selection
- Recommended: 8 vCPUs, 32 GB RAM (for Ollama + Web + DB).
- OS: Ubuntu 24.04 LTS.

## 2. Server Preparation
- Update system: `sudo apt update && sudo apt upgrade -y`
- Install Docker: `curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh`
- Install Docker Compose: `sudo apt install docker-compose-v2`

## 3. Deployment Steps
- Clone repo: `git clone <your-repo-url>`
- Set up .env: `cp .env.example .env` and edit values.
- Build & Start: `docker compose up -d --build`
- Initial model pull: `docker exec -it ollama-container-name ollama pull qwen3:4b`

## 4. Security
- Enable UFW: `sudo ufw allow 80,443,22 && sudo ufw enable`
- Secure SSH: Use key-based auth, disable password auth.
- SSL: Use Certbot for HTTPS.
