<?php
declare(strict_types=1);

class Controller
{
    protected function view(string $view, array $data = [], string $layout = 'main'): void
    {
        $viewFile = BASE_PATH . '/app/views/' . $view . '.php';
        if (!is_file($viewFile)) {
            throw new RuntimeException('Vista no encontrada: ' . $view);
        }

        $title = $data['title'] ?? Config::get('app.name', 'Voley Diloz');
        $scripts = $data['scripts'] ?? [];
        $contentView = $viewFile;
        extract($data, EXTR_SKIP);

        require BASE_PATH . '/app/views/layouts/' . $layout . '.php';
    }

    protected function json(array $payload, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    protected function requestData(): array
    {
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (str_contains($contentType, 'application/json')) {
            $raw = file_get_contents('php://input');
            $decoded = json_decode($raw ?: '[]', true);
            return is_array($decoded) ? $decoded : [];
        }

        if (in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['PUT', 'DELETE'], true)) {
            parse_str(file_get_contents('php://input') ?: '', $data);
            return is_array($data) ? $data : [];
        }

        return $_POST;
    }

        protected function requireAuth(bool $api = false): bool
    {
        if (is_logged_in()) {
            return true;
        }

        if ($api) {
            $this->json(['message' => 'La sesion ha expirado'], 401);
        }

        redirect('login');
        return false;
    }

    protected function user(): ?array
    {
        return current_user();
    }
}
