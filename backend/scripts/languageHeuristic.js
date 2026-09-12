// Devine la langue (fr/en) d'un livre déjà en base et dont la langue n'a pas été
// capturée à l'import (avant l'ajout de la colonne books.language). Purement local,
// pas d'appel API — approximatif mais suffisant pour filtrer/dédoublonner.
const FR_MARKERS = [
  /\ble\b/i, /\bla\b/i, /\bles\b/i, /\bdes\b/i, /\bune\b/i, /\bun\b/i, /\bet\b/i,
  /\bdu\b/i, /\bdans\b/i, /\bavec\b/i, /\bpour\b/i, /\bqui\b/i, /\bque\b/i,
  /\bcette\b/i, /\bétaient?\b/i, /\bsont\b/i, /[éèàçêîôûïù]/,
];
const EN_MARKERS = [
  /\bthe\b/i, /\band\b/i, /\bof\b/i, /\bis\b/i, /\bare\b/i, /\bwas\b/i,
  /\bwere\b/i, /\bwith\b/i, /\bfor\b/i, /\bthis\b/i, /\bthat\b/i, /\bfrom\b/i,
  /\bhis\b/i, /\bher\b/i, /\btheir\b/i,
];

function score(text, markers) {
  return markers.reduce((n, re) => n + (re.test(text) ? 1 : 0), 0);
}

export function guessLanguage({ title, description }) {
  const text = [title, description].filter(Boolean).join(" ");
  if (!text) return null;

  const frScore = score(text, FR_MARKERS);
  const enScore = score(text, EN_MARKERS);

  if (frScore === 0 && enScore === 0) return null;
  if (frScore >= enScore + 2) return "fr";
  if (enScore >= frScore + 2) return "en";
  return null; // signal trop faible/ambigu, mieux vaut ne pas deviner
}
