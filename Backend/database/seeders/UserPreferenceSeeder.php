<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserPreference;
use Illuminate\Database\Seeder;

class UserPreferenceSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first() ?? User::factory()->create();

        UserPreference::create([
            'user_id' => $user->id,
            'timezone' => 'Europe/Paris',
            'work_start_time' => '09:00',
            'work_end_time' => '18:00',
            'planning_style' => 'flexible',
            'receive_reminders' => true,
            'interface_preference' => 'list',
            'dark_mode' => false,
            'onboarding_completed' => true,
        ]);
    }
}
