<?php
declare(strict_types=1);

class Reserva extends BaseModel
{
    public function all(string $search = ''): array
    {
        $sql = "
            SELECT
                r.*,
                c.id_cliente AS cliente_id,
                c.dni AS cliente_dni,
                c.nombre AS cliente_nombre,
                c.apellido AS cliente_apellido,
                ca.id_cancha AS cancha_id,
                ca.nombre_cancha,
                ca.descripcion AS cancha_descripcion,
                p.id_pago,
                p.monto AS pago_monto,
                p.fecha_pago
            FROM reserva r
            LEFT JOIN cliente c ON c.id_cliente = r.id_cliente
            LEFT JOIN cancha ca ON ca.id_cancha = r.id_cancha
            LEFT JOIN pago p ON p.id_reserva = r.id_reserva
        ";

        $params = [];
        if ($search !== '') {
            $sql .= "
                WHERE c.nombre LIKE :search
                   OR c.apellido LIKE :search
                   OR c.dni LIKE :search
                   OR ca.nombre_cancha LIKE :search
                   OR r.fecha LIKE :search
                   OR r.estado_reserva LIKE :search
            ";
            $params['search'] = '%' . $search . '%';
        }

        $sql .= ' ORDER BY r.fecha DESC, r.hora_inicio DESC, r.id_reserva DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return array_map([$this, 'mapReserva'], $stmt->fetchAll());
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare("
            SELECT
                r.*,
                c.id_cliente AS cliente_id,
                c.dni AS cliente_dni,
                c.nombre AS cliente_nombre,
                c.apellido AS cliente_apellido,
                ca.id_cancha AS cancha_id,
                ca.nombre_cancha,
                ca.descripcion AS cancha_descripcion,
                p.id_pago,
                p.monto AS pago_monto,
                p.fecha_pago
            FROM reserva r
            LEFT JOIN cliente c ON c.id_cliente = r.id_cliente
            LEFT JOIN cancha ca ON ca.id_cancha = r.id_cancha
            LEFT JOIN pago p ON p.id_reserva = r.id_reserva
            WHERE r.id_reserva = :id
            LIMIT 1
        ");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch();

        return $row ? $this->mapReserva($row) : null;
    }

    public function countAll(): int
    {
        return (int) $this->db
            ->query("SELECT COUNT(*) FROM reserva WHERE UPPER(estado_reserva) <> 'CANCELADA'")
            ->fetchColumn();
    }

    public function create(array $data): array
    {
        $stmt = $this->db->prepare("
            INSERT INTO reserva (
                fecha,
                hora_inicio,
                hora_fin,
                id_cliente,
                id_cancha,
                estado_reserva,
                adelanto,
                estado
            ) VALUES (
                :fecha,
                :hora_inicio,
                :hora_fin,
                :id_cliente,
                :id_cancha,
                :estado_reserva,
                :adelanto,
                :estado
            )
        ");

        $stmt->execute([
            'fecha' => $data['fecha'],
            'hora_inicio' => $data['horaInicio'],
            'hora_fin' => $data['horaFin'],
            'id_cliente' => $data['idCliente'],
            'id_cancha' => $data['canchaId'],
            'estado_reserva' => $data['estadoReserva'] ?? 'RESERVADA',
            'adelanto' => $data['adelanto'],
            'estado' => $data['estado'] ?? 'ACTIVA',
        ]);

        return $this->findById((int) $this->db->lastInsertId()) ?? [];
    }

    public function update(int $id, array $data): array
    {
        $stmt = $this->db->prepare("
            UPDATE reserva
            SET fecha = :fecha,
                hora_inicio = :hora_inicio,
                hora_fin = :hora_fin,
                id_cancha = :id_cancha,
                estado_reserva = :estado_reserva,
                adelanto = :adelanto,
                estado = :estado
            WHERE id_reserva = :id
        ");

        $stmt->execute([
            'fecha' => $data['fecha'],
            'hora_inicio' => $data['horaInicio'],
            'hora_fin' => $data['horaFin'],
            'id_cancha' => $data['canchaId'],
            'estado_reserva' => $data['estadoReserva'] ?? 'RESERVADA',
            'adelanto' => $data['adelanto'],
            'estado' => $data['estado'] ?? 'ACTIVA',
            'id' => $id,
        ]);

        return $this->findById($id) ?? [];
    }

    public function delete(int $id): void
    {
        $deletePago = $this->db->prepare('DELETE FROM pago WHERE id_reserva = :id');
        $deletePago->execute(['id' => $id]);

        $deleteReserva = $this->db->prepare('DELETE FROM reserva WHERE id_reserva = :id');
        $deleteReserva->execute(['id' => $id]);
    }

    public function hasConflict(int $canchaId, string $fecha, string $horaInicio, string $horaFin, ?int $ignoreReservaId = null): bool
    {
        $sql = "
            SELECT COUNT(*) 
            FROM reserva
            WHERE id_cancha = :canchaId
              AND fecha = :fecha
              AND UPPER(estado_reserva) <> 'CANCELADA'
              AND :horaInicio < hora_fin
              AND :horaFin > hora_inicio
        ";

        $params = [
            'canchaId' => $canchaId,
            'fecha' => $fecha,
            'horaInicio' => $horaInicio,
            'horaFin' => $horaFin,
        ];

        if ($ignoreReservaId !== null) {
            $sql .= ' AND id_reserva <> :ignoreId';
            $params['ignoreId'] = $ignoreReservaId;
        }

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return (int) $stmt->fetchColumn() > 0;
    }

    public function availableSlots(int $canchaId, string $fecha): array
    {
        $stmt = $this->db->prepare("
            SELECT hora_inicio, hora_fin
            FROM reserva
            WHERE id_cancha = :canchaId
              AND fecha = :fecha
              AND UPPER(estado_reserva) <> 'CANCELADA'
            ORDER BY hora_inicio ASC
        ");
        $stmt->execute([
            'canchaId' => $canchaId,
            'fecha' => $fecha,
        ]);

        $reservas = $stmt->fetchAll();
        $slots = [];
        $cursor = new DateTimeImmutable('08:00');
        $end = new DateTimeImmutable('22:00');

        while ($cursor < $end) {
            $slotStart = $cursor->format('H:i');
            $slotEnd = $cursor->modify('+30 minutes')->format('H:i');

            if ($slotEnd > '22:00') {
                break;
            }

            $occupied = false;
            foreach ($reservas as $reserva) {
                $reservaInicio = substr((string) $reserva['hora_inicio'], 0, 5);
                $reservaFin = substr((string) $reserva['hora_fin'], 0, 5);

                if ($slotStart < $reservaFin && $slotEnd > $reservaInicio) {
                    $occupied = true;
                    break;
                }
            }

            if (!$occupied) {
                $slots[] = $slotStart;
            }

            $cursor = $cursor->modify('+30 minutes');
        }

        return $slots;
    }

    private function mapReserva(array $row): array
    {
        return [
            'idReserva' => (int) $row['id_reserva'],
            'fecha' => (string) $row['fecha'],
            'horaInicio' => substr((string) $row['hora_inicio'], 0, 5),
            'horaFin' => substr((string) $row['hora_fin'], 0, 5),
            'estadoReserva' => (string) ($row['estado_reserva'] ?? 'RESERVADA'),
            'estado' => (string) ($row['estado'] ?? 'ACTIVA'),
            'adelanto' => $row['adelanto'] !== null ? (float) $row['adelanto'] : null,
            'cliente' => $row['cliente_id'] ? [
                'idCliente' => (int) $row['cliente_id'],
                'dni' => (string) $row['cliente_dni'],
                'nombre' => (string) $row['cliente_nombre'],
                'apellido' => (string) $row['cliente_apellido'],
            ] : null,
            'cancha' => $row['cancha_id'] ? [
                'idCancha' => (int) $row['cancha_id'],
                'nombreCancha' => (string) $row['nombre_cancha'],
                'descripcion' => (string) ($row['cancha_descripcion'] ?? ''),
            ] : null,
            'pago' => $row['id_pago'] ? [
                'idPago' => (int) $row['id_pago'],
                'monto' => (float) $row['pago_monto'],
                'fechaPago' => $row['fecha_pago'],
            ] : null,
        ];
    }
}
