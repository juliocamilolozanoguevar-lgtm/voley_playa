<header class="landing-header">
    <a class="landing-brand" href="<?= e(app_url()) ?>">Voley Diloz</a>
    <nav class="landing-nav" aria-label="Navegacion principal">
        <a href="#funciones">Funciones</a>
        <a href="#flujo">Flujo</a>
        <a href="<?= e(app_url('login')) ?>" class="landing-login">Ingresar</a>
    </nav>
</header>

<main>
    <section class="landing-hero">
        <div class="landing-hero-copy">
            <span class="landing-kicker">Reservas de canchas de voley playa</span>
            <h1>Gestiona clientes, horarios, pagos y reservas desde un solo panel.</h1>
            <p>Voley Diloz organiza la disponibilidad de canchas, evita cruces de horarios y mantiene el historial de pagos listo para consulta.</p>
            <div class="landing-actions">
                <a class="btn btn-primary" href="<?= e(app_url('login')) ?>">Entrar al sistema</a>
                <a class="btn btn-outline-primary" href="#funciones">Ver funciones</a>
            </div>
        </div>

        <div class="landing-product" aria-label="Vista previa del sistema">
            <div class="landing-product-bar">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="landing-product-grid">
                <div class="landing-metric">
                    <small>Clientes</small>
                    <strong>128</strong>
                </div>
                <div class="landing-metric">
                    <small>Reservas</small>
                    <strong>42</strong>
                </div>
                <div class="landing-metric">
                    <small>Pagos</small>
                    <strong>S/ 860</strong>
                </div>
            </div>
            <div class="landing-court">
                <div class="landing-net"></div>
                <div class="landing-slot is-free">08:00</div>
                <div class="landing-slot is-active">10:30</div>
                <div class="landing-slot is-free">16:00</div>
            </div>
        </div>
    </section>

    <section class="landing-section" id="funciones">
        <div class="landing-section-heading">
            <span class="landing-kicker">Componentes</span>
            <h2>Todo lo necesario para operar el dia a dia</h2>
        </div>
        <div class="landing-feature-grid">
            <article class="landing-feature">
                <span>01</span>
                <h3>Clientes</h3>
                <p>Registro, busqueda, eliminacion controlada y nueva reserva desde clientes existentes.</p>
            </article>
            <article class="landing-feature">
                <span>02</span>
                <h3>Reservas</h3>
                <p>Disponibilidad por cancha y fecha, edicion de reservas y validacion de cruces de horario.</p>
            </article>
            <article class="landing-feature">
                <span>03</span>
                <h3>Pagos</h3>
                <p>Adelantos vinculados a reservas y resumen de ingresos por dia, semana y mes.</p>
            </article>
        </div>
    </section>

    <section class="landing-section landing-flow" id="flujo">
        <div>
            <span class="landing-kicker">Flujo de trabajo</span>
            <h2>De cliente a reserva en pocos pasos</h2>
        </div>
        <ol class="landing-steps">
            <li>Busca o registra al cliente.</li>
            <li>Selecciona cancha y fecha disponible.</li>
            <li>Elige hora inicial y final.</li>
            <li>Guarda la reserva y registra el adelanto.</li>
        </ol>
    </section>
</main>

<footer class="landing-footer">
    <span>Voley Diloz</span>
    <a href="<?= e(app_url('login')) ?>">Acceso administrativo</a>
</footer>
