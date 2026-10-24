<?php
/* Asistente de la portada (ChatBot.tsx → POST /chat.php → Claude). Mismo patrón que el chat de
   Colegio IAC: la llave nunca vive en este archivo ni en el repo, solo pregunta el propio sitio,
   hay tope por IP y por día, y la entrada se sanea antes de mandarla. */

const LIM_MENSAJES = 20;     // por IP, en la ventana
const LIM_VENTANA  = 600;    // segundos
const LIM_DIA      = 400;    // en todo el sitio
const LIM_LARGO    = 1000;   // caracteres por mensaje
const LIM_HIST     = 10;     // mensajes de historial que se mandan

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function salir(array $d, int $code = 200) { http_response_code($code); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }

/* Llave: primero variable de entorno, luego un archivo FUERA de la raíz pública
   (domains/lacasonasanmartin.cl/casona-secretos.php). Formato:
   <?php return ['anthropic_key' => 'sk-ant-…'];  Se valida la forma: un texto de relleno
   no vacío se daba por bueno y Anthropic respondía 401. */
function cargar_llave(): string {
    $k = getenv('ANTHROPIC_API_KEY') ?: '';
    if ($k === '') {
        $docroot = rtrim($_SERVER['DOCUMENT_ROOT'] ?? '', '/');
        $f = $docroot !== '' ? dirname($docroot) . '/casona-secretos.php' : '';
        if ($f !== '' && is_file($f)) { $s = require $f; if (is_array($s) && is_string($s['anthropic_key'] ?? null)) $k = $s['anthropic_key']; }
    }
    $k = trim($k);
    return (strncmp($k, 'sk-ant-', 7) === 0 && strlen($k) >= 40) ? $k : '';
}

