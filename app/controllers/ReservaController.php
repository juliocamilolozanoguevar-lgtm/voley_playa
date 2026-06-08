<?php
declare(strict_types=1);

class ReservaController extends Controller
{
    public function index(): void
    {
        if (!$this->requireAuth()) {
            return;
        }

        $this->view('reservas/index', [
            'title' => 'Reservas | Voley Diloz',
            'scripts' => ['js/reservas.php'],
            'activePage' => 'reservas',
        ]);
    }

    public function canchas(): void
    {
        if (!$this->requireAuth(true)) {
            return;
        }

        $model = new Cancha();
        $this->json($model->all());
    }

    public function list(): void
    {
        if (!$this->requireAuth(true)) {
            return;
        }

        $search = trim((string) ($_GET['search'] ?? ''));
        $model = new Reserva();
        $this->json($model->all($search));
    }

    public function availability(): void
    {
        if (!$this->requireAuth(true)) {
            return;
        }

        $canchaId = (int) ($_GET['canchaId'] ?? 0);
        $fecha = trim((string) ($_GET['fecha'] ?? ''));
        $horaInicio = trim((string) ($_GET['horaInicio'] ?? ''));
        $horaFin = trim((string) ($_GET['horaFin'] ?? ''));
        $ignoreId = isset($_GET['ignoreId']) ? (int) $_GET['ignoreId'] : null;

        if ($canchaId <= 0 || $fecha === '') {
            $this->json(['message' => 'Seleccione cancha y fecha'], 422);
        }

        $model = new Reserva();
        $payload = [
            'horariosLibres' => $model->availableSlots($canchaId, $fecha),
            'disponible' => null,
        ];

        if ($horaInicio !== '' && $horaFin !== '') {
            $payload['disponible'] = !$model->hasConflict($canchaId, $fecha, $horaInicio, $horaFin, $ignoreId);
        }

        $this->json($payload);
    }

