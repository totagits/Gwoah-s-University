/**
 * Administrator-facing evidence export for the 19-degree website acceptance.
 * Database publication flags alone do not prove that a real browser can play
 * a video or that HIAU has approved the underlying degree information.
 */
export type DegreeVideoAuditSlot={
 slot:string;label:string;defaultSrc:string;publicSrc:string;
 defaultAvailable?:boolean;publicAvailable?:boolean;mediaSource?:string;published?:string;draft?:string;version:number;
};
const escapeCsv=(value:string|number|boolean)=>{
 const raw=String(value);
 // Defend administrators who subsequently open CSV in Excel/Sheets from
 // spreadsheet-formula injection in user-authored video labels.
 const safe=/^[\s\t\r\n]*[=+@-]/.test(raw)?"'"+raw:raw;
 return '"'+safe.replace(/"/g,'""')+'"';
};
export function createDegreeVideoAuditCsv(videos:DegreeVideoAuditSlot[]){
 const rows=[
  ['Program','College key','Media slot','Default video on server','Replacement published',
   'Private draft','Public video source available','Media integrity/source','Public media URL','Bundled media source',
   'Public playback checked','CMS upload/replace/delete checked','Caption/thumbnail checked',
   'Mobile playback checked','Official program information verified','Reviewer','Review date','Notes'],
  ...videos.filter(v=>!v.slot.startsWith('hero-')).sort((a,b)=>a.label.localeCompare(b.label))
  .map(v=>[
   v.label,v.slot.split('--')[0],v.slot,
   v.defaultAvailable===true?'Yes':v.defaultAvailable===false?'No':'Unverified',
   v.published?'Yes':'No',v.draft?'Yes':'No',
   v.publicAvailable===true?'Yes':v.publicAvailable===false?'No':'Unverified',
   v.mediaSource||'Unverified',
   v.publicSrc,v.defaultSrc||'None',
   'Not tested','Not tested','Not tested','Not tested','Not verified','','',''
  ])
 ];
 return '\uFEFF'+rows.map(cells=>cells.map(escapeCsv).join(',')).join('\r\n')+'\r\n';
}
