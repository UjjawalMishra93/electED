import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { useQuery } from '@tanstack/react-query';
import type { ElectionFact } from '@/types';
import { db } from '@/services/firebase';

const FACTS_COLLECTION = 'election_facts';

export async function fetchElectionFacts(): Promise<ElectionFact[]> {
  const factsQuery = query(
    collection(db, FACTS_COLLECTION),
    orderBy('lastUpdated', 'desc'),
    limit(4),
  );

  const snapshot = await getDocs(factsQuery);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ElectionFact, 'id'>),
  }));
}

export function useElectionFacts() {
  return useQuery<ElectionFact[], Error>(['electionFacts'], fetchElectionFacts, {
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 15,
  });
}
