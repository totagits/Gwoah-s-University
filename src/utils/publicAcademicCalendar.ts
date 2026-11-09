/**
 * Dates are printed from the HIAU calendar without changing the institution's
 * schedule. This module only describes where today's date falls relative to each
 * listed window; it does not attest that an event actually took place.
 */
const MONTHS:Record<string,number>={
  Jan:1,Feb:2,Mar:3,Apr:4,May:5,Jun:6,
  Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12,
};
const utcDay=(year:number,month:number,day:number)=>Date.UTC(year,month-1,day);

export function parseAcademicDateWindow(input:string):{start:number;end:number}|null{
  const single=input.match(/^([A-Za-z]{3}) (\d{2}), (\d{4})$/);
  if(single){
    const month=MONTHS[single[1]],day=Number(single[2]),year=Number(single[3]);
    if(!month||day<1||day>31)return null;
    const point=utcDay(year,month,day);
    if(new Date(point).getUTCDate()!==day)return null;
    return {start:point,end:point};
  }
  const range=input.match(/^([A-Za-z]{3}) (\d{2}) - (?:(\w{3}) )?(\d{2}), (\d{4})$/);
  if(!range)return null;
  const startMonth=MONTHS[range[1]],endMonth=MONTHS[range[3]||range[1]];
  const startDay=Number(range[2]),endDay=Number(range[4]),year=Number(range[5]);
  if(!startMonth||!endMonth||startDay<1||startDay>31||endDay<1||endDay>31)return null;
  const start=utcDay(year,startMonth,startDay);
  const end=utcDay(year,endMonth,endDay);
  if(new Date(start).getUTCDate()!==startDay||new Date(end).getUTCDate()!==endDay||end<start)return null;
  return {start,end};
}

export function currentLiberiaDay(now:Date=new Date()):number{
  const date=new Intl.DateTimeFormat('en-CA',{
    timeZone:'Africa/Monrovia',year:'numeric',month:'2-digit',day:'2-digit',
  }).formatToParts(now);
  const get=(part:string)=>Number(date.find(p=>p.type===part)?.value);
  return utcDay(get('year'),get('month'),get('day'));
}

export function academicWindowStatus(window:string,today:number):'Date passed'|'Scheduled now'|'Upcoming'|'Date unverified'{
  const dates=parseAcademicDateWindow(window);
  if(!dates)return 'Date unverified';
  if(today>dates.end)return 'Date passed';
  if(today>=dates.start)return 'Scheduled now';
  return 'Upcoming';
}

export function academicTermStatus(events:{date:string}[],today:number):'Current term'|'Future term'|'Past term'|'Review calendar'{
  const dates=events.map(e=>parseAcademicDateWindow(e.date));
  if(dates.some(v=>!v)||!dates.length)return 'Review calendar';
  const first=Math.min(...dates.map(d=>d!.start));
  const last=Math.max(...dates.map(d=>d!.end));
  return today<first?'Future term':today>last?'Past term':'Current term';
}
