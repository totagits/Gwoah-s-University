import type {LeaderProfile} from './leadershipData';

export interface PublicStaffEntry {
  id:string;name:string;title:string;category:'executive'|'trustee'|'faculty';
  biography:string;image:string;
}
export const isPublicStaffEntry=(p:unknown):p is PublicStaffEntry=>{
  if(!p||typeof p!=='object')return false;
  const x=p as Partial<PublicStaffEntry>;
  return typeof x.id==='string'&&/^staff-[a-f0-9-]{36}$/.test(x.id)&&
    typeof x.name==='string'&&x.name.length>=2&&
    typeof x.title==='string'&&x.title.length>=2&&
    typeof x.biography==='string'&&x.biography.length>=20&&
    ['executive','trustee','faculty'].includes(x.category||'')&&
    typeof x.image==='string'&&x.image.startsWith('/api/public/staff/'+x.id+'/photo');
};
export const publicStaffAsLeader=(p:PublicStaffEntry):LeaderProfile=>({
  id:p.id,slug:p.id,bannerTitle:p.title,breadcrumb:p.title,name:p.name,
  subtitle:p.title,paragraphs:[p.biography],image:p.image,
  category:p.category,roleBadge:p.title,
});
