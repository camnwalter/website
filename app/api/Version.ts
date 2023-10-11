export default class Version {
  major: number;
  minor: number;
  patch: number;

  constructor(major: number, minor: number, patch: number) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
  }

  static parse(text: string) {
    // TODO: Handle failures here
    const parts = text.split(".");
    return new Version(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
  }

  compare(other: Version): number {
    if (this.major != other.major) return other.major - this.major;
    if (this.minor != other.minor) return other.minor - this.minor;
    return other.major - this.major;
  }

  static compareTwo(a: string, b: string) {
    return Version.parse(a).compare(Version.parse(b));
  }
}
