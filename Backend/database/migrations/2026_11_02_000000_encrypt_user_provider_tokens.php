<?php

use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Chiffre les jetons OAuth déjà stockés en clair.
     *
     * Le modèle UserProvider utilise désormais le cast "encrypted" : sans
     * cette migration, les anciennes valeurs ne pourraient plus être lues.
     */
    public function up(): void
    {
        DB::table('user_providers')
            ->select(['id', 'access_token', 'refresh_token'])
            ->orderBy('id')
            ->each(function ($row) {
                $updates = [];

                foreach (['access_token', 'refresh_token'] as $column) {
                    $value = $row->{$column};

                    if ($value === null || $value === '') {
                        continue;
                    }

                    try {
                        Crypt::decryptString($value);
                        // Déjà chiffré : rien à faire.
                    } catch (DecryptException) {
                        $updates[$column] = Crypt::encryptString($value);
                    }
                }

                if ($updates !== []) {
                    DB::table('user_providers')->where('id', $row->id)->update($updates);
                }
            });
    }

    public function down(): void
    {
        DB::table('user_providers')
            ->select(['id', 'access_token', 'refresh_token'])
            ->orderBy('id')
            ->each(function ($row) {
                $updates = [];

                foreach (['access_token', 'refresh_token'] as $column) {
                    $value = $row->{$column};

                    if ($value === null || $value === '') {
                        continue;
                    }

                    try {
                        $updates[$column] = Crypt::decryptString($value);
                    } catch (DecryptException) {
                        // Valeur déjà en clair.
                    }
                }

                if ($updates !== []) {
                    DB::table('user_providers')->where('id', $row->id)->update($updates);
                }
            });
    }
};
