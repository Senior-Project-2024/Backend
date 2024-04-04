
export class DateUtil {
  
  static addCurrentDateWithYMD(year: number, month: number, day: number): Date {
    const currentDate: Date = new Date();

    if( !this.validateYMD(year, month, day) ) {
      return null;
    }

    currentDate.setFullYear(currentDate.getFullYear() + year);
    currentDate.setMonth(currentDate.getMonth() + month);
    currentDate.setDate(currentDate.getDate() + day);

    return currentDate;
  } 

  static validateYMD(year: number, month: number, day: number): boolean {

    if(day < 0 || month < 0 || year < 0) {
      return false;
    }

    return true;
  }

}