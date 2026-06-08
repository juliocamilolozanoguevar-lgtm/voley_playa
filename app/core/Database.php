<?php
declare(strict_types=1);

class Database
{
    private static ?self $instance = null;
    private PDO $pdo;

    private function __construct()
    {
        $host = (string) Config::get('db.host', 'localhost');
        $port = (string) Config::get('db.port', '3306');
        $name = (string) Config::get('db.name', 'voley_diloz');
        $charset = (string) Config::get('db.charset', 'utf8mb4');
        $dsn = "mysql:host={$host};port={$port};dbname={$name};charset={$charset}";

        try {
            $this->pdo = new PDO($dsn, (string) Config::get('db.user', 'root'), (string) Config::get('db.pass', ''), [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $exception) {
            throw new RuntimeException(
                'No se pudo conectar con MySQL. Verifique que MySQL de XAMPP este iniciado y que la base de datos "'
                . $name
                . '" exista.',
                0,
                $exception
            );
        }
    }

    public static function instance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance;
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
