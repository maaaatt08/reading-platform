// Vocabulaire volontairement identique à frontend/lib/constants.ts (MOOD_OPTIONS / PACE_OPTIONS) :
// si les deux divergent, les filtres mood/pace du frontend ne matcheront plus les tags posés ici.

const MOOD_KEYWORDS = {
  dark: ["dark", "grim", "brutal", "violent", "bleak", "horror", "macabre"],
  emotional: ["heartbreaking", "moving", "emotional", "grief", "tearjerker", "poignant"],
  funny: ["hilarious", "funny", "humor", "humorous", "comedy", "witty", "satire"],
  hopeful: ["hopeful", "uplifting", "inspiring", "triumph", "redemption", "heartwarming"],
  mysterious: ["mystery", "mysterious", "secret", "detective", "whodunit", "enigma"],
  reflective: ["philosophical", "reflective", "literary fiction", "memoir", "introspective", "meditation"],
  tense: ["thriller", "tense", "suspenseful", "suspense", "danger", "gripping"],
  adventurous: ["adventure", "quest", "epic", "journey", "exploration", "expedition"],
};

const PACE_KEYWORDS = {
  fast: ["thriller", "action-packed", "page-turner", "fast-paced", "gripping", "suspense", "race against time"],
  slow: ["literary fiction", "slow burn", "character-driven", "meditative", "lyrical", "memoir"],
};

function matchesAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

// Devine des tags mood/pace à partir du titre/description/genre d'un livre.
// Résultat volontairement prudent : mieux vaut un livre sans tag qu'un mauvais tag,
// donc on ne force jamais un mood, et le pace retombe sur "medium" par défaut.
export function inferTags(book) {
  const text = [book.title, book.description, book.genre].filter(Boolean).join(" ").toLowerCase();

  const moods = Object.entries(MOOD_KEYWORDS)
    .filter(([, keywords]) => matchesAny(text, keywords))
    .map(([mood]) => mood);

  let pace = "medium";
  if (matchesAny(text, PACE_KEYWORDS.fast)) pace = "fast";
  else if (matchesAny(text, PACE_KEYWORDS.slow)) pace = "slow";

  return { moods, pace };
}
