document.addEventListener("DOMContentLoaded", async () => {
    if (!requireLogin()) {
        return;
    }

    document.getElementById("nombreAdmin").textContent = obtenerNombreAdmin();
    await cargarDashboard();
});

async function cargarDashboard() {
    mostrarMensaje("mensajeDashboard", "");

    try {
        const [clientes, reservas, canchas, pagos] = await Promise.all([
            apiFetch("/clientes"),
            apiFetch("/reservas"),
            apiFetch("/canchas"),
            apiFetch("/pagos")
        ]);

        document.getElementById("totalClientes").textContent = clientes.length;
        document.getElementById("totalReservas").textContent = reservas.length;
        document.getElementById("totalCanchas").textContent = canchas.length;
        document.getElementById("totalPagos").textContent = pagos.length;

        const ingresos = calcularIngresos(pagos);
        document.getElementById("ingresosDia").textContent = formatearMoneda(ingresos.dia);
        document.getElementById("ingresosSemana").textContent = formatearMoneda(ingresos.semana);
        document.getElementById("ingresosMes").textContent = formatearMoneda(ingresos.mes);
    } catch (error) {
        mostrarMensaje("mensajeDashboard", error.message || "No se pudo cargar el dashboard");
    }
}

function calcularIngresos(pagos) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const inicioSemana = new Date(hoy);
    const diaSemana = inicioSemana.getDay();
    const ajuste = diaSemana === 0 ? 6 : diaSemana - 1;
    inicioSemana.setDate(inicioSemana.getDate() - ajuste);
    inicioSemana.setHours(0, 0, 0, 0);

    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    return pagos.reduce((acc, pago) => {
        if (!pago.fechaPago || !pago.monto) {
            return acc;
        }

        const fechaPago = new Date(pago.fechaPago);
        fechaPago.setHours(0, 0, 0, 0);
        const monto = Number(pago.monto) || 0;

        if (fechaPago.getTime() === hoy.getTime()) {
            acc.dia += monto;
        }

        if (fechaPago >= inicioSemana && fechaPago <= hoy) {
            acc.semana += monto;
        }

        if (fechaPago >= inicioMes && fechaPago <= hoy) {
            acc.mes += monto;
        }

        return acc;
    }, { dia: 0, semana: 0, mes: 0 });
}

function formatearMoneda(valor) {
    return `S/ ${Number(valor || 0).toFixed(2)}`;
}
