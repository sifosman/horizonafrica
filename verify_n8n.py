import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('102.202.192.36', username='root', password='RYc9wieScdR=', timeout=10)

stdin, stdout, stderr = ssh.exec_command('cd /opt/n8n && docker compose logs --tail=30 caddy')
print('CADDY LOGS:')
print(stdout.read().decode())
print('CADDY ERR:', stderr.read().decode())

stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:5678/')
print('N8N LOCAL HTTP STATUS:', stdout.read().decode())

stdin, stdout, stderr = ssh.exec_command('curl -s -o /dev/null -w "%{http_code}" -k https://127.0.0.1:5678/')
print('N8N LOCAL HTTPS STATUS:', stdout.read().decode())

ssh.close()
