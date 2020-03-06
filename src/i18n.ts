class Locale {
  altTip?: string;
  floatLeft?: string;
  floatRight?: string;
  center?: string;
  restore?: string;
}
class I18n {
  config: Locale;
  constructor(config: Locale) {
    this.config = { ...defaultLocale, ...config };
  }
  findLabel(key: string): string | null {
    if (this.config) {
      return Reflect.get(this.config, key);
    }
    return null;
  }
}

const defaultLocale: Locale = {
  altTip: "按照alt键比例缩放",
  floatLeft: "靠左",
  floatRight: "靠右",
  center: "居中",
  restore: "还原"
};
export { I18n, Locale, defaultLocale };
