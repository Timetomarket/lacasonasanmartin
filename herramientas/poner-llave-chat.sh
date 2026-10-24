#!/usr/bin/env bash
# Pone la llave de Anthropic del chat de la portada en el servidor, FUERA de public_html
# (domains/lacasonasanmartin.cl/casona-secretos.php, permisos 640), que es donde la busca chat.php.
# La llave se pide sin mostrarla y viaja por la entrada de ssh: no queda en el historial,
# ni en la lista de procesos, ni en el repo.
#   bash herramientas/poner-llave-chat.sh
set -euo pipefail
SSH=(ssh -p 65002 -i "$HOME/.ssh/hostinger_flota" u182423827@167.88.35.204)
DESTINO=domains/lacasonasanmartin.cl/casona-secretos.php

read -rsp "Pega la llave de Anthropic (sk-ant-...): " K; echo
if [[ "$K" != sk-ant-* || ${#K} -lt 40 || "$K" == *"'"* ]]; then
  echo "Eso no parece una llave sk-ant-. No se guardó nada."; exit 1
fi
printf "<?php return ['anthropic_key' => '%s'];\n" "$K" |
  "${SSH[@]}" "umask 027; cat > $DESTINO && chmod 640 $DESTINO && echo 'Guardada fuera de public_html.'"
unset K

# El GET no llama a la IA: solo dice si chat.php encuentra la llave
echo "Estado del chat: $(curl -s https://lacasonasanmartin.cl/chat.php)"
