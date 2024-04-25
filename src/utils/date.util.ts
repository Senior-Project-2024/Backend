
export class DateUtil {
  
  static addCurrentDateWithYMDInDate(year: number, month: number, day: number): Date {
    const currentDate: Date = new Date();

    if( !this.validateYMD(year, month, day) ) {
      return null;
    }

    currentDate.setFullYear(currentDate.getFullYear() + year);
    currentDate.setMonth(currentDate.getMonth() + month);
    currentDate.setDate(currentDate.getDate() + day);

    return currentDate;
  } 

  static addCurrentDateWithYMDInMillisecs(year: number, month: number, day: number): number {
    const currentDate: Date = new Date();

    if( !this.validateYMD(year, month, day) ) {
      return null;
    }

    currentDate.setFullYear(currentDate.getFullYear() + year);
    currentDate.setMonth(currentDate.getMonth() + month);
    currentDate.setDate(currentDate.getDate() + day);

    return currentDate.getTime();
  } 

  static millisecToUnix(millsecs: number): number{
    return Math.round(millsecs/1000);
  }

  static unixToMillisec(unix: number): number{
    return Math.round(unix * 1000);
  } 

  static currentUnixTime(): number {
    return Math.round(Date.now()/1000);
  }

  static validateYMD(year: number, month: number, day: number): boolean {

    if(day < 0 || month < 0 || year < 0) {
      return false;
    }

    return true;
  }

}
