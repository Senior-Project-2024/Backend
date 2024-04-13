import { Injectable } from "@nestjs/common";
import { 
  ValidatorConstraint, 
  ValidatorConstraintInterface, 
  ValidationArguments
} from "class-validator";

@Injectable()
@ValidatorConstraint({ name: 'isThaiLandlineNumber', async: false })
export class IsThaiLandlineNumber implements ValidatorConstraintInterface {

  validate(value: string, validationArguments?: ValidationArguments): boolean | Promise<boolean> {
      const thaiLandlineNumberPattern = /^0\d{1,2}\d{7}$/;
      return thaiLandlineNumberPattern.test(value);
  }

}