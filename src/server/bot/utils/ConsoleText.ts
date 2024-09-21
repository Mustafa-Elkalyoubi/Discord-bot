const ESC = "\x1b[";

const Modifiers = {
  DEFAULT: "0m",
  BLACK: "30m",
  RED: "31m",
  GREEN: "32m",
  YELLOW: "33m",
  BLUE: "34m",
  MAGENTA: "35m",
  CYAN: "36m",
  LIGHT_GRAY: "37m",
  DARK_GRAY: "90m",
  LIGHT_RED: "91m",
  LIGHT_GREEN: "92m",
  LIGHT_YELLOW: "93m",
  LIGHT_BLUE: "94m",
  LIGHT_MAGENTA: "95m",
  LIGHT_CYAN: "96m",
  WHITE: "97m",
  UNDERLINE: "4m",
  NO_UNDERLIND: "24m",
  REVERSE: "7m",
  POSITIVE_TEXT: "27m",
};

Object.keys(Modifiers).forEach((key) => {
  Modifiers[key as keyof typeof Modifiers] = ESC + Modifiers[key as keyof typeof Modifiers];
});

export default Modifiers;
