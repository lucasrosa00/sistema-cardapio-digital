# Script PowerShell para fazer build local e preparar para deploy no servidor
# Uso: .\deploy.ps1

Write-Host "🚀 Iniciando build local..." -ForegroundColor Cyan

# Limpar build anterior
Write-Host "🧹 Limpando build anterior..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# Fazer build
Write-Host "📦 Fazendo build..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos para deploy no servidor:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Transferir a pasta .next para o servidor usando WinSCP, FileZilla ou:" -ForegroundColor White
    Write-Host "   scp -r .next usuario@servidor:/caminho/do/projeto/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Ou usar rsync via WSL ou Git Bash:" -ForegroundColor White
    Write-Host "   rsync -avz --delete .next/ usuario@servidor:/caminho/do/projeto/.next/" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. No servidor (via Putty), reiniciar o serviço:" -ForegroundColor White
    Write-Host "   sudo systemctl restart cardapiofront.service" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Erro no build!" -ForegroundColor Red
    exit 1
}