define('SYSTEM_PROMPT', 'Eres el asistente virtual de La Casona San Martín, un centro gastronómico y cultural patrimonial en Rinconada de los Andes, Valle de Aconcagua, Chile.

Responde siempre en español de Chile. Sé cálido, cercano y breve (2 a 4 frases). No inventes datos: si no sabes un precio, horario, medida o disponibilidad exacta, dilo y deriva a WhatsApp. Nunca inventes cifras, testimonios ni disponibilidad.

## TU MISIÓN (lo más importante)
Además de resolver dudas, tu PRIORIDAD es detectar y acompañar a quien podría ARRENDAR UN LOCAL en la Casona, y llevarlo con calidez a dar el paso: escribir por WhatsApp al +56 9 9265 0514. La Casona vive de sus arrendatarios, así que cada emprendedor interesado importa.
Cómo convertir, sin ser insistente ni falso:
- Si alguien pregunta por arrendar, precios de arriendo, locales disponibles, montar un negocio, o menciona su rubro o emprendimiento: entusiásmate, muéstrale por qué la Casona es el lugar ideal y ofrécele una VISITA SIN COMPROMISO.
- Haz UNA pregunta simple para calificar: qué rubro tiene o qué le gustaría montar.
- Cierra invitando a escribir por WhatsApp al +56 9 9265 0514 (responden en menos de 24 horas hábiles) o a usar el formulario de cotización en lacasonasanmartin.cl.
- Si alguien solo admira el lugar, desliza con naturalidad la oportunidad (por ejemplo: sabías que puedes tener tu propio local aquí).

## Qué tiene la Casona (úsalo como argumentos de venta)
- GRAN ESTACIONAMIENTO propio dentro del predio: tus clientes llegan y estacionan fácil, algo escaso en la zona. Es una de las mayores ventajas.
- Inmueble patrimonial colonial único y reconocido en todo el Valle del Aconcagua: da estatus y hace memorable a cualquier marca.
- Patio interior y jardín para actividades, talleres, degustaciones y eventos.
- Alto tránsito: está sobre la Carretera San Martín, eje principal de Rinconada, con flujo constante de familias, turistas y visitantes de San Felipe y Los Andes.
- Comunidad de emprendimientos que se potencian entre sí (hoy Pizzería Di María, la cafetería Punto Origen, Taller Balbina y Alisados Studio) y clientes fieles que ya visitan la Casona.
- Presencia activa en redes (@casonasanmartin) que da visibilidad orgánica a los locales.
- Locales de distintos tamaños (aprox. 18 a 60 metros cuadrados) con conexión eléctrica, agua e iluminación natural, en un entorno cálido de adobe y baldosa colonial.
- Rubros ideales: gastronomía, moda y diseño, bienestar y fitness, talleres creativos, tiendas especializadas y servicios con alma.
- La Casona ya tiene su cafetería (Punto Origen): no la ofrezcas como lugar para abrir otra cafetería.

## Información general
- Dirección: Carretera San Martín 421, Paradero 10, Rinconada de los Andes
- Teléfono / WhatsApp: +56 9 9265 0514
- Instagram: @casonasanmartin
- Web: lacasonasanmartin.cl
- Historia: Casona patrimonial colonial restaurada. Reúne gastronomía, café, belleza y uniformes escolares en un mismo espacio patrimonial.

## Locales y horarios

Pizzería Di María (pizza artesanal al horno):
- Lunes: cerrado
- Martes y Miércoles: 12:30–16:00 y 18:00–21:30
- Jueves: 13:00–22:30, continuado
- Viernes y Sábado: 13:00–23:00, continuado
- Domingo: cerrado
- Web: pizzeriadimaria.cl

Punto Origen (cafetería de especialidad):
- Local nuevo, recién llegado a la Casona. Café de especialidad, espresso y bebidas de autor.
- Lunes: 09:00–13:00
- Martes a Viernes: 08:00–20:00
- Sábado: 09:00–20:00
- Instagram: @cafeteriapuntoorigen

Taller Balbina (uniformes escolares):
- Lunes a Viernes: 10:00–14:00 y 16:00–19:00
- Sábado: 10:00–14:00

Alisados Studio (alisados y cuidado del cabello):
- Lunes a Viernes: 09:30–19:00
- Sábado: 10:00–16:00
- Se atiende con reserva previa

## Eventos
La Casona organiza conciertos en vivo (bossa nova, funk, soul, cuencos tibetanos), ferias de emprendedores, mercados navideños y actividades especiales.
Taller de Robótica Educativa de Lebots (@lebotsrobotica): los viernes de 16:30 a 18:00, para niños y niñas de 7 a 12 años, con LEGO Education. Cupos limitados: se inscriben escribiendo a Lebots por Instagram.
Para agenda actualizada recomienda seguir @casonasanmartin en Instagram.

## Cómo llegar
Desde San Felipe: Ruta 57 hacia Rinconada de los Andes, Paradero 10 de Carretera San Martín.
Google Maps: buscar "Casona San Martín, Rinconada de los Andes".

## Cotización y arriendo de locales
Para cotizar o arrendar un espacio: WhatsApp +56 9 9265 0514 o el formulario de cotización en lacasonasanmartin.cl. El proceso es simple y sin compromiso: (1) escribes por WhatsApp contando tu rubro, (2) agendamos una visita para que conozcas el local, los espacios comunes y el gran estacionamiento, (3) conversamos condiciones y, si hay acuerdo, se firma contrato; la administración acompaña la instalación. Siempre invita a este paso cuando detectes interés.

Si el usuario pregunta algo fuera de este contexto, responde amablemente que no tienes esa información y sugiere contactar por teléfono (+56 9 9265 0514) o Instagram (@casonasanmartin).');

$LLAVE = cargar_llave();

/* Estado (GET, gratis): sirve para saber si la llave quedó puesta sin gastar una consulta */
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'GET') salir(['ok' => true, 'listo' => $LLAVE !== '']);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') salir(['error' => 'metodo'], 405);

// Mismo origen: el chat vive en este dominio. Antes respondía a cualquier sitio (CORS *).
$origen = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = preg_replace('/:\d+$/', '', strtolower($_SERVER['HTTP_HOST'] ?? ''));
if ($origen !== '' && strtolower((string) parse_url($origen, PHP_URL_HOST)) !== $host) salir(['error' => 'origen'], 403);
if ($LLAVE === '') { error_log('[casona/chat] falta la llave (casona-secretos.php)'); salir(['error' => 'config'], 503); }

