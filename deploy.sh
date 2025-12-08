#!/bin/bash

# Script para fazer build local e preparar para deploy no servidor
# Uso: ./deploy.sh

echo "🚀 Iniciando build local..."

# Limpar build anterior
echo "🧹 Limpando build anterior..."
rm -rf .next

# Fazer build
echo "📦 Fazendo build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "📋 Próximos passos para deploy no servidor:"
    echo ""
    echo "1. Transferir a pasta .next para o servidor:"
    echo "   scp -r .next usuario@servidor:/caminho/do/projeto/"
    echo ""
    echo "2. Ou usar rsync (mais eficiente):"
    echo "   rsync -avz --delete .next/ usuario@servidor:/caminho/do/projeto/.next/"
    echo ""
    echo "3. No servidor, reiniciar o serviço:"
    echo "   sudo systemctl restart cardapiofront.service"
    echo ""
else
    echo "❌ Erro no build!"
    exit 1
fi

