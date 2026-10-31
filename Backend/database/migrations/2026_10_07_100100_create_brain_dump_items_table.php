<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brain_dump_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brain_dump_id')->constrained()->cascadeOnDelete();
            $table->string('text', 500);
            $table->integer('estimated_minutes')->default(30);
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['pending', 'accepted', 'rejected', 'converted'])->default('pending');
            $table->foreignId('task_id')->nullable()->constrained('tasks')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brain_dump_items');
    }
};
