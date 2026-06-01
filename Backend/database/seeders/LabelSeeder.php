<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Label;
use Illuminate\Database\Seeder;

class LabelSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        $labels = [
            ['name' => 'Bug', 'color' => '#EF4444'],
            ['name' => 'Feature', 'color' => '#3B82F6'],
            ['name' => 'Urgent', 'color' => '#F59E0B'],
            ['name' => 'Documentation', 'color' => '#10B981'],
            ['name' => 'Design', 'color' => '#8B5CF6'],
            ['name' => 'Amélioration', 'color' => '#00B4DB'],
        ];

        foreach ($labels as $label) {
            Label::create([
                'user_id' => $user->id,
                'name' => $label['name'],
                'color' => $label['color'],
            ]);
        }
    }
}
