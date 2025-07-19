const validator = {
  isRequired: (value) => {
    if (value) return true;
    return "O campo é obrigatório";
  },
  isMathcing: (value, match) => {
    if (value === match) return true;
    return 'Os valores não coincidem'
  },
}

export default validator
