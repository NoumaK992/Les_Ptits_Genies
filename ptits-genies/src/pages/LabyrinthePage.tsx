import { Carte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'

// Page provisoire : le jeu est en cours de réalisation.
export default function LabyrinthePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <EnTete titre="🧭 Le Labyrinthe" />
      <Carte className="p-6 text-center text-lg text-encre">Ce jeu arrive bientôt.</Carte>
    </div>
  )
}
