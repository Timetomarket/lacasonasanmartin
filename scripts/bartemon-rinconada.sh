#!/usr/bin/env bash
# Regenera public/bartemon157/: la landing de Bartemon 157 con la carta y los precios de RINCONADA.
# Trabaja sobre una copia temporal de Bartemon157/ (build.py escribe carta.json en su propia carpeta).
# Uso: scripts/bartemon-rinconada.sh   y después npm run build + subir public/bartemon157/
set -euo pipefail
AQUI="$(cd "$(dirname "$0")" && pwd)"
SRC="$AQUI/../../Bartemon157"
W="$(mktemp -d)"
trap 'rm -rf "$W"' EXIT
cp -R "$SRC/build.py" "$SRC/estilos.css" "$SRC/anima.js" "$SRC/chat.js" "$SRC/img" "$W/"
cp "$SRC/carta.json" "$W/carta-sanfelipe.json"
curl -4 -sSL -o "$W/.rinconada.html" https://rinconada.bartemon157.cl/
cp "$AQUI/bartemon-rinconada.py" "$W/gen_rinconada.py"
python3 "$W/gen_rinconada.py" "$AQUI/../public/bartemon157"
