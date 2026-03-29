import { Injectable } from "@nestjs/common";

export interface MatchResult {
  storeProductName: string;
  price: number;
  isPromo: boolean;
  promoPrice?: number;
  score: number; // 0-1, чем выше — тем лучше совпадение
}

@Injectable()
export class NameMatcherService {
  private readonly STOP_WORDS = new Set([
    "и", "в", "на", "с", "по", "для", "из", "без", "не", "или",
    "мл", "л", "кг", "г", "гр", "шт", "уп", "пак", "пачка",
  ]);

  /**
   * Нормализует строку: lowercase, убирает спецсимволы, стоп-слова, лишние пробелы
   */
  normalize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[«»"'()[\]%,\.]/g, " ")
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zа-яё0-9.]/gi, "").trim())
      .filter((w) => w.length > 1 && !this.STOP_WORDS.has(w));
  }

  /**
   * Находит лучшее совпадение нашего canonical name среди списка товаров магазина.
   * Возвращает null если score < threshold.
   */
  findBestMatch(
    canonicalName: string,
    storeProducts: MatchResult[],
    threshold = 0.5,
  ): MatchResult | null {
    const queryWords = this.normalize(canonicalName);
    if (!queryWords.length) return null;

    let best: MatchResult | null = null;
    let bestScore = 0;

    for (const product of storeProducts) {
      const productWords = this.normalize(product.storeProductName);
      const score = this.calcScore(queryWords, productWords);

      if (score > bestScore) {
        bestScore = score;
        best = { ...product, score };
      }
    }

    return bestScore >= threshold ? best : null;
  }

  private calcScore(queryWords: string[], productWords: string[]): number {
    if (!productWords.length) return 0;

    let matched = 0;
    for (const qw of queryWords) {
      // Точное или частичное вхождение (например "3.2%" → "3.2")
      const hit = productWords.some(
        (pw) => pw === qw || pw.startsWith(qw) || qw.startsWith(pw),
      );
      if (hit) matched++;
    }

    const recall = matched / queryWords.length; // сколько наших слов нашлось
    const precision = matched / productWords.length; // не слишком ли "широкий" продукт

    // F-score, но recall важнее (главное чтобы наши слова были в названии магазина)
    return recall * 0.7 + precision * 0.3;
  }
}
