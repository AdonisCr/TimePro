<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Prévient l'ancienne adresse email qu'un changement vient d'avoir lieu.
 * Envoyée "à la volée" (on-demand) car l'ancienne adresse n'est plus
 * rattachée au compte.
 */
class EmailAddressChanged extends Notification
{
    use Queueable;

    public function __construct(
        public string $userName,
        public string $oldEmail,
        public string $newEmail,
    ) {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Votre adresse email Time Pro a été modifiée')
            ->greeting('Bonjour ' . $this->userName)
            ->line('L\'adresse email de votre compte Time Pro vient d\'être changée.')
            ->line('Ancienne adresse : ' . $this->oldEmail)
            ->line('Nouvelle adresse : ' . $this->newEmail)
            ->line('Si vous êtes à l\'origine de ce changement, aucune action n\'est nécessaire.')
            ->line('Sinon, réinitialisez votre mot de passe immédiatement et contactez le support : votre compte est peut-être compromis.');
    }
}