    public function store(): void
    {
        if (!$this->requireAuth(true)) {
            return;
        }

        $data = $this->requestData();
        $validated = $this->validateReservationData($data, false);

        $reservaModel = new Reserva();
        $pagoModel = new Pago();

        if ($reservaModel->hasConflict($validated['canchaId'], $validated['fecha'], $validated['horaInicio'], $validated['horaFin'])) {
            $this->json(['message' => 'La cancha no esta disponible en ese horario'], 409);
        }

        $clienteModel = new Cliente();
        $cliente = $clienteModel->findOrCreate(
            $validated['clienteDni'],
            $validated['clienteNombre'],
            $validated['clienteApellido']
        );

        $payload = [
            'fecha' => $validated['fecha'],
            'horaInicio' => $validated['horaInicio'],
            'horaFin' => $validated['horaFin'],
            'idCliente' => $cliente['idCliente'],
            'canchaId' => $validated['canchaId'],
            'estadoReserva' => $validated['estadoReserva'],
            'estado' => $validated['estado'],
            'adelanto' => $validated['monto'],
        ];

        $db = Database::instance()->pdo();

        try {
            $db->beginTransaction();
            $reserva = $reservaModel->create($payload);
            $pagoModel->syncForReserva($reserva['idReserva'], $validated['monto']);
            $db->commit();
            $this->json($reservaModel->findById($reserva['idReserva']) ?? $reserva, 201);
        } catch (Throwable $exception) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            $this->json(['message' => 'No se pudo guardar la reserva'], 500);
        }
    }

    public function update(string $id): void
    {
        if (!$this->requireAuth(true)) {
            return;
        }

        $reservaId = (int) $id;
        $data = $this->requestData();
        $validated = $this->validateReservationData($data, true);

        $reservaModel = new Reserva();
        $pagoModel = new Pago();
        $reservaActual = $reservaModel->findById($reservaId);

        if (!$reservaActual) {
            $this->json(['message' => 'Reserva no encontrada'], 404);
        }

        $estadoActual = strtoupper((string) ($reservaActual['estadoReserva'] ?? ''));
        $estadoNuevo = strtoupper($validated['estadoReserva']);
        if ($estadoNuevo === 'CANCELADA' && $estadoActual !== 'CANCELADA' && date('Y-m-d') >= (string) $reservaActual['fecha']) {
            $this->json(['message' => 'Solo se puede cancelar una reserva antes de la fecha programada'], 422);
        }

        if ($estadoNuevo !== 'CANCELADA' && $reservaModel->hasConflict($validated['canchaId'], $validated['fecha'], $validated['horaInicio'], $validated['horaFin'], $reservaId)) {
            $this->json(['message' => 'La cancha no esta disponible en ese horario'], 409);
        }

        $payload = [
            'fecha' => $validated['fecha'],
            'horaInicio' => $validated['horaInicio'],
            'horaFin' => $validated['horaFin'],
            'canchaId' => $validated['canchaId'],
            'estadoReserva' => $validated['estadoReserva'],
            'estado' => $validated['estado'],
            'adelanto' => $validated['monto'],
        ];

        $db = Database::instance()->pdo();

        try {
            $db->beginTransaction();
            $reserva = $reservaModel->update($reservaId, $payload);
            $pagoModel->syncForReserva($reservaId, $validated['monto']);
            $db->commit();
            $this->json($reservaModel->findById($reservaId) ?? $reserva);
        } catch (Throwable $exception) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }
            $this->json(['message' => 'No se pudo actualizar la reserva'], 500);
        }
    }

    public function destroy(string $id): void
    {
        if (!$this->requireAuth(true)) {
            return;
        }

        $reservaId = (int) $id;
        $model = new Reserva();

        if (!$model->findById($reservaId)) {
            $this->json(['message' => 'Reserva no encontrada'], 404);
        }

        $model->delete($reservaId);
        $this->json(['message' => 'Reserva eliminada']);
    }

    private function validateReservationData(array $data, bool $update): array
    {
        $canchaId = (int) ($data['canchaId'] ?? 0);
        $fecha = trim((string) ($data['fecha'] ?? ''));
        $horaInicio = substr(trim((string) ($data['horaInicio'] ?? '')), 0, 5);
        $horaFin = substr(trim((string) ($data['horaFin'] ?? '')), 0, 5);
        $estadoReserva = trim((string) ($data['estadoReserva'] ?? 'RESERVADA'));
        $estado = trim((string) ($data['estado'] ?? 'ACTIVA'));
        $montoTexto = trim((string) ($data['monto'] ?? ''));
        $monto = $montoTexto === '' ? null : (float) $montoTexto;

        if ($canchaId <= 0 || $fecha === '' || $horaInicio === '' || $horaFin === '') {
            $this->json(['message' => 'Complete los datos de la reserva'], 422);
        }

        if (!preg_match('/^\d{2}:\d{2}$/', $horaInicio) || !preg_match('/^\d{2}:\d{2}$/', $horaFin)) {
            $this->json(['message' => 'Formato de hora invalido'], 422);
        }

        if ($horaInicio >= $horaFin) {
            $this->json(['message' => 'La hora final debe ser mayor que la inicial'], 422);
        }

        if ($horaInicio < '08:00' || $horaFin > '22:00') {
            $this->json(['message' => 'El horario debe estar entre 08:00 y 22:00'], 422);
        }

        if ($update) {
            return [
                'canchaId' => $canchaId,
                'fecha' => $fecha,
                'horaInicio' => $horaInicio,
                'horaFin' => $horaFin,
                'estadoReserva' => $estadoReserva !== '' ? strtoupper($estadoReserva) : 'RESERVADA',
                'estado' => $estado !== '' ? $estado : 'ACTIVA',
                'monto' => $monto,
            ];
        }

        $clienteDni = trim((string) ($data['clienteDni'] ?? ''));
        $clienteNombre = trim((string) ($data['clienteNombre'] ?? ''));
        $clienteApellido = trim((string) ($data['clienteApellido'] ?? ''));

        if (!preg_match('/^\d{8}$/', $clienteDni)) {
            $this->json(['message' => 'El DNI del cliente debe tener 8 digitos'], 422);
        }

        if ($clienteNombre === '' || $clienteApellido === '') {
            $this->json(['message' => 'Complete los datos del cliente'], 422);
        }

        return [
            'clienteDni' => $clienteDni,
            'clienteNombre' => $clienteNombre,
            'clienteApellido' => $clienteApellido,
            'canchaId' => $canchaId,
            'fecha' => $fecha,
            'horaInicio' => $horaInicio,
            'horaFin' => $horaFin,
            'estadoReserva' => $estadoReserva !== '' ? strtoupper($estadoReserva) : 'RESERVADA',
            'estado' => $estado !== '' ? $estado : 'ACTIVA',
            'monto' => $monto,
        ];
    }
}
