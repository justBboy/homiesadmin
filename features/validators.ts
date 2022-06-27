export const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
export const phoneNumberPattern = /^[0]?\d{9}$/;
export const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

export const validateEmail = (email: string) => {
  let error = "";
  if (!email || !emailPattern.test(email))
    error = "Email pattern incorrect, *@*.* should be the right pattern";
  return error;
};

export const validatePhone = (phone: string) => {
  let error = "";
  if (!phone || !phoneNumberPattern.test(phone))
    error = "Phone Number pattern incorrect";
  return error;
};

export const validatePassword = (password: string) => {
  let noError = true;
  if (!password || !passwordPattern.test(password)) return (noError = false);

  return noError;
};
