import fs from "fs";
import path from "path";

export const loadRules = (): Record<number, string> => {
  try {
    const rulesPath = path.resolve(__dirname, "rules.json");
    const rulesContent = fs.readFileSync(rulesPath, "utf8");
    const rules = JSON.parse(rulesContent) as { marketId: number; rule: string }[];

    // Convert to map: { marketId: rule }
    return rules.reduce((map: Record<number, string>, rule) => {
      map[rule.marketId] = rule.rule;
      return map;
    }, {});
  } catch (error) {
    console.error("Failed to load rules.json:", error);
    return {};
  }
};