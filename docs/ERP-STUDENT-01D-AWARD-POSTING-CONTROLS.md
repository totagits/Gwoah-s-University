# ERP-STUDENT-01D — Scholarship / Aid / Waiver Award Posting Controls

**Status:** Design specification only; actual award posting has NOT been implemented.  
**Parent:** [ERP-STUDENT-01 issue #96](https://github.com/totagits/Harvest-Intercontinental-American-University/issues/96).  
**Main program gate:** [19-degree website acceptance issue #93](https://github.com/totagits/Harvest-Intercontinental-American-University/issues/93).

## Separate the four distinct stages

1. **Application:** A linked, admitted student requests merit scholarship, need-based aid or tuition waiver with reason and amount. Already implemented via PR #103.
2. **Review:** Registrar checks academic/student eligibility and Finance reviews documented financial criteria. Already implemented as non-posting workflow in PR #103.
3. **Award authorization (NOT implemented):** Authorized scholarship committee/leadership decides coverage, funding source, academic term, caps, conditions and effective period. The person deciding cannot be the student or sole record preparer. Must record approving policy version and evidence.
4. **Account posting (NOT implemented):** Authorized Finance posts a distinct, immutable ledger adjustment referencing a specific posted invoice and award decision. It is NOT a payment and does NOT change source fee schedule.

## Authorization rules for the future award-posting feature

- Separate roles: applicant, academic reviewer, financial reviewer, scholarship/aid or university leadership approver, and Finance poster.
- Require two distinct human identities for award approval and posting; Super Admin cannot bypass the separation-of-duties gate by self-approving all stages.
- Store verified source of funds for scholarship and aid, budget ceiling, award period, type and eligible fee line items; do not assume institutional or donor funding exists.
- Hard stop if the university has not approved the eligibility policy, coverage rules, approval ceilings, scholarship budget or waiver eligibility.
- Store currency in integer minor units and distinguish percentage/amount, cap and term applicability. Do not infer exchange rates or fees.
- Ensure no award exceeds eligible remaining invoiced tuition; never turn a scholarship into a cash refund without a separately authorized refund process.
- Count existing awards, previous credits, reconciled payments and other adjustments before posting; disallow duplicate claim/reference and cap concurrent postings in one database transaction.
- Post a dedicated **assistance award adjustment** ledger record with a unique award ID, invoice, student, approved amount, funding/budget source, reviewer IDs, Finance posting ID, policy revision and timestamps. Never recycle add/drop credit notes for unrelated scholarships or aid.
- Every state transition is audited; amendments and reversals use new compensating entries rather than editing/deleting a historic financial posting.
- The student sees award pending/approved/posted distinctly; the financial statement changes **only after** Finance posting is committed.
- Notification and printable decision letter should avoid exposing need-based personal details to other students or public pages.

## End-to-end acceptance tests required

| Test | Expected result |
|---|---|
| Student submits award request | No invoice or account mutation |
| Registrar recommends request | No award posted |
| Bursar reviews request | No award posted |
| No approved institutional policy | 403/409, no account mutation |
| Same person attempts final award authorization and Finance posting | Rejected |
| Invalid funding source or over-budget award | Rejected without partial posting |
| Request exceeds eligible balance | Rejected or capped only per authorized policy |
| Duplicate/replayed POST | No duplicated financial credit |
| Simultaneous submissions | Serialized, bounded and auditable |
| Two authorized staff complete all approval steps | Exactly one award ledger entry and accurate balance |
| Student visits own statement | Only own approved/posting-visible records |
| Different student attempts to inspect request | Denied |
| Award reversed | Compensating entry, original audit intact |
| Snapshot/restore | Full award and approval chain recovered without duplicate charges |

## Institutional decisions needed before enabling posting

Document and approve the official scholarship/need-based aid policy, waivers allowed, funding source codes, eligible charges, maximum awards per term/student, approval limits, award renewal criteria, proration, deadlines, appeal process, handling of prior payments, and reversal policy.

Do not claim award posting is functional or launch a live award/waiver workflow until the full security and accounting acceptance suite passes in staging and the university approves the policies.

**Current parallel roadmap:** Maintain WEB-GATE-02 19/19 degree video/page acceptance as the primary track. This specification prepares ERP-STUDENT-01D without altering finances or diverting from website completion.
