const normalizer = {
  capitalize: (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  break: (string) => {
    const BREAK_LIMNIT = 40;
    if (string.length <= BREAK_LIMNIT) return string + '<br />' + '<br />';

    const breakIndex = string.lastIndexOf(' ', BREAK_LIMNIT);

    return breakIndex === -1
      ? string.slice(0, BREAK_LIMNIT) + '<br />' + string.slice(BREAK_LIMNIT)
      : string.slice(0, breakIndex) + '<br />' + string.slice(breakIndex + 1)
  },
}

export default normalizer
