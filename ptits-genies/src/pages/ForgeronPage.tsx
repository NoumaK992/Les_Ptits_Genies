import { Carte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'

// Page provisoire : le jeu est en cours de réalisation.
export default function ForgeronPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <EnTete titre="🔨 Le Forgeron de mots" />
      <Carte className="p-6 text-center text-lg text-encre">Ce jeu arrive bientôt.</Carte>
    </div>
  )
}
