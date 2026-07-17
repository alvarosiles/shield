# 🛡️ Shield

**Digital Vault Template** — plantilla de bóveda digital personal para organizar credenciales, tarjetas, pagos, servicios, documentos, notas y API keys.

Demo: [shield.alvarosiles.cloud](https://shield.alvarosiles.cloud)

---

## Descripción

Shield es una plantilla web **premium, oscura y modular** inspirada en apps bancarias, password managers y billeteras digitales. Está pensada como punto de partida para construir tu propia bóveda personal: hoy funciona 100% en el navegador (sin backend), y su arquitectura está preparada para incorporar cifrado, autenticación y sincronización más adelante.

> ⚠️ **Esta es una plantilla/demo.** Los datos incluidos en `data/*.json` son ficticios. No guardes información sensible real sin agregar cifrado y autenticación primero (ver [Seguridad](#seguridad)).

## Características

- 🔑 **Credenciales** — usuarios, contraseñas, URLs y notas por servicio.
- 💳 **Tarjetas** — billetera visual con tipos crédito/débito/virtual/prepago (números enmascarados).
- 💰 **Métodos de pago** — bancos, billeteras digitales, cuentas y QR de pago.
- 🌐 **Servicios digitales** — suscripciones y cuentas en línea.
- 📄 **Documentos** — licencias, certificados y contratos.
- 🔐 **API Keys** — claves de integración por entorno (desarrollo/producción).
- 📝 **Notas privadas** — preguntas de seguridad, códigos de respaldo, recordatorios.
- 📊 **Dashboard** — resumen de totales, últimos registros y categorías usadas.
- 🔍 Búsqueda y filtros por categoría/tipo en cada módulo.
- 👁️ Mostrar/ocultar información sensible, con copiado al portapapeles.
- 💾 Persistencia local con `LocalStorage` (los JSON en `data/` son solo la semilla inicial).
- 📱 Responsive: escritorio, tablet y móvil.

## Tecnologías

HTML5 · CSS3 · JavaScript ES6 (módulos nativos) · JSON · LocalStorage.

Sin frameworks. Sin backend. Código modular por archivo/módulo.

## Instalación

Shield no requiere `npm install` ni build. Como usa `fetch()` para leer los archivos `data/*.json`, necesitas servirlo con un servidor local (abrir `index.html` directamente con `file://` bloquea esas peticiones en la mayoría de navegadores).

Opciones rápidas:

```bash
# Con Python
python -m http.server 8080

# Con Node (npx, sin instalar nada global)
npx serve .

# Con la extensión "Live Server" de VS Code
# clic derecho sobre index.html → "Open with Live Server"
```

Luego abre `http://localhost:8080` en tu navegador.

## Uso

1. Al abrir el Dashboard por primera vez, cada módulo se **siembra** automáticamente desde su archivo `data/*.json` hacia `LocalStorage`.
2. Desde cada módulo puedes **crear**, **editar**, **buscar**, **filtrar** y **eliminar** registros — todo se guarda en tu navegador.
3. Los campos sensibles (contraseñas, claves) se muestran ocultos por defecto; usa el ícono 👁️ para revelarlos y 📋 para copiarlos.
4. El botón **🔒 Bloquear bóveda** del sidebar simula un bloqueo visual (ver [Seguridad](#seguridad)).
5. En **⚙ Configuración** puedes exportar tus datos a un `.json` o restablecer la bóveda a los datos demo originales.

## Estructura

```
shield/
├── index.html              → Dashboard
├── style.css                → Sistema de diseño (variables, componentes, responsive)
├── app.js                    → Bootstrap general (modales, atajos globales)
├── pages/
│   ├── credentials.html
│   ├── cards.html
│   ├── payments.html
│   ├── services.html
│   ├── documents.html
│   ├── apikeys.html
│   ├── notes.html
│   └── settings.html
├── data/
│   ├── credentials.json
│   ├── cards.json
│   ├── payments.json
│   ├── services.json
│   ├── documents.json
│   ├── apikeys.json
│   └── notes.json
├── js/
│   ├── storage.js            → Capa de persistencia (LocalStorage + siembra desde JSON)
│   ├── utils.js               → Helpers (formato, copiar, toasts, máscaras)
│   ├── layout.js               → Sidebar, topbar y bloqueo visual (compartido)
│   ├── dashboard.js
│   ├── credentials.js
│   ├── cards.js
│   ├── payments.js
│   ├── services.js
│   ├── documents.js
│   ├── apikeys.js
│   ├── notes.js
│   └── settings.js
├── assets/
│   ├── icons/
│   └── images/
├── README.md
└── LICENSE
```

Cada módulo sigue el mismo patrón: `pages/<modulo>.html` define la UI y los modales; `js/<modulo>.js` maneja carga, render, búsqueda/filtros y operaciones CRUD contra `js/storage.js`.

## Seguridad

Esta plantilla incluye **seguridad visual**, no seguridad real de datos:

- Ocultar/mostrar información sensible con un clic.
- Confirmaciones antes de eliminar registros.
- Avisos de seguridad en el Dashboard y en los formularios.
- Bloqueo visual simulado (no cifra ni protege el acceso real a los datos).

Para usar Shield con información real, la arquitectura está preparada para agregar:

- **Cifrado** de los valores sensibles antes de guardarlos (p. ej. WebCrypto + una passphrase maestra).
- **Autenticación** (login local con hash + salt, o proveedor externo).
- **Base de datos** real en lugar de `LocalStorage` (p. ej. IndexedDB o un backend propio).
- **Usuarios** y permisos.
- **Sincronización segura** entre dispositivos (API propia + cifrado extremo a extremo).

## Cómo agregar información

- **Desde la UI:** usa el botón "+ Nuevo…" de cada módulo; los datos quedan en `LocalStorage` de tu navegador.
- **Datos semilla:** edita los archivos en `data/*.json` (mismo formato que ya usan) para cambiar los datos demo con los que arranca la app. Solo se usan si no existe aún la colección correspondiente en `LocalStorage`.
- **Reiniciar a los datos demo:** en `⚙ Configuración → Restablecer datos demo`.

## Cómo publicar en hosting

Shield es un sitio estático: cualquier hosting de archivos estáticos funciona.

1. Sube el contenido completo de la carpeta `shield/` (manteniendo la estructura de carpetas) a tu hosting o bucket estático (Netlify, Vercel, GitHub Pages, cPanel, S3, etc.).
2. Asegúrate de que `index.html` quede en la raíz del sitio.
3. No se requiere configuración de build ni variables de entorno.

## Cómo conectar shield.alvarosiles.cloud

1. En tu proveedor de DNS, crea un registro `CNAME` (o `A`, según el hosting) que apunte `shield.alvarosiles.cloud` al destino que indique tu proveedor de hosting.
2. En el panel del hosting, agrega `shield.alvarosiles.cloud` como dominio personalizado del proyecto/sitio donde publicaste Shield.
3. Activa HTTPS/SSL automático si tu proveedor lo ofrece.
4. Verifica accediendo a `https://shield.alvarosiles.cloud` una vez que el DNS propague (puede tardar algunos minutos a horas).

## Calidad del código

- Código modular: un archivo por responsabilidad (`storage`, `utils`, `layout`, y un módulo por sección).
- Comentarios solo donde aportan contexto no obvio.
- Fácil de ampliar: para agregar un módulo nuevo, duplica el patrón de `js/services.js` + `pages/services.html` + `data/services.json` y agrégalo a `NAV_ITEMS` en `js/layout.js`.

## Licencia

Ver [LICENSE](LICENSE).
