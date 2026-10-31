<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\BrainDumpController;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class BrainDumpRulesTest extends TestCase
{
    private BrainDumpController $controller;

    protected function setUp(): void
    {
        parent::setUp();
        $this->controller = new BrainDumpController;
    }

    #[DataProvider('estimationProvider')]
    public function test_estimate_minutes_rules(string $text, int $expected): void
    {
        $this->assertSame($expected, $this->invoke('estimateMinutes', $text));
    }

    public static function estimationProvider(): array
    {
        return [
            ['Réunion équipe produit', 60],
            ['Point hebdo', 60],
            ['Envoyer un email au client', 15],
            ['Répondre au mail', 15],
            ['Rédiger le rapport trimestriel', 90],
            ['Présentation client', 90],
            ['Appeler le fournisseur', 60], // "appel" matche avant "appeler"
            ['Phone support', 30],
            ['Acheter des courses', 20],
            ['Réfléchir à la stratégie', 45],
            ['Payer la facture', 15],
            ['Coder la feature X', 120],
            ['Développer le module', 120],
            ['Corriger le bug critique', 120],
            ['Tâche sans mot-clé', 30],
        ];
    }

    #[DataProvider('priorityProvider')]
    public function test_priority_rules(string $text, string $expected): void
    {
        $this->assertSame($expected, $this->invoke('deducePriority', $text));
    }

    public static function priorityProvider(): array
    {
        return [
            ['Préparer le dossier urgent', 'high'],
            ['Livrer ASAP', 'high'],
            ['Faire avant la deadline', 'high'],
            ['Pour demain matin', 'high'],
            ['Important : relancer le client', 'high'],
            ['Point critique avec le client', 'high'],
            ['Réunion hebdo', 'medium'],
            ['Acheter du pain', 'medium'],
        ];
    }

    private function invoke(string $method, string $text): mixed
    {
        $reflection = new \ReflectionMethod(BrainDumpController::class, $method);
        $reflection->setAccessible(true);

        return $reflection->invoke($this->controller, $text);
    }
}
