// Associe un auteur à une tradition littéraire (origine géographique/linguistique),
// à partir des listes d'auteurs déjà utilisées dans seedQueries.js (CLASSICS_QUERIES,
// FRENCH_LITERATURE_QUERIES, etc.) — reconstituées ici sous forme de données exploitables
// plutôt que de parser les commentaires des requêtes à l'exécution.
export const LITERATURE_OPTIONS = [
  "francaise",
  "russe",
  "anglaise",
  "americaine",
  "hispanophone",
  "germanique",
  "italienne",
  "japonaise",
  "chinoise",
  "coreenne",
  "africaine",
  "moyen-orientale",
  "indienne",
  "nordique",
  "portugaise-bresilienne",
];

const AUTHOR_LITERATURE = {
  francaise: [
    "Victor Hugo", "Albert Camus", "Amélie Nothomb", "Gustave Flaubert", "Marcel Proust",
    "Émile Zola", "Honoré de Balzac", "Voltaire", "Stendhal", "Alexandre Dumas",
    "Marguerite Duras", "Jean-Paul Sartre", "Simone de Beauvoir", "Michel Houellebecq",
    "Guillaume Musso", "Marc Levy", "Bernard Werber", "Michel Bussi", "Franck Thilliez",
    "Fred Vargas", "Virginie Grimaldi", "Aurélie Valognes", "Molière", "Jean Racine",
    "Pierre Corneille", "Jean de La Fontaine", "Michel de Montaigne", "François Rabelais",
    "Denis Diderot", "Jean-Jacques Rousseau", "Blaise Pascal", "Pierre Choderlos de Laclos",
    "Charles Baudelaire", "Arthur Rimbaud", "Paul Verlaine", "Guy de Maupassant",
    "George Sand", "Alphonse de Lamartine", "Alphonse Daudet", "Jules Verne",
    "Edmond Rostand", "Marguerite Yourcenar", "Colette", "André Gide", "André Malraux",
    "Romain Gary", "Boris Vian", "Georges Perec", "Patrick Modiano", "Le Clézio",
    "Annie Ernaux", "Michel Tournier", "Marcel Pagnol", "Joël Dicker", "Pierre Lemaitre",
    "David Foenkinos", "Delphine de Vigan", "Leïla Slimani", "Anna Gavalda",
    "Katherine Pancol", "Éric-Emmanuel Schmitt", "Frédéric Beigbeder", "Tahar Ben Jelloun",
    "Olivier Bourdeaut", "Laurent Gounelle", "René Goscinny", "Hergé",
    "Antoine de Saint-Exupéry",
    // Non-fiction / genre française (vague 8 : business, dev perso, histoire, sciences, SF)
    "Thomas Piketty", "Jacques Attali", "Nicolas Bouzou", "Xavier Niel", "Marc Simoncini",
    "Isaac Getz", "Olivier Sibony", "Jean Tirole", "Gaspard Koenig",
    "Christophe André", "Frédéric Lenoir", "Thierry Janssen", "Ilios Kotsou",
    "Max Gallo", "Franck Ferrand", "Lorànt Deutsch", "Jean-Christian Petitfils",
    "Jean-Pierre Luminet", "Aurélien Barrau", "Idriss Aberkane",
    "Pierre Bordage", "Alain Damasio", "Jean-Marc Ligny", "Catherine Dufour",
    "Sylvain Tesson", "Cyril Lignac", "Philippe Etchebest",
  ],
  russe: [
    "Anton Chekhov", "Nikolai Gogol", "Alexander Pushkin", "Ivan Turgenev",
    "Mikhail Bulgakov", "Vladimir Nabokov", "Leo Tolstoy", "Tolstoi", "Fyodor Dostoevsky", "Dostoevsky",
  ],
  anglaise: [
    "William Shakespeare", "Charlotte Brontë", "Emily Brontë", "Thomas Hardy",
    "Oscar Wilde", "James Joyce", "Jane Austen", "Charles Dickens", "Virginia Woolf",
    "George Orwell", "Aldous Huxley", "Lewis Carroll", "C.S. Lewis", "A.A. Milne",
    "Roald Dahl", "Agatha Christie", "Richard Osman", "Anthony Horowitz", "Ian Rankin",
    "Val McDermid", "Paula Hawkins", "Neil Gaiman", "Kazuo Ishiguro", "Lee Child",
  ],
  americaine: [
    "Mark Twain", "Ernest Hemingway", "Toni Morrison", "F. Scott Fitzgerald",
    "William Faulkner", "John Steinbeck", "Herman Melville", "Edgar Allan Poe",
    "Kurt Vonnegut", "Harper Lee", "Stephen King", "George R.R. Martin", "Gillian Flynn",
    "J.D. Salinger", "Salinger", "Cormac McCarthy", "Donna Tartt", "John Grisham",
    "James Patterson", "David Baldacci", "Michael Connelly", "Harlan Coben",
    "Nicholas Sparks", "Danielle Steel", "Nora Roberts", "Emily Henry", "Rebecca Yarros",
    "Dan Brown", "Sally Rooney", "Colleen Hoover", "Brandon Sanderson", "Suzanne Collins",
    "Rick Riordan", "Cassandra Clare", "Sarah J. Maas", "Leigh Bardugo",
  ],
  hispanophone: [
    "Gabriel García Márquez", "Isabel Allende", "Jorge Luis Borges", "Mario Vargas Llosa",
    "Pablo Neruda", "Miguel de Cervantes", "Julio Cortázar", "Paulo Coelho",
  ],
  germanique: ["Franz Kafka", "Johann Wolfgang von Goethe", "Thomas Mann", "Hermann Hesse"],
  italienne: ["Italo Calvino", "Umberto Eco", "Elena Ferrante", "Dante Alighieri"],
  japonaise: [
    "Haruki Murakami", "Yukio Mishima", "Kenzaburo Oe", "Natsume Soseki",
    "Eiichiro Oda", "Akira Toriyama", "Naoki Urasawa",
  ],
  chinoise: ["Liu Cixin"],
  coreenne: ["Han Kang", "Min Jin Lee"],
  africaine: ["Chinua Achebe", "Chimamanda Ngozi Adichie", "Wole Soyinka"],
  "moyen-orientale": ["Naguib Mahfouz", "Khaled Hosseini", "Orhan Pamuk", "Salman Rushdie"],
  indienne: ["Rabindranath Tagore", "Arundhati Roy", "Vikram Seth", "Amitav Ghosh"],
  nordique: ["Stieg Larsson", "Jo Nesbø", "Henning Mankell", "Camilla Läckberg"],
  "portugaise-bresilienne": ["José Saramago", "Fernando Pessoa", "Clarice Lispector"],
};

// Table à plat (nom en minuscules -> valeur) pour une recherche rapide.
const LOOKUP = [];
for (const [literature, names] of Object.entries(AUTHOR_LITERATURE)) {
  for (const name of names) {
    LOOKUP.push([name.toLowerCase(), literature]);
  }
}
LOOKUP.sort((a, b) => b[0].length - a[0].length); // noms les plus longs d'abord

export function inferLiterature(author) {
  if (!author) return null;
  const lower = author.toLowerCase();
  for (const [name, literature] of LOOKUP) {
    if (lower.includes(name)) return literature;
  }
  return null;
}
