import { Carte } from '@/components/ui/Carte'
import { EnTete } from '@/components/ui/EnTete'

// Page provisoire : le jeu est en cours de réalisation.
export default function CoupeMotsPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <EnTete titre="✂️ Coupe-Mots" />
      <Carte className="p-6 text-center text-lg text-encre">Ce jeu arrive bientôt.</Carte>
    </div>
  )
}
