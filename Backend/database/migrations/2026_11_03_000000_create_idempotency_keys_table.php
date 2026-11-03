<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Clés d'idempotence : permettent de rejouer une requête après une
     * réponse perdue sans créer de doublon (création hors ligne, renvoi
     * automatique après reconnexion).
     */
    public function up(): void
    {
        Schema::create('idempotency_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key', 191);
            // Empreinte de la requête : une même clé ne doit pas servir à deux
            // requêtes différentes (protection contre une clé réutilisée).
            $table->string('request_hash', 64);
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->longText('response_body')->nullable();
            $table->string('content_type', 120)->nullable();
            $table->timestamps();

            // Une clé est unique par utilisateur, pas globalement.
            $table->unique(['user_id', 'key']);
            // Purge des vieilles clés.
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('idempotency_keys');
    }
};
