export interface InferenceRule {
  keywords: string[];
  category: string;
  sensitive: boolean;
}

// Base de règles volontairement limitée pour la démo (cf. PDF section 7).
// Chaque règle = un ensemble de mots-clés associés à une catégorie d'intérêt.
export const inferenceRules: InferenceRule[] = [
  {
    keywords: ["football", "soccer", "fifa"],
    category: "Sports",
    sensitive: false,
  },
  {
    keywords: ["steam", "gpu", "gaming", "playstation", "xbox"],
    category: "Gaming",
    sensitive: false,
  },
  {
    keywords: ["sneakers", "sale", "discount", "shop", "cart"],
    category: "Shopping",
    sensitive: false,
  },
  {
    keywords: ["quran", "bible", "mosque", "church", "halal", "prayer"],
    category: "Religious interest",
    sensitive: true,
  },
  {
    keywords: ["diagnosis", "symptom", "therapy", "medication", "clinic"],
    category: "Health interest",
    sensitive: true,
  },
  {
    keywords: ["dating", "lgbt", "relationship-advice"],
    category: "Personal/relationship interest",
    sensitive: true,
  },
];