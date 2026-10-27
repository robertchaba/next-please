import { version } from '../../package.json';
import { translations, type Locale } from '../i18n';

/** Package metadata is the sole source of the displayed release number. */
export const GAME_VERSION = version;

// Keep the fixed dictionary order and modulus: changing them renames old releases.
const CODENAME_COUNT = 17;

/** Polynomial hash of every character, including patch and any SemVer suffix. */
export function releaseCodenameIndex(releaseVersion: string): number {
  let index = 0;
  for (const character of releaseVersion) {
    index = (31 * index + character.charCodeAt(0)) % CODENAME_COUNT;
  }
  return index;
}

export function releaseLabel(locale: Locale, releaseVersion = GAME_VERSION): string {
  const copy = translations[locale];
  return copy.build
    .replace('{version}', releaseVersion)
    .replace('{codename}', copy.releaseCodenames[releaseCodenameIndex(releaseVersion)]);
}
