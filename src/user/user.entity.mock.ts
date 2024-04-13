import { UserRole } from "./user.constant";
import { User } from "./user.entity";

export const userMock1: User = {
  id: '1',
  email: "tyzaza13@mail.com",
  password: "party",
  fName: "Sorathorn",
  lName: "Kaewchotchuangkul",
  telNo: "0646498841",
  organizeName: "Udemy",
  landlineNumber: "022222222",
  role: UserRole.organization,
  keyStoreJsonV3: null,
  tokenApi: "", 
  hashCode: "", 
  isConfirm: false,
}