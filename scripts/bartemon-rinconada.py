"""Landing de Bartemon 157 para Casona San Martín: la carta y los precios de RINCONADA.

Corre sobre una COPIA de Bartemon157/ (este directorio), nunca sobre el original.
Usa build.py tal cual y solo le cambia los datos: carta de Rinconada, un solo local
para los botones de pedido y, en la sección «Para acompañar», cervezas y bebidas
en vez de cócteles (Rinconada no tiene coctelería).
"""
import importlib.util, json, os, re, shutil, subprocess, sys

DIR = os.path.dirname(os.path.abspath(__file__))
DEST = sys.argv[1]
BASE = "https://lacasonasanmartin.cl/bartemon157/"

spec = importlib.util.spec_from_file_location("b", f"{DIR}/build.py")
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)

# Carta de Rinconada (bajada de rinconada.bartemon157.cl) en lugar de la de San Felipe
r = b.parse_influye(f"{DIR}/.rinconada.html")

# Influye pone «NO_IMAGE.png» (un ícono gris) a lo que no tiene foto en Rinconada.
# Si el mismo producto tiene foto en la carta de San Felipe se usa esa; si no, va sin foto.
sf = json.load(open(f"{DIR}/carta-sanfelipe.json"))
foto_sf = {i["title"]: i.get("image") for c in sf["data"]["menu"] for i in c.get("items") or []
           if i.get("image") and i["image"] != "NO_IMAGE.png"}
for c in r["data"]["menu"]:
    for i in c.get("items") or []:
        if i.get("image") == "NO_IMAGE.png":
            i["image"] = foto_sf.get(i["title"])
json.dump(r, open(f"{DIR}/carta.json", "w"), ensure_ascii=False, indent=1)

# Fotos de los productos de Rinconada que aún no estén
for titulo, folder in [("Smashburgers", "burgers"), ("Appetizer", "otros"),
                       ("Cervezas", "otros"), ("Sin alcohol", "otros")]:
    for it in b.cat(r, titulo):
        img = it.get("image")
        if not img:
            continue
        jpg = f"{DIR}/img/{folder}/{img.rsplit('.', 1)[0]}.jpg"
        if os.path.exists(jpg):
            continue
        tmp = f"{DIR}/img/{folder}/{img}"
        subprocess.run(["curl", "-4", "-sS", "-o", tmp, b.IMG_BASE + img], check=False)
        subprocess.run(["sips", "-s", "format", "jpeg", "-s", "formatOptions", "78",
                        "-Z", "900", tmp, "--out", jpg], capture_output=True)
        if os.path.exists(tmp):
            os.remove(tmp)
        print("  foto nueva:", it["title"])

# Un solo local: todos los «Pedir en» van a Rinconada
b.LOCALES[:] = [L for L in b.LOCALES if L["key"] == "rinconada"]

# Rinconada no tiene «Cócteles»: lo que acompaña es cerveza y bebida
_cat = b.cat
def cat_rinconada(d, titulo):
    if titulo == "Cócteles":
        return _cat(d, "Cervezas") + _cat(d, "Sin alcohol")
    return _cat(d, titulo)
b.cat = cat_rinconada

# La Bartemon de Rinconada lleva «cebolla crispy», no «aro de cebolla» (carta de Influye)
b.INGREDIENTES[:] = [("Cebolla crispy, hecha en casa" if x.startswith("Aro de cebolla") else x)
                     for x in b.INGREDIENTES]

b.hacer_webp()
s = b.build()

def rep(old, new):
    global s
    assert old in s, old[:90]
    s = s.replace(old, new)

# Textos que eran de San Felipe o de la barra de cócteles
rep("<title>Bartemon 157 — Smashburgers en San Felipe y Rinconada</title>",
    "<title>Bartemon 157 Rinconada — Smashburgers en Rinconada de Los Andes</title>")
s = re.sub(r'<meta name="description" content="[^"]*">',
           '<meta name="description" content="Smashburgers de 120 g a la plancha, papas y cervezas en '
           'Rinconada de Los Andes. Pide online o retira. Próxima apertura en Casona San Martín.">', s, count=1)
rep('<meta property="og:title" content="Bartemon 157 — Smashburgers en San Felipe y Rinconada">',
    '<meta property="og:title" content="Bartemon 157 Rinconada — Smashburgers en Rinconada de Los Andes">')
