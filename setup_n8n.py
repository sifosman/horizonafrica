import paramiko
import time
import sys

HOST = '102.202.192.36'
USER = 'root'
PASSWORD = 'RYc9wieScdR='
DOMAIN = 'n8n.horizonafrica.co.za'

def run_cmd(ssh, command, timeout=120):
    print(f"\n$ {command[:80]}...")
    stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out.strip():
        print("OUT:", out[:1000])
    if err.strip():
        print("ERR:", err[:1000])
    print(f"EXIT: {exit_code}")
    if exit_code != 0 and 'debconf' not in command.lower():
        print(f"WARNING: Command failed with exit code {exit_code}")
    return exit_code, out, err

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(HOST, username=USER, password=PASSWORD, timeout=15)
    print("Connected to server")

    # 1. Update system
    run_cmd(ssh, 'export DEBIAN_FRONTEND=noninteractive && apt-get update')
    run_cmd(ssh, 'export DEBIAN_FRONTEND=noninteractive && apt-get upgrade -y', timeout=300)

    # 2. Install prerequisites
    run_cmd(ssh, 'export DEBIAN_FRONTEND=noninteractive && apt-get install -y curl ca-certificates gnupg lsb-release ufw fail2ban', timeout=300)

    # 3. Install Docker
    run_cmd(ssh, 'curl -fsSL https://get.docker.com | sh', timeout=300)
    run_cmd(ssh, 'systemctl enable docker && systemctl start docker')
    run_cmd(ssh, 'docker --version && docker compose version')

    # 4. Create n8n user
    run_cmd(ssh, 'id -u n8n >/dev/null 2>&1 || useradd -m -s /bin/bash n8n')
    run_cmd(ssh, 'usermod -aG docker n8n')

    # 5. Setup directories
    run_cmd(ssh, 'mkdir -p /opt/n8n/{n8n_data,postgres_data,caddy_data,caddy_config}')
    run_cmd(ssh, 'cd /opt/n8n && chown -R 1000:1000 n8n_data')

    # 6. Create docker-compose.yml
    compose = f'''version: "3.8"

services:
  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_db_password_2026
      - POSTGRES_DB=n8n
    volumes:
      - ./postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - n8n-network

  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - N8N_HOST={DOMAIN}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://{DOMAIN}/
      - GENERIC_TIMEZONE=Africa/Johannesburg
      - TZ=Africa/Johannesburg
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_db_password_2026
      - N8N_ENCRYPTION_KEY=HzN8nEncryptionKey2026SecureString
      - N8N_USER_MANAGEMENT_DISABLED=false
      - N8N_RUNNERS_ENABLED=true
    ports:
      - "127.0.0.1:5678:5678"
    volumes:
      - ./n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
    user: "1000:1000"
    networks:
      - n8n-network

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "443:443/udp"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - ./caddy_data:/data
      - ./caddy_config:/config
    depends_on:
      - n8n
    networks:
      - n8n-network

networks:
  n8n-network:
    driver: bridge
'''
    run_cmd(ssh, f"cat > /opt/n8n/docker-compose.yml << 'EOF'\n{compose}\nEOF")

    # 7. Create Caddyfile
    caddyfile = f'''{DOMAIN} {{
    reverse_proxy n8n:5678
}}
'''
    run_cmd(ssh, f"cat > /opt/n8n/Caddyfile << 'EOF'\n{caddyfile}\nEOF")

    # 8. Configure UFW firewall
    run_cmd(ssh, 'ufw default deny incoming')
    run_cmd(ssh, 'ufw default allow outgoing')
    run_cmd(ssh, 'ufw allow 22/tcp comment "SSH"')
    run_cmd(ssh, 'ufw allow 80/tcp comment "HTTP"')
    run_cmd(ssh, 'ufw allow 443/tcp comment "HTTPS"')
    run_cmd(ssh, 'ufw --force enable')
    run_cmd(ssh, 'ufw status numbered')

    # 9. Start n8n
    run_cmd(ssh, 'cd /opt/n8n && docker compose pull', timeout=300)
    run_cmd(ssh, 'cd /opt/n8n && docker compose up -d', timeout=180)

    # 10. Wait for n8n to be ready
    print("Waiting for n8n to start...")
    time.sleep(15)

    # 11. Check status
    run_cmd(ssh, 'cd /opt/n8n && docker compose ps')
    run_cmd(ssh, 'cd /opt/n8n && docker compose logs --tail=50 n8n')

    # 12. Create a setup note
    run_cmd(ssh, 'cat > /opt/n8n/README.txt << EOF\nURL: https://n8n.horizonafrica.co.za\nDocker: /opt/n8n/docker-compose.yml\nData: /opt/n8n/n8n_data\nDatabase: /opt/n8n/postgres_data\n\nTo restart: cd /opt/n8n && docker compose restart\nTo update: cd /opt/n8n && docker compose pull && docker compose up -d\nTo view logs: cd /opt/n8n && docker compose logs -f\nEOF')

    ssh.close()
    print("\nSetup complete")

if __name__ == '__main__':
    main()
