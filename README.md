# shield
Secure credential management template for organizing accounts, access information, and sensitive records.
Actúa como un desarrollador Senior especializado en aplicaciones web seguras, HTML5, CSS3, JavaScript ES6, UX/UI y diseño de sistemas tipo Dashboard.

Quiero crear una aplicación web llamada **Shield**.

URL del proyecto:

shield.alvarosiles.cloud

Repositorio:

shield

---

# Objetivo

Crear una plantilla de bóveda digital personal (**Digital Vault Template**) para organizar información privada.

La aplicación permitirá gestionar:

* 🔑 Credenciales
* 💳 Tarjetas
* 💰 Métodos de pago
* 📝 Notas privadas
* 🌐 Servicios digitales
* 📄 Licencias
* 🔐 API Keys
* 📁 Documentos importantes

Debe ser una plantilla profesional, moderna y escalable.

---

# Importante

Esta versión será una plantilla/demo.

No debe guardar información sensible real sin protección.

Utilizar datos ficticios de ejemplo.

Preparar la arquitectura para agregar posteriormente:

* Cifrado
* Autenticación
* Base de datos
* Usuarios
* Sincronización segura

---

# Tecnologías

Utilizar:

* HTML5
* CSS3
* JavaScript ES6
* JSON
* LocalStorage

No utilizar frameworks.

No utilizar backend.

Código modular y escalable.

---

# Diseño

Crear una interfaz premium estilo:

* Billetera digital
* Dashboard financiero
* Gestor de seguridad

Inspiración:

* Aplicaciones bancarias modernas
* Password managers
* Digital wallets

---

# Tema visual

Modo oscuro.

Colores:

Fondo:
#0F172A

Sidebar:
#111827

Tarjetas:
#1E293B

Color principal:
#2563EB

Color seguridad:
#10B981

Advertencia:
#F59E0B

Texto:
#FFFFFF

Diseño:

* Bordes redondeados
* Sombras suaves
* Animaciones modernas
* Responsive

Compatible con:

* Desktop
* Tablet
* Móvil

---

# Dashboard

Mostrar:

🛡️ Shield

Resumen:

* Total credenciales
* Total tarjetas
* Total cuentas
* Total documentos
* Últimos registros
* Categorías utilizadas

---

# Menú lateral

Crear:

🏠 Dashboard

🔑 Credenciales

💳 Tarjetas

💰 Pagos

🌐 Servicios

📄 Documentos

🔐 API Keys

📝 Notas

⚙ Configuración

---

# Módulo Credenciales

Crear formulario:

Campos:

ID

Nombre del servicio

Categoría

URL

Usuario

Contraseña

Correo asociado

Notas

Fecha creación

Estado

Ejemplos:

GitHub

Hosting

Cloud

Correo

Dominio

Servidor

---

# Módulo Tarjetas

Crear una billetera visual.

Tipos:

* Crédito
* Débito
* Virtual
* Prepago

Campos:

ID

Nombre de tarjeta

Banco

Tipo

Titular

Últimos 4 dígitos

Fecha vencimiento

Color tarjeta

Notas

No mostrar números completos.

Ejemplo:

```text
VISA

**** **** **** 4589

Usuario Demo

12/28
```

---

# Módulo Métodos de Pago

Registrar:

Banco

Billetera digital

Cuenta

QR de pago

Descripción

Estado

---

# Módulo Documentos

Guardar referencias:

Tipo documento

Nombre

Fecha

Archivo asociado

Notas

Ejemplos:

Licencias

Certificados

Contratos

---

# Archivo JSON

Crear carpeta:

data/

Archivos:

credentials.json

cards.json

payments.json

documents.json

---

# Ejemplo cards.json

{
"cards":[
{
"id":1,
"bank":"Banco Demo",
"type":"credit",
"holder":"Usuario Demo",
"last4":"4589",
"expiration":"12/28",
"color":"blue",
"notes":"Tarjeta principal"
}
]
}

---

# Vista Tarjetas

Crear tarjetas visuales:

Ejemplo:

---

💳 Banco Demo

VISA

**** **** **** 4589

Usuario Demo

12/28

[Ver]

[Editar]

---

---

# Funciones

Implementar:

✔ Leer datos desde JSON

✔ Mostrar información dinámica

✔ Buscar registros

✔ Filtrar categorías

✔ Crear tarjetas visuales

✔ Mostrar/ocultar información

✔ Copiar datos

✔ Editar interfaz

✔ Eliminar registros visualmente

✔ Guardar preferencias con LocalStorage

---

# Seguridad visual

Agregar:

* Ocultar información sensible
* Botón mostrar/ocultar
* Confirmaciones
* Avisos de seguridad
* Bloqueo visual simulado

Ejemplo:

```
🔒 Información protegida
```

---

# Estructura del proyecto

Crear:

shield/

├── index.html

├── style.css

├── app.js

├── pages/

│   ├── credentials.html

│   ├── cards.html

│   ├── payments.html

│   ├── documents.html

├── data/

│   ├── credentials.json

│   ├── cards.json

│   ├── payments.json

│   └── documents.json

├── js/

│   ├── credentials.js

│   ├── cards.js

│   ├── storage.js

│   └── utils.js

├── assets/

│   ├── icons

│   └── images

├── README.md

└── LICENSE

---

# README.md

Crear documentación:

* Descripción
* Características
* Instalación
* Uso
* Estructura
* Seguridad
* Cómo agregar información
* Cómo publicar en hosting
* Cómo conectar shield.alvarosiles.cloud

---

# Calidad del código

El código debe ser:

* Profesional
* Limpio
* Modular
* Comentado
* Fácil de ampliar

Aplicar buenas prácticas.

---

# Entrega

Genera el proyecto archivo por archivo.

Orden:

1. Estructura del proyecto
2. index.html
3. style.css
4. app.js
5. Archivos JSON
6. Módulos internos
7. README.md

Explica cada archivo antes de mostrar el código.

No resumas.

Espera mi confirmación antes de continuar con el siguiente archivo.
