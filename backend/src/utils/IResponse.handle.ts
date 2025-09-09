module.exports = (data: object, message: string, isValid: boolean) => {
  data = data || {};
  message = message || '';
  isValid = isValid == undefined ? true : isValid;

  return {
    data,
    message,
    isValid,
  };
};
