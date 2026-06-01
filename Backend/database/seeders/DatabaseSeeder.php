<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ProjectSeeder::class,
            LabelSeeder::class,
            TeamSeeder::class,
            TaskSeeder::class,
            TaskCommentSeeder::class,
            TimeEntrySeeder::class,
            NotificationSeeder::class,
            UserPreferenceSeeder::class,
        ]);
    }
}
