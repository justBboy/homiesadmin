import axios from "../../libs/axios";

export const getUserWithToken = async (token: string) => {
  try {
    const res = await axios.get(`/auth/getUserWithToken?token=${token}`);
    const data = res.data;
    if (data.error) {
      throw data.error;
    }
    const user: any = data;
    return {
      email: user.email,
      phone: user.phoneNumber,
      username: user.displayName,
      disabled: user.disabled,
    };
  } catch (err) {
    console.log("getUserEmailToken =========> ", err);
    throw err;
  }
};

export const setPasswordApi = async (token: string, password: string) => {
  try {
    const d = { token, password };
    const res = await axios.post(`/auth/setPassword`, d);
    const data = res.data;
    if (data.error) throw data.error;
    return data.disabled;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