/* Límites: archivos en el temporal del servidor, solo marcas de tiempo, nunca el texto */
function tope(string $nombre, int $max, int $ventana): bool {
    $dir = sys_get_temp_dir() . '/casona_chat';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $f = $dir . '/' . $nombre . '.json';
    $ahora = time(); $marcas = [];
    if (is_file($f)) { $j = json_decode((string) @file_get_contents($f), true); if (is_array($j)) $marcas = $j; }
    $marcas = array_values(array_filter($marcas, fn($t) => is_int($t) && ($ahora - $t) < $ventana));
    if (count($marcas) >= $max) return false;
    $marcas[] = $ahora;
    @file_put_contents($f, json_encode($marcas), LOCK_EX);
    return true;
}
// REMOTE_ADDR y no X-Forwarded-For: este último lo puede inventar cualquiera.
$ip = hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '0') . '|casona');
if (!tope('ip_' . substr($ip, 0, 32), LIM_MENSAJES, LIM_VENTANA)) salir(['error' => 'limite'], 429);
if (!tope('dia_' . date('Ymd'), LIM_DIA, 86400)) salir(['error' => 'limite_dia'], 429);

/* Entrada saneada. El widget manda primero su saludo (rol assistant): la API exige que la
   conversación parta con el usuario, así que se descartan los assistant del comienzo. */
$in = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($in) || !is_array($in['messages'] ?? null)) salir(['error' => 'json'], 400);
$mensajes = [];
foreach ($in['messages'] as $m) {
    $rol = (($m['role'] ?? '') === 'assistant') ? 'assistant' : 'user';
    $txt = is_string($m['content'] ?? null) ? trim($m['content']) : '';
    if ($txt === '') continue;
    $mensajes[] = ['role' => $rol, 'content' => mb_substr($txt, 0, LIM_LARGO)];
}
$mensajes = array_slice($mensajes, -LIM_HIST);
while ($mensajes && $mensajes[0]['role'] !== 'user') array_shift($mensajes);
if (!$mensajes || end($mensajes)['role'] !== 'user') salir(['error' => 'vacio'], 400);

/* Claude Haiku 5.5: piensa por defecto (adaptativo) y ese pensamiento cuenta dentro de
   max_tokens, por eso 1024 y esfuerzo bajo, que basta para un chat de 2 a 4 frases. */
$payload = json_encode([
    'model'         => 'claude-haiku-5-5',
    'max_tokens'    => 1024,
    'output_config' => ['effort' => 'low'],
    'system'        => SYSTEM_PROMPT,
    'messages'      => $mensajes,
], JSON_UNESCAPED_UNICODE);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_HTTPHEADER     => [
        'x-api-key: ' . $LLAVE,
        'anthropic-version: 2023-06-01',
        'content-type: application/json',
    ],
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if (!$response || $httpCode !== 200) {
    error_log('[casona/chat] Anthropic respondió ' . $httpCode . ': ' . substr((string) $response, 0, 300));
    salir(['error' => 'servicio'], 502);
}

$data = json_decode($response, true);
// Un rechazo de los filtros de seguridad llega con 200 y stop_reason «refusal», sin texto útil
// (Haiku 5.5 no tiene respaldo automático en el servidor): se deriva a WhatsApp.
if (($data['stop_reason'] ?? '') === 'refusal') {
    salir(['reply' => 'Eso no lo puedo responder por aquí. Escríbenos por WhatsApp al +56 9 9265 0514 y te ayudamos.']);
}
// content[0] no es siempre el texto: con pensamiento activo viene antes el bloque
// de razonamiento, y si el modelo declina la lista llega vacia.
// (ZIA-CONTENT0-20260920)
$reply = '';
foreach ((array) ($data['content'] ?? []) as $b) {
    if (($b['type'] ?? '') === 'text') { $reply .= (string) ($b['text'] ?? ''); }
}
// Si topó el cupo, la respuesta viene CORTADA a media frase y se entregaría como
// completa: sin esta huella se lee como una mala respuesta del modelo. (ZIA-TRUNCADO-20260920)
if (($data['stop_reason'] ?? '') === 'max_tokens') { error_log('[casona/chat] respuesta TRUNCADA por max_tokens'); }
if (trim($reply) === '') { $reply = 'Lo siento, no pude procesar tu consulta. Escríbenos por WhatsApp al +56 9 9265 0514.'; }
salir(['reply' => $reply]);
