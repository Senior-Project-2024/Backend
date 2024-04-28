
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

  static unixToDate(unix: bigint): Date {
    return new Date(Number(unix) * 1000); 
  }

  static numberMonthToFullMonth(monthNumber : number) : string{
    if(monthNumber === 0)
      return "January"
    else if(monthNumber === 1)
      return "February"
    else if(monthNumber === 2)
      return "March"
    else if(monthNumber === 3)
      return "April"
    else if(monthNumber === 4)
      return "May"
    else if(monthNumber === 5)
      return "June"
    else if(monthNumber === 6)
      return "July"
    else if(monthNumber === 7)
      return "August"
    else if(monthNumber === 8)
      return "September"
    else if(monthNumber === 9)
      return "October"
    else if(monthNumber === 10)
      return "November"
    else if(monthNumber === 11)
      return "December"
    return "Can not find"
    
  }

  static unixToDateString(unix: number) : string{
    const date : Date = new Date(this.unixToMillisec(unix));

    const year : number = date.getFullYear();
    const month : number = date.getMonth();
    // transform month to fullmonth
    const fullMonth : string = this.numberMonthToFullMonth(month);
    const day : number = date.getDate();
    
    return `${day} ${fullMonth} ${year}`

  }

}
