export type Duration = {
    years?: number;
    months?: number;
    weeks?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  };
  
  export type DurationType =
    | "year"
    | "month"
    | "payperiod"
    | "week"
    | "day"
    | "hour"
    | "minute"
    | "second";
  
  const refPayPeriodStart = new Date("2023-01-01");
  
  export function add(duration: Duration, date: Date | string | number): Date {
    const {
      years = 0,
      months = 0,
      weeks = 0,
      days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0,
    } = duration;
  
    const _date = new Date(date);
    _date.setFullYear(_date.getFullYear() + years);
    _date.setMonth(_date.getMonth() + months);
    _date.setDate(_date.getDate() + weeks * 7);
    _date.setDate(_date.getDate() + days);
    _date.setHours(_date.getHours() + hours);
    _date.setMinutes(_date.getMinutes() + minutes);
    _date.setSeconds(_date.getSeconds() + seconds);
  
    return _date;
  }
  
  export function startOf(
    type: DurationType,
    date: Date | string | number
  ): Date {
    const _date = new Date(date);
  
    if (type === "week") {
      _date.setDate(_date.getDate() - _date.getDay());
      _date.setHours(0, 0, 0, 0);
      return _date;
    }
  
    if (type === "payperiod") {
      const diff =
        ((_date.valueOf() - refPayPeriodStart.valueOf()) /
          (24 * 60 * 60 * 1000)) %
        14;
      _date.setDate(_date.getDate() - diff + 1);
      _date.setHours(0, 0, 0, 0);
      return _date;
    }
  
    switch (type) {
      case "year":
        _date.setMonth(0);
      case "month":
        _date.setDate(1);
      case "day":
        _date.setHours(0);
      case "hour":
        _date.setMinutes(0);
      case "minute":
        _date.setSeconds(0);
      case "second":
        _date.setMilliseconds(0);
        return _date;
      default:
        throw new Error(`Unrecognized type: ${type}`);
    }
  }
  
  export function endOf(type: DurationType, date: Date | string | number): Date {
    const _date = new Date(date);
  
    if (type === "week") {
      _date.setDate(_date.getDate() + 6 - _date.getDay());
      _date.setHours(23, 59, 59, 999);
      return _date;
    }
  
    if (type === "payperiod") {
      const diff =
        ((_date.valueOf() - refPayPeriodStart.valueOf()) /
          (24 * 60 * 60 * 1000)) %
        14;
      _date.setDate(_date.getDate() - diff + 14);
      _date.setHours(23, 59, 59, 999);
      return _date;
    }
  
    switch (type) {
      case "year":
        _date.setMonth(11);
      case "month":
        _date.setMonth(_date.getMonth() + 1, 0);
      case "day":
        _date.setHours(23);
      case "hour":
        _date.setMinutes(59);
      case "minute":
        _date.setSeconds(59);
      case "second":
        _date.setMilliseconds(999);
  
        return _date;
      default:
        throw new Error(`Unrecognized type: ${type}`);
    }
  }
  
  export function eachDurationFromInterval(
    duration: Duration,
    start: Date | string | number,
    end: Date | string | number
  ): Date[] {
    const result: Date[] = [];
  
    let currentDate = new Date(start);
    const endDate = new Date(end);
  
    while (currentDate <= endDate) {
      result.push(new Date(currentDate));
      currentDate = add(duration, currentDate);
    }
  
    return result;
  }
  
  export function isSame(
    type: DurationType,
    firstDate: Date | string | number,
    secondDate: Date | string | number
  ): boolean {
    const date1 = new Date(firstDate);
    const date2 = new Date(secondDate);
  
    switch (type) {
      case "year":
        return date1.getFullYear() === date2.getFullYear();
      case "month":
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth()
        );
      case "day":
        return (
          date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
        );
      case "payperiod":
        return isSame(
          "day",
          startOf("payperiod", date1),
          startOf("payperiod", date2)
        );
      case "week":
        return isSame("day", startOf("week", date1), startOf("week", date2));
      default:
        throw new Error(`Unrecognized type: ${type}`);
    }
  }
  
  export function parseDateOnly(dateString: string): Date {
    const [year, month, day] = dateString.slice(0, 10).split("-").map(Number);
    return new Date(year ?? 0, (month ?? 0) - 1, day);
  }
  
  export function toDateOnly(date: Date): string {
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
      const day = String(date.getDate()).padStart(2, "0");
  
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  }
  
  export function toTimeOnly(date: Date): string {
    try {
      const hours = date.getHours().toString().padStart(2, "0"); // Ensure 2 digits
      const minutes = date.getMinutes().toString().padStart(2, "0"); // Ensure 2 digits
  
      return `${hours}:${minutes}`;
    } catch (e) {
      return "";
    }
  }
  
  export function parseTime(time: string): Duration {
    const result = {} as Duration;
  
    const [hours, minutes, seconds] = time.split(":");
  
    if (hours) {
      result.hours = parseInt(hours);
    }
    if (minutes) {
      result.minutes = parseInt(minutes);
    }
    if (seconds) {
      result.seconds = parseInt(seconds);
    }
  
    return result;
  }
  