#!/usr/bin/env node
// Immutable Git blob hashes measured directly from the user-supplied Google AI Studio ZIP.
// No secrets or user records are copied. Compares a checked-out main reference to staging.
// This is source parity only; it does not imply production functionality or server authorization.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const ORIGINAL_ZIP = `src/App.tsx 1117426389c1702ba96c978ba5e67dc1c8904851
src/components/portal/AcademicCalendarView.tsx c8595bbe27dab6eee6c98a2852b65c98a14c9eb5
src/components/portal/AcademicPeerMessagingModal.tsx 51c6ec68e87c4ae3cabca2adfc49fe87d9f0604c
src/components/portal/AcademicPlanningRegistration.tsx fd79c1e79df507f43e38d74976e8b5a3b81079d7
src/components/portal/AdmissionsReviewModule.tsx 0ea8ab06d13851f5e63736b578586012b53df1fa
src/components/portal/CampusFacilitiesFeedback.tsx 8de9666620fedbab57023219d9addf7d352f1159
src/components/portal/FacultyAdminDashboard.tsx 0e2ba0b3587c4410e5f1baf30f59f9335db47df8
src/components/portal/FinanceBursarModule.tsx 46c70f667e67cbfa1b3a1ba17c70476f0e079b7a
src/components/portal/IntegratedAnalyticsHub.tsx 525a140381a8824a0db0608d22b0f637dc36856f
src/components/portal/PolicyComplianceRegister.tsx 6c3bf0998993a92fee3549127228405568c876b5
src/components/portal/PortalHeader.tsx 46cb97f35a166ba22391e28a05db32409229617a
src/components/portal/PortalLoginModal.tsx 811dcb10c708a54eb31ac27db98d60b129ec8f1d
src/components/portal/PortalNotificationsPopover.tsx b277dbf9303a71fc3edb76bd15af1b25eddaca84
src/components/portal/PortalQuickActionsMenu.tsx b1215a9073afac68c8ca3bc3f3f6ce9d711a25cc
src/components/portal/PortalThemeSettingsModal.tsx 239cff9c748cb2cfa02690e450b2900147043e5b
src/components/portal/PrintableDocumentModal.tsx 640e3fd70d023506b4208a87125de4890d7de0de
src/components/portal/SharedResourceLibrary.tsx b0ee1e0b19e2675c62d9348052af4fdc0989c6cd
src/components/portal/StudentActivityTimeline.tsx daa9217e403f33b60d44859e47b65fe790956c2a
src/components/portal/StudentPortalView.tsx 12bfa281252880d3186ce577a6c6b1ae29bfc8bc
src/components/portal/StudentUnifiedSearchFilter.tsx 6889ffdf1ba0bbdbbfd9a7788a0591989f341015
src/components/portal/TaskManagementDashboard.tsx 5210f0e2f434bba1d2348f991d4cba5ef05e534a
src/components/portal/VirtualClassroomCollab.tsx b88c7302276cb6d9588718335d085c438f0e6723
src/components/public/PublicAbout.tsx 067fbbd48213f1aed5f1102d0841bda50846b9df
src/components/public/PublicAdmissions.tsx a812b894a902b44f7979ca7fe9ee57b9ae651dfe
src/components/public/PublicCalendar.tsx d4e6b996c9cf0202246e04b858f793ec9cb35627
src/components/public/PublicColleges.tsx e11e7d5737662e6acf09b01edb46a5f770c2f243
src/components/public/PublicDEI.tsx 85f3c50952cb64fd389089dea07ebf2c65785e89
src/components/public/PublicFooter.tsx 135f977c06ca619f41ba7d890ef14668385e0
src/components/public/PublicHero.tsx 3e8052bfa034bc247c1d7d8d321ef4eba69f7ac8
src/components/public/PublicLeaderProfile.tsx 32c8eddaf7a0c9737e2db675da1c1c362a953e5b
src/components/public/PublicNavbar.tsx 8ca920775c3c75a0e868c5469ee5dd8bf78fbce3
src/components/public/PublicVirtualTour.tsx e0fb1c18c3909097978cc5a4d8f19d888382cc3c
src/main.tsx c1d9f920661cb84283eeabccd6ac72fe4233460c`.trim().split('\n').map(row => {
  const [path, sha] = row.trim().split(' ');
  return { path, originalBlob: sha };
});
const referenceRoot = resolve(process.argv[2] || 'original-main');
const workingRoot = process.cwd();
const fileDigest = (root, path) => {
  const fullPath = resolve(root, path);
  if (!existsSync(fullPath)) return null;
  const contents = readFileSync(fullPath);
  return createHash('sha1').update(`blob ${contents.length}\0`).update(contents).digest('hex');
};
const rows = ORIGINAL_ZIP.map(({path, originalBlob}) => {
  const sourceMainBlob = fileDigest(referenceRoot, path);
  const stagingBlob = fileDigest(workingRoot, path);
  return {
    path, originalBlob, sourceMainBlob, stagingBlob,
    referenceMatchesZip: sourceMainBlob === originalBlob,
    classification: stagingBlob === null ? 'missing-in-staging' :
      stagingBlob === originalBlob ? 'identical-to-zip' : 'modified-in-staging'
  };
});
const output = {
  source: 'User-supplied Google AI Studio ZIP: gwoah\'s-university-erp-&-portal(1).zip',
  sourceMainRef: 'main (checkout at workflow run)',
  stagingRef: process.env.GITHUB_SHA || 'local-checkout',
  total: rows.length,
  originalMainMatchesZip: rows.every(x => x.referenceMatchesZip),
  identical: rows.filter(x => x.classification === 'identical-to-zip').length,
  modified: rows.filter(x => x.classification === 'modified-in-staging').length,
  missing: rows.filter(x => x.classification === 'missing-in-staging').length,
  rows
};
mkdirSync('artifacts', {recursive:true});
writeFileSync('artifacts/hiau-aistudio-parity.json', JSON.stringify(output,null,2)+'\n');
console.log('HIAU ZIP reference parity:');
console.log(JSON.stringify({total:output.total,originalMainMatchesZip:output.originalMainMatchesZip,identical:output.identical,modified:output.modified,missing:output.missing},null,2));
for (const row of rows) {
  console.log(`${row.referenceMatchesZip ? 'OK' : 'REFERENCE-DRIFT'} ${row.classification} ${row.path}`);
}
if (!output.originalMainMatchesZip) {
  console.error('Source main has changed from the provided ZIP. Review before integrating changes.');
  process.exitCode = 1;
}
