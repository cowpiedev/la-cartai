# Contexto general del proyecto (usar en todos los prompts)

Estoy diseñando una plataforma web SaaS responsive para la gestión de cartas digitales en negocios de hostelería. La app tiene tres tipos de usuario: administrador de plataforma, gestor de negocio (dueño/empleado) y cliente final. Los clientes acceden a la carta escaneando un QR o entrando a una URL pública. Cada negocio gestiona su propia carta de forma independiente. La app debe verse correctamente tanto en escritorio como en móvil.

# Pantallas de autenticación
Diseña las pantallas de registro e inicio de sesión para una plataforma SaaS de hostelería. Incluye:

Pantalla de login con email y contraseña, enlace a "¿Olvidaste tu contraseña?" y botón de acceso.
Pantalla de registro para nuevos negocios: nombre del negocio, nombre del responsable, email, contraseña y confirmación.
Pantalla de recuperación de contraseña.
Diseño limpio, moderno y responsive. Paleta neutra con un acento de color cálido (típico de hostelería).

# Dashboard del gestor de negocio
Diseña el panel principal (dashboard) para el gestor de un negocio de hostelería dentro de la plataforma. Debe mostrar:

Resumen rápido: número de platos activos, platos publicados hoy, categorías creadas.
Acceso rápido a: "Añadir nuevo plato", "Ver mi carta pública", "Gestionar QR".
Barra lateral de navegación con secciones: Carta, Platos del día, Categorías, Configuración, Inteligencia de precios.
Diseño responsive: en móvil la barra lateral se convierte en menú inferior.

# Gestión de la carta (listado de platos)
Diseña la pantalla de gestión de platos de la carta para el gestor del negocio. Debe incluir:

Listado de platos con imagen en miniatura, nombre, categoría, precio y estado (activo / inactivo / plato del día).
Filtros por categoría y por estado.
Botón destacado "Añadir plato".
Opción de editar, desactivar o eliminar cada plato.
Indicador visual especial para los platos marcados como "fuera de carta" publicados temporalmente.

# Formulario de alta de plato

Diseña el formulario para dar de alta un nuevo plato en la carta. Campos necesarios:

Nombre del plato.
Descripción / receta (campo de texto largo).
Fotografía (subida de imagen con vista previa).
Categoría (selector desplegable).
Precio (campo numérico con símbolo €).
Alérgenos (selector múltiple con iconos visuales de los 14 alérgenos oficiales de la UE).
Toggle: "Publicar como plato del día / fuera de carta" con selector de fecha de vigencia.
Botón "Guardar y analizar precios" que lanza la integración con IA.

# Panel de inteligencia de precios (IA)

Diseña la pantalla del módulo de análisis de precios con IA. Se activa al guardar un nuevo plato y muestra:

Resumen del plato recién creado (nombre, precio introducido).
Mapa o listado de negocios cercanos con platos similares detectados (nombre del negocio, plato similar, precio).
Indicador visual de posicionamiento de precio: "Por debajo del mercado", "En la media", "Por encima del mercado".
Recomendación generada por IA con posible rango de precio sugerido.
Botón para ajustar el precio antes de publicar o publicar sin cambios.
Nota de privacidad: los datos de competidores son públicos y anónimos.

# Vista pública de la carta (cliente final)

Diseña la carta digital pública que ve el cliente final al escanear el QR o acceder a la URL del negocio. Debe incluir:

Cabecera con logo y nombre del negocio.
Sección destacada "Platos del día" si hay platos publicados para esa fecha.
Navegación por categorías (pestañas o scroll horizontal).
Tarjeta por plato: foto, nombre, descripción corta, precio y botón de alérgenos.
Modal o desplegable de alérgenos al pulsar el icono correspondiente.
Diseño optimizado para móvil, sin necesidad de registro por parte del cliente.

# Configuración del negocio y gestión de QR

Diseña la pantalla de configuración del negocio dentro de la plataforma. Incluye:

Datos del negocio: nombre, dirección, teléfono, logo, horario.
URL pública personalizada de la carta (ej: carta.app/mi-restaurante).
Módulo de gestión de QR: generación del código QR, descarga en PNG/PDF, previsualización.
Opción para personalizar el color y logo del QR.

# Panel de administración de la plataforma (superadmin)

Diseña el panel de administración general de la plataforma SaaS para el superadministrador. Debe mostrar:

Listado de negocios registrados con estado (activo, inactivo, prueba).
Métricas globales: total de negocios, platos creados, accesos a cartas públicas.
Acciones: acceder al panel de un negocio, suspender cuenta, enviar notificación.
Diseño de tabla con filtros y búsqueda.