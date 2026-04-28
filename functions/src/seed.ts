/**
 * Firestore Seed Script — Election Facts for RAG Knowledge Base
 * Run with: npx ts-node src/seed.ts
 *
 * Populates the `election_facts` collection with authoritative civic content.
 */
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Initialize with service account if available; otherwise use default credentials
const serviceAccountPath = path.resolve(__dirname, '../../serviceAccount.json');
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
  admin.initializeApp(); // Uses GOOGLE_APPLICATION_CREDENTIALS env var
}

const db = admin.firestore();

interface ElectionFact {
  topic: string;
  content: string;
  source: string;
  sourceUrl: string;
  lastUpdated: admin.firestore.Timestamp;
  tags: string[];
}

const ELECTION_FACTS: Omit<ElectionFact, 'lastUpdated'>[] = [
  // ── Voter Registration ─────────────────────────────────────────────────────
  {
    topic: 'Voter Registration — Who Can Register',
    content:
      'To register to vote in the United States, you must be: (1) a US citizen (either by birth or naturalization), (2) at least 18 years old on or before Election Day (some states allow 17-year-olds to vote in primaries if they will be 18 by the general election), (3) a resident of the state where you are registering, and (4) not currently incarcerated for a felony conviction in most states (laws vary by state).',
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/voter-registration',
    tags: ['registration', 'voter-registration', 'general', 'eligibility'],
  },
  {
    topic: 'Voter Registration — How to Register',
    content:
      'There are three primary ways to register to vote: (1) Online — 40+ states and DC offer online registration at vote.gov or your state election website. (2) By mail — Download the National Voter Registration Form from vote.gov, complete it, and mail it to your local election office. (3) In person — Visit your local DMV, election office, library, or other government agency. Some states offer same-day registration (SDR) at polling places on Election Day.',
    source: 'Vote.gov',
    sourceUrl: 'https://vote.gov',
    tags: ['registration', 'voter-registration', 'how-to-vote'],
  },
  {
    topic: 'Voter Registration — Deadlines',
    content:
      "Registration deadlines vary by state and range from 30 days before Election Day to same-day registration. As of 2024, 22 states plus DC offer same-day voter registration. States like North Dakota have no voter registration requirement at all. Always check your state's specific deadline at vote.gov well in advance of the election.",
    source: 'Vote.gov',
    sourceUrl: 'https://vote.gov/register/deadlines/',
    tags: ['registration', 'voter-registration', 'deadlines'],
  },
  {
    topic: 'Voter Registration — Verification',
    content:
      'After registering, voters should verify their registration is active before Election Day. You can verify at vote.gov, your state election office website, or by calling your local election office. It is recommended to verify at least 2–4 weeks before Election Day to allow time to correct any issues.',
    source: 'Vote.gov',
    sourceUrl: 'https://vote.gov/confirm/',
    tags: ['registration', 'voter-registration', 'verification'],
  },

  // ── Electoral College ────────────────────────────────────────────────────────
  {
    topic: 'Electoral College — Overview',
    content:
      'The Electoral College is the system established by the US Constitution (Article II, Section 1) for electing the President and Vice President. There are 538 total electors, and a candidate must receive at least 270 electoral votes to win the presidency. The number of electors each state receives equals its total number of Congressional representatives (House seats + 2 Senate seats). Washington DC receives 3 electors under the 23rd Amendment.',
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/electoral-college',
    tags: ['electoral-college', 'electors', 'general'],
  },
  {
    topic: 'Electoral College — Winner-Take-All',
    content:
      '48 states and DC use a winner-take-all (unit rule) system where the presidential candidate who wins the popular vote in that state receives all of its electoral votes. Maine and Nebraska are exceptions — they use the congressional district method, where two electoral votes go to the statewide popular vote winner and one electoral vote is awarded for each congressional district winner.',
    source: 'National Archives',
    sourceUrl: 'https://www.archives.gov/electoral-college/faq',
    tags: ['electoral-college', 'electors', 'winner-take-all'],
  },
  {
    topic: 'Electoral College — Elector Process',
    content:
      'After the November general election, states certify their popular vote results. Electors (pledged to the winning candidate) meet in their state capitals in December to cast their electoral votes. Congress counts and certifies the electoral votes in a joint session on January 6 following the election. The President-elect is inaugurated on January 20.',
    source: 'National Archives',
    sourceUrl: 'https://www.archives.gov/electoral-college/provisions',
    tags: ['electoral-college', 'electors', 'process'],
  },

  // ── Voting Process ───────────────────────────────────────────────────────────
  {
    topic: 'How to Vote — On Election Day',
    content:
      'On Election Day (first Tuesday after the first Monday in November for federal elections), find your assigned polling place at vote.gov using your registered address. Bring required ID if your state requires it. Check in with poll workers, receive your ballot, mark your choices privately, and submit your ballot. Polls are open for at least 10 hours in most states.',
    source: 'Vote.gov',
    sourceUrl: 'https://vote.gov/how-to-vote/',
    tags: ['voting-process', 'how-to-vote', 'general'],
  },
  {
    topic: 'Absentee / Mail-In Voting',
    content:
      'Absentee voting (also called mail-in voting) lets voters cast ballots without going to a polling place. All 50 states allow absentee/mail-in voting, but rules vary: some states require a valid excuse (illness, disability, travel), while others allow no-excuse absentee voting. Five states — Colorado, Hawaii, Oregon, Utah, and Washington — conduct all elections entirely by mail. Request your absentee ballot well in advance; deadlines vary by state.',
    source: 'Vote.gov',
    sourceUrl: 'https://vote.gov/absentee-voting/',
    tags: ['absentee', 'mail-in', 'voting-process'],
  },
  {
    topic: 'Early In-Person Voting',
    content:
      'Many states offer early in-person voting before Election Day, allowing voters to cast ballots at designated locations (often election offices or early voting centers). As of 2024, 47 states plus DC offer some form of early in-person voting. The early voting period can range from 4 to 45 days before Election Day depending on the state.',
    source: 'NCSL',
    sourceUrl: 'https://www.ncsl.org/elections-and-campaigns/early-voting-in-state-elections',
    tags: ['voting-process', 'early-voting', 'how-to-vote'],
  },

  // ── Voter ID ─────────────────────────────────────────────────────────────────
  {
    topic: 'Voter ID Requirements',
    content:
      'Voter ID laws vary significantly by state. States are categorized as: (1) Strict photo ID — voters must present a government-issued photo ID or cast a provisional ballot (e.g., Georgia, Indiana). (2) Strict non-photo ID — photo ID not required but some form of ID is (e.g., Arizona). (3) Non-strict photo ID — acceptable IDs accepted but alternative options available (e.g., Wisconsin). (4) Non-strict non-photo ID — various non-photo IDs accepted. (5) No ID required — voters sign a poll book or provide signature. Check your state law at vote.gov before Election Day.',
    source: 'NCSL',
    sourceUrl: 'https://www.ncsl.org/elections-and-campaigns/voter-id',
    tags: ['voter-id', 'identification', 'voting-process'],
  },

  // ── Primary Elections ─────────────────────────────────────────────────────────
  {
    topic: 'Primary Elections — Overview',
    content:
      "A primary election is a preliminary election held before the main general election in which voters select their party's candidate for a given office. There are several types: (1) Closed primary — only registered party members can vote. (2) Open primary — any registered voter can participate regardless of party registration. (3) Semi-closed — registered party members vote in their party's primary; unaffiliated voters may choose a party primary. (4) Blanket/jungle primary — all candidates of all parties appear on one ballot; top two advance regardless of party.",
    source: 'Ballotpedia',
    sourceUrl: 'https://ballotpedia.org/Primary_elections_in_the_United_States',
    tags: ['primaries', 'caucus', 'primary-elections'],
  },
  {
    topic: 'Presidential Primaries and Caucuses',
    content:
      "Presidential primaries and caucuses are held in each state to select delegates who will represent a presidential candidate at the party's national convention. Primaries use secret-ballot voting; caucuses are public meetings where voters physically gather to express preferences. The Democratic and Republican parties hold national conventions in the summer of an election year to officially nominate their presidential candidates.",
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/primaries-caucuses',
    tags: ['primaries', 'caucus', 'primary-elections', 'presidential'],
  },

  // ── Election Results & Certification ──────────────────────────────────────────
  {
    topic: 'How Votes Are Counted',
    content:
      'After polls close, ballots are counted by local election officials. States use various methods: optical scan machines (most common), direct-recording electronic (DRE) machines, and hand counting in some jurisdictions. All states conduct post-election audits to verify accuracy. Results are unofficial until certified by state election authorities (usually 2–4 weeks after Election Day). All states have canvass procedures to review and certify results.',
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/election-results',
    tags: ['voting-process', 'vote-counting', 'election-results'],
  },

  // ── Constitutional Basis ───────────────────────────────────────────────────────
  {
    topic: 'Voting Rights — Constitutional Amendments',
    content:
      'The right to vote is protected by several Constitutional Amendments: (1) 15th Amendment (1870) — Cannot deny vote based on race, color, or previous servitude. (2) 19th Amendment (1920) — Cannot deny vote based on sex. (3) 24th Amendment (1964) — Prohibits poll taxes in federal elections. (4) 26th Amendment (1971) — Lowered voting age to 18. The Voting Rights Act of 1965 further prohibits discriminatory voting practices.',
    source: 'National Archives',
    sourceUrl: 'https://www.archives.gov/founding-docs/constitution',
    tags: ['rights-responsibilities', 'voting-rights', 'constitution'],
  },
  {
    topic: 'Voter Rights at the Polls',
    content:
      'US voters have important rights at polling places, including: the right to vote if you are in line when polls close, the right to a provisional ballot if your eligibility is questioned, the right to assistance (e.g., translation services) if you have limited English proficiency or a disability, the right to a private and independent ballot, and the right to report problems without fear of retaliation. If you believe your rights have been violated, contact your state election office or call the Election Protection Hotline: 1-866-OUR-VOTE.',
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/your-voting-rights',
    tags: ['rights-responsibilities', 'voting-rights', 'how-to-vote'],
  },

  // ── Federal vs State Elections ─────────────────────────────────────────────────
  {
    topic: 'Federal vs State Elections',
    content:
      'The US holds elections at federal, state, and local levels. Federal elections include the President (every 4 years), US Senators (6-year terms, 1/3 elected every 2 years), and US Representatives (2-year terms, all seats every 2 years). State elections include governors, state legislators, and other state officials. Local elections include mayors, city councils, school boards, and judges. All elections use a system administered primarily by state and local governments under federal guidelines.',
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/election-office',
    tags: ['general', 'federal-elections', 'state-elections'],
  },

  // ── General Knowledge ──────────────────────────────────────────────────────────
  {
    topic: 'Election Day — When Is It?',
    content:
      'For federal elections (presidential and congressional), Election Day is the first Tuesday after the first Monday in November. For 2024, Election Day was November 5. Presidential elections occur every 4 years (2024, 2028, etc.). Congressional midterm elections occur every 2 years (2026, 2030, etc.). State and local elections may be held on different dates set by each state.',
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/election-day',
    tags: ['general', 'election-day', 'how-to-vote'],
  },
  {
    topic: 'What is a Ballot?',
    content:
      "A ballot is the document (paper or electronic) used to cast your vote. A general election ballot may include: presidential and vice-presidential candidates, US Senate and House candidates, state and local candidates, and ballot measures or propositions (direct democracy questions voters decide). Voters should research all items on their ballot before Election Day using resources like their state's official voter guide or Ballotpedia.org.",
    source: 'Ballotpedia',
    sourceUrl: 'https://ballotpedia.org/Ballot',
    tags: ['general', 'voting-process', 'ballot'],
  },
  {
    topic: 'Provisional Ballots',
    content:
      "A provisional ballot is used when there is a question about a voter's eligibility at the polling place — for example, if the voter's name does not appear in the poll book, or if the voter does not have the required ID. Provisional ballots are set aside and counted after election officials verify the voter's eligibility, usually within 1–2 weeks after Election Day. Voters are given a receipt to track whether their provisional ballot was counted.",
    source: 'USA.gov',
    sourceUrl: 'https://www.usa.gov/provisional-ballot',
    tags: ['voting-process', 'provisional-ballot', 'voter-id'],
  },
];

async function seed(): Promise<void> {
  console.log('🌱 Starting Firestore seed for election_facts collection...');
  const collectionRef = db.collection('election_facts');
  const batch = db.batch();

  for (const fact of ELECTION_FACTS) {
    const docRef = collectionRef.doc(); // auto-generated ID
    const document: ElectionFact = {
      ...fact,
      lastUpdated: admin.firestore.Timestamp.now(),
    };
    batch.set(docRef, document);
  }

  await batch.commit();
  console.log(`✅ Seeded ${ELECTION_FACTS.length} election facts into Firestore.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
