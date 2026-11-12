import React from 'react';
import {Smartphone} from 'lucide-react';
/** Public-site affordance advertises the Student App only.
 * Staff ERP installation is distributed through authorized university channels
 * at the separate /staff/ entry route; no staff login appears on public pages.
 */
export const PublicInstallApp:React.FC=()=>(
 <a href="/student/" title="Open HIAU Student App installation and sign-in"
   className="inline-flex shrink-0 items-center gap-1 rounded-md border border-purple-200 bg-white px-2 py-2 text-xs font-bold text-[#4A1249] hover:border-[#4A1249] focus-visible:outline-2">
   <Smartphone className="h-4 w-4"/><span className="hidden md:inline">Student App</span>
   <span className="sr-only md:hidden">HIAU Student App</span>
 </a>
);
