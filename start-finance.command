#!/bin/bash

# Ruta real del proyecto (ajustá si está en Desktop o Documents)
PROJECT_DIR="/Users/sebastiancastro/finance-app"

# Entrar al proyecto
cd "$PROJECT_DIR" || {
  echo "❌ No se pudo encontrar la carpeta del proyecto."
  exit 1
}

# Activar PNPM (si lo usás)
export PNPM_HOME="$HOME/Library/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Iniciar Next.js
echo "🔄 Iniciando Finance App..."
npm run dev &

# Esperar a que arranque
sleep 3

# Abrir navegador
open "http://localhost:3000/dashboard"

echo "🚀 Finance App iniciada correctamente!"
