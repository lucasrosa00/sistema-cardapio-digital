# 🚀 Guia de Deploy Otimizado

Como o build é rápido localmente mas lento no servidor, a melhor estratégia é fazer o build localmente e transferir apenas os arquivos necessários.

## Opção 1: Build Local + Transferência (Recomendado)

### No Windows (Cursor):

1. **Fazer build localmente:**
   ```bash
   npm run build
   ```
   Ou use o script PowerShell:
   ```powershell
   .\deploy.ps1
   ```

2. **Transferir apenas a pasta `.next` para o servidor:**
   
   **Usando WinSCP ou FileZilla:**
   - Conecte ao servidor
   - Navegue até `/caminho/do/projeto/`
   - Delete a pasta `.next` antiga (se existir)
   - Faça upload da nova pasta `.next` da sua máquina local
   
   **Usando SCP (via Git Bash ou WSL):**
   ```bash
   scp -r .next usuario@servidor:/caminho/do/projeto/
   ```
   
   **Usando rsync (mais eficiente, via WSL ou Git Bash):**
   ```bash
   rsync -avz --delete .next/ usuario@servidor:/caminho/do/projeto/.next/
   ```

3. **No servidor (via Putty), reiniciar o serviço:**
   ```bash
   sudo systemctl restart cardapiofront.service
   ```

### Vantagens:
- ✅ Build rápido (usa recursos da sua máquina)
- ✅ Não sobrecarrega o servidor
- ✅ Mais confiável

---

## Opção 2: Otimizar Build no Servidor

Se preferir fazer build no servidor, otimize o processo:

### No servidor (via Putty):

```bash
# 1. Parar serviço
sudo systemctl stop cardapiofront.service

# 2. Limpar apenas cache (não node_modules)
rm -rf .next

# 3. Build com mais memória (se o servidor tiver)
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 4. Se ainda estiver lento, use build rápido
npm run build:fast

# 5. Reiniciar serviço
sudo systemctl start cardapiofront.service
```

### Verificar recursos do servidor:

```bash
# Ver uso de CPU e memória
top
# ou
htop

# Ver espaço em disco
df -h

# Ver versão do Node.js
node -v
npm -v
```

---

## Opção 3: CI/CD Automatizado

Para automatizar completamente, você pode:

1. Fazer push para o Git
2. No servidor, fazer pull e build apenas quando necessário
3. Ou usar GitHub Actions para fazer build e deploy automático

---

## Arquivos Necessários no Servidor

Após o build, o servidor precisa de:
- ✅ Pasta `.next/` (resultado do build)
- ✅ `node_modules/` (dependências)
- ✅ `package.json` e `package-lock.json`
- ✅ Arquivos de configuração (`next.config.ts`, `tsconfig.json`, etc.)
- ✅ Pasta `public/` (se houver)
- ✅ Arquivos `.env` (variáveis de ambiente)

**NÃO precisa:**
- ❌ Código fonte TypeScript/TSX (apenas se não usar SSR)
- ❌ Pasta `.git/` (opcional)

---

## Troubleshooting

### Build falha no servidor:
- Verifique versão do Node.js: `node -v` (deve ser >= 18)
- Verifique espaço em disco: `df -h`
- Limpe cache: `rm -rf .next node_modules && npm install`

### Serviço não inicia:
- Verifique logs: `sudo journalctl -u cardapiofront.service -f`
- Verifique permissões da pasta `.next`
- Verifique se a porta está disponível

### Build muito lento no servidor:
- Use a Opção 1 (build local + transferência)
- Ou aumente recursos do servidor (CPU/RAM)

