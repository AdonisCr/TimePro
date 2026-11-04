<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    protected $signature = 'push:generate-keys
                            {--write : Écrit les clés dans Backend/.env et Frontend/.env sans les afficher}';

    protected $description = 'Génère une paire de clés VAPID pour les notifications push';

    public function handle(): int
    {
        $keys = VAPID::createVapidKeys();

        if (!$this->option('write')) {
            $this->line('VAPID_PUBLIC_KEY=' . $keys['publicKey']);
            $this->line('VAPID_PRIVATE_KEY=' . $keys['privateKey']);
            $this->newLine();
            $this->comment('Relance la commande avec --write pour enregistrer les clés dans les fichiers .env.');

            return self::SUCCESS;
        }

        $backendEnv = base_path('.env');
        $frontendEnv = base_path('../Frontend/.env');

        if (!$this->updateEnv($backendEnv, [
            'VAPID_PUBLIC_KEY' => $keys['publicKey'],
            'VAPID_PRIVATE_KEY' => $keys['privateKey'],
        ])) {
            $this->error('Impossible de mettre à jour ' . $backendEnv);

            return self::FAILURE;
        }

        if (!$this->updateEnv($frontendEnv, [
            'VITE_VAPID_PUBLIC_KEY' => $keys['publicKey'],
        ])) {
            $this->error('Impossible de mettre à jour ' . $frontendEnv);

            return self::FAILURE;
        }

        $this->info('Clés VAPID enregistrées dans Backend/.env et Frontend/.env.');
        $this->comment('Pense à vider le cache de configuration si besoin : php artisan config:clear');

        return self::SUCCESS;
    }

    /**
     * Met à jour (ou ajoute) des variables dans un fichier .env, sans écraser le reste.
     */
    private function updateEnv(string $path, array $values): bool
    {
        $content = is_file($path) ? (string) file_get_contents($path) : '';

        foreach ($values as $key => $value) {
            $pattern = '/^' . preg_quote($key, '/') . '=.*$/m';

            if (preg_match($pattern, $content)) {
                $content = (string) preg_replace($pattern, $key . '=' . $value, $content);
            } else {
                $content = rtrim($content, "\n") . "\n" . $key . '=' . $value . "\n";
            }
        }

        return file_put_contents($path, $content) !== false;
    }
}