rep("<span>y una barra completa</span>", "<span>y cervezas heladas</span>")
rep("<p>Papas, aros de cebolla y una barra con más de 20 cócteles.</p>",
    "<p>Papas fritas, Mac´n Cheese Bites y algo para tomar: cervezas y bebidas.</p>")
rep("<p>Dos locales en el Valle de Aconcagua.</p>",
    "<p>Nuestro local de Rinconada de Los Andes. Pronto, también en Casona San Martín.</p>")

# Casona San Martín: URL propia, tira de vuelta, aviso de apertura y pie legal
rep('<link rel="canonical" href="https://bartemon157.cl/">', f'<link rel="canonical" href="{BASE}">')
rep('<meta property="og:url" content="https://bartemon157.cl/">', f'<meta property="og:url" content="{BASE}">')
s = re.sub(r'(<meta property="og:image" content=")https://bartemon157\.cl/', r"\1" + BASE, s)
s = s.replace('"image": "https://bartemon157.cl/img/logo.jpg"', f'"image": "{BASE}img/logo.jpg"')
rep("<body>", """<body>
<div style="background:#5c3d1e;color:#f5ead8;font:500 13px/1.3 Inter,system-ui,sans-serif;padding:10px 16px;display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center;justify-content:center;text-align:center">
  <a href="/" style="color:#f5ead8;text-decoration:none;font-family:Georgia,serif;font-size:15px">Casona <em style="color:#d4a574">San Martín</em></a>
  <span style="opacity:.85">Bartemon 157 · próxima apertura en la Casona</span>
</div>""")
rep('<p class="local__dir">Los Campos Parcela 2, Rinconada de Los Andes</p>',
    '<p class="local__dir">Los Campos Parcela 2, Rinconada de Los Andes</p>\n'
    '        <p class="local__dir"><strong>Próxima apertura:</strong> <a href="/" style="color:inherit">Casona San Martín</a>, '
    'Carretera San Martín 421, Paradero 10.</p>')
rep('<p class="pie__legal">Precios en pesos chilenos, IVA incluido. Sujetos a cambio sin previo aviso.</p>',
    '<p class="pie__legal">Precios del local de Rinconada en pesos chilenos, IVA incluido. Sujetos a cambio sin previo aviso.</p>\n'
    '  <p class="pie__legal">Sitio de <a href="/" style="color:inherit">Casona San Martín</a> · Responsable: García Villalobos '
    'Compañía Limitada · RUT: 77.884.924-0 · <a href="/politica-privacidad.html" style="color:inherit">Privacidad</a> · '
    '<a href="/terminos.html" style="color:inherit">Términos</a></p>\n'
    '  <p class="pie__legal">Página creada por <a href="https://timetomarket.cl" target="_blank" rel="noopener" '
    'style="color:inherit">timetomarket.cl</a> para los locales de Casona San Martín.</p>')

for pista in ["sanfelipe.bartemon157", "menu.bartemon157", "Artemon Cifuentes", "cócteles"]:
    if pista in s:
        print(f"  ⚠️  queda «{pista}» en la página")

# Copiar solo lo que la página referencia, a una carpeta limpia
refs = set(m.group(1) for m in re.finditer(r'(?:src|href|data-src|poster)="([^"]+)"', s))
for m in re.finditer(r'srcset="([^"]+)"', s):
    refs |= {p.strip().split(" ")[0] for p in m.group(1).split(",")}
css = open(f"{DIR}/estilos.css", encoding="utf-8").read()
refs |= {m.group(1) for m in re.finditer(r'url\(["\']?([^"\')]+)', css)}
local = sorted({x.split("?")[0] for x in refs if not re.match(r"(https?:|mailto:|tel:|#|/|data:)", x)})
shutil.rmtree(DEST, ignore_errors=True)
faltan = []
for x in local:
    src = os.path.join(DIR, x)
    if not os.path.exists(src):
        faltan.append(x)
        continue
    d = os.path.join(DEST, x)
    os.makedirs(os.path.dirname(d), exist_ok=True)
    shutil.copy2(src, d)
open(os.path.join(DEST, "index.html"), "w", encoding="utf-8").write(s)
print(f"index.html ({len(s):,} bytes) + {len(local) - len(faltan)} archivos · faltan: {faltan or 'ninguno'}")
