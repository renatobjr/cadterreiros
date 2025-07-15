const validator = {
  isRequired: (value) => {
    if (value) return true;
    return "O campo é obrigatório";
  }
}

export default validator
