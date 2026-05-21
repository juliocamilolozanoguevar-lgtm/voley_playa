<?php
declare(strict_types=1);

class Router
{
    private array $routes = [
        ['GET', '#^/$#', 'HomeController', 'index'],
        ['GET', '#^/login$#', 'AuthController', 'showLogin'],
        ['GET', '#^/dashboard$#', 'DashboardController', 'index'],
        ['GET', '#^/clientes$#', 'ClienteController', 'index'],
        ['GET', '#^/reservas$#', 'ReservaController', 'index'],
        ['GET', '#^/video$#', 'VideoController', 'index'],
        ['GET', '#^/logout$#', 'AuthController', 'logout'],

        ['POST', '#^/api/login$#', 'AuthController', 'loginApi'],
        ['GET', '#^/api/session$#', 'AuthController', 'sessionInfo'],
        ['GET', '#^/api/dashboard/summary$#', 'DashboardController', 'summary'],

        ['GET', '#^/api/clientes$#', 'ClienteController', 'list'],
        ['POST', '#^/api/clientes$#', 'ClienteController', 'store'],
        ['GET', '#^/api/clientes/dni/([0-9]{8})$#', 'ClienteController', 'findByDni'],
        ['DELETE', '#^/api/clientes/([0-9]+)$#', 'ClienteController', 'destroy'],

        ['GET', '#^/api/canchas$#', 'ReservaController', 'canchas'],
        ['GET', '#^/api/reservas$#', 'ReservaController', 'list'],
        ['POST', '#^/api/reservas$#', 'ReservaController', 'store'],
        ['PUT', '#^/api/reservas/([0-9]+)$#', 'ReservaController', 'update'],
        ['DELETE', '#^/api/reservas/([0-9]+)$#', 'ReservaController', 'destroy'],
        ['GET', '#^/api/reservas/disponibilidad$#', 'ReservaController', 'availability'],
    ];

    public function run(): void
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
        $path = $this->getPath();

        try {
            foreach ($this->routes as [$routeMethod, $pattern, $controller, $action]) {
                if ($method !== $routeMethod) {
                    continue;
                }

                if (!preg_match($pattern, $path, $matches)) {
                    continue;
                }

                array_shift($matches);
                $instance = new $controller();
                $instance->{$action}(...$matches);
                return;
            }
        } catch (Throwable $exception) {
            $this->handleException($path, $exception);
            return;
        }

        http_response_code(404);
        echo 'Pagina no encontrada';
    }

    private function getPath(): string
    {
        if (isset($_GET['url'])) {
            $url = trim((string) $_GET['url'], '/');
            return $url === '' ? '/' : '/' . $url;
        }

        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $basePath = (string) Config::get('app.base_path', '');

        if ($basePath !== '' && str_starts_with($uri, $basePath)) {
            $uri = substr($uri, strlen($basePath)) ?: '/';
        }

        if ($uri === '/index.php' || $uri === '/app/index.php') {
            return '/';
        }

        $normalized = rtrim($uri, '/');
        return $normalized === '' ? '/' : $normalized;
    }

    private function handleException(string $path, Throwable $exception): void
    {
        $message = Config::get('app.debug', true)
            ? $exception->getMessage()
            : 'Ocurrio un error inesperado en la aplicacion.';

        http_response_code(500);

        if (str_starts_with($path, '/api/')) {
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode(['message' => $message], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            return;
        }

        echo '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Error</title><style>body{margin:0;font-family:Arial,sans-serif;background:#f4f8fc;color:#16304d}.container{width:min(100% - 2rem,960px);margin:0 auto}.py-5{padding-block:3rem}.alert{padding:1rem;border-radius:1rem}.alert-danger{background:#ffe8ef;border:1px solid #ffc3d2;color:#8f1236}.shadow-sm{box-shadow:0 12px 30px rgba(21,56,96,.08)}.h4{font-size:1.35rem}.mb-2{margin-bottom:.5rem}.mb-0{margin-bottom:0}</style></head><body><main class="container py-5"><div class="alert alert-danger shadow-sm"><h1 class="h4 mb-2">La aplicacion no pudo completarse</h1><p class="mb-0">'
            . e($message)
            . '</p></div></main></body></html>';
    }
}
