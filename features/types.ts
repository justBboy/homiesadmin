export type FoodType = {
  name: string;
  price: number;
  img: string;
};

export type userType = {
  uid: string;
  email: string;
  username: string;
  phone: string;
  superadmin?: boolean;
  admin?: boolean;
};

export type categoryType = {
  id: string;
  imgURL: string;
  name: string;
};

export enum foodAvailable {
  true,
  false,
}
