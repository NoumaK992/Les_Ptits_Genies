#!/usr/bin/env node
// Vérifie qu'un fichier .tsx n'utilise que le nuancier « Vox Collage ».
// Usage : node scripts/verifier-style.mjs [fichiers ou dossiers…]  (défaut : src)
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const REGLES = [
  ['couleur hexadécimale', /#[0-9a-fA-F]{3,8}\b/],
  ['rgb()/rgba()', /\brgba?\(/],
  ['dégradé', /gradient/],
  ['couleur Tailwind par défaut',
    /\b(?:bg|text|border|from|via|to|ring|fill|stroke|outline|divide|decoration|placeholder|accent|caret)-(?:white|black|(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3})\b/],
  ['ancien token', /\b(?:bg|text|border|from|via|to|ring|fill|stroke|outline|divide)-(?:primary|secondary|accent|success|error|ink|bg)\b/],
  ['ancienne ombre', /\bshadow-(?:card|card-hover|glow|glow-sm|glow-orange|glow-success|sm|md|lg|xl|2xl)\b/],
  ['ancienne police', /\bfont-(?:fredoka|nunito)\b/],
  ['classe CSS supprimée', /\b(?:glass|gradient-text-primary)\b/],
]

function lister(chemin) {
  if (statSync(chemin).isDirectory()) {
    return readdirSync(chemin).flatMap((nom) => lister(join(chemin, nom)))
  }
  return chemin.endsWith('.tsx') ? [chemin] : []
}

const cibles = process.argv.slice(2)
const fichiers = (cibles.length ? cibles : ['src']).flatMap(lister)
let problemes = 0

for (const fichier of fichiers) {
  readFileSync(fichier, 'utf8').split('\n').forEach((ligne, i) => {
    for (const [nom, motif] of REGLES) {
      const trouve = ligne.match(motif)
      if (trouve) {
        problemes++
        console.log(`${relative('.', fichier)}:${i + 1}  ${nom}  ${trouve[0]}`)
      }
    }
  })
}

console.log(problemes ? `\n${problemes} problème(s) dans ${fichiers.length} fichier(s).` : `OK : ${fichiers.length} fichier(s) conformes.`)
process.exit(problemes ? 1 : 0)
