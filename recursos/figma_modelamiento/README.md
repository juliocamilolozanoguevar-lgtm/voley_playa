# Modelamiento UI/UX - Voley Playa Diloz

Archivos preparados para importar en Figma:

- `00_wireframe_sistema.svg`: wireframe de todas las ventanas principales.
- `01_ui_pantallas_sistema.svg`: pantallas UI basadas en el sistema desarrollado.
- `02_flujo_ux_reservas.svg`: flujo UX de reserva, conflicto y cancelacion.
- `03_componentes_estilo.svg`: guia visual de colores, componentes y estados.
- `04_responsive_mobile_tablet.svg`: vistas mobile y tablet para Figma.

Uso recomendado en Figma:

1. Abrir el archivo `voley_playa_Diloz`.
2. Crear paginas: `00 Wireframes`, `01 UI Sistema`, `02 Flujo UX`, `03 Componentes`, `04 Responsive`.
3. Arrastrar cada SVG a su pagina correspondiente.
4. Desagrupar si necesitas editar textos, posiciones o componentes.

Pantallas consideradas:

- Landing publica.
- Login administrador.
- Dashboard.
- Clientes y reservas.
- Modal nueva reserva.
- Reservas.
- Modal editar reserva.
- Responsive mobile: login, dashboard, clientes/reservas y reservas.
- Responsive tablet: dashboard y clientes/reservas.

Regla UX importante:

- Al cambiar una reserva a `CANCELADA` antes de su fecha programada, el horario queda libre.
- Si la fecha de la reserva ya llego o paso, el sistema no permite cancelarla desde editar.
