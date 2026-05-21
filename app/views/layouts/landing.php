<?php
declare(strict_types=1);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($title) ?></title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="<?= e(asset('css/style.css')) ?>">
</head>
<body class="landing-body">
    <?php require $contentView; ?>

    <script>
        window.APP_CONFIG = {
            basePath: <?= json_encode((string) Config::get('app.base_path', '')) ?>,
            appUrl: <?= json_encode((string) Config::get('app.url', '')) ?>
        };
    </script>
    <script src="<?= e(asset('js/app.php')) ?>"></script>
</body>
</html>
