export default class CommentKeyGenerator {
  id = 0;

  get [Symbol.toPrimitive]() {
    return () => `#${this.id++}`;
  }

  get above() {
    return `#^${this.id++}`;
  }

  static render(str: string) {
    return str
      .replace(/"#[0-9]+": "(.*)"/g, "$1")
      .replace(/\n[\s]*"#\^[0-9]+": "(.*)"/g, " $1");
  }
}
