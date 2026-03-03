import { DetectedIntent, LinkedCluster, LinkType } from '../../types/suggestions';

let clusterIdCounter = 0;
const newClusterId = () => `cluster_${Date.now()}_${clusterIdCounter++}`;

export function linkIntentsAcrossChats(intents: DetectedIntent[]): LinkedCluster[] {
  if (intents.length === 0) return [];

  const clusters: LinkedCluster[] = [];
  const usedIntentIds = new Set<string>();

  // Pass 1: Group by shared date
  const dateClusters = groupBySharedDate(intents);
  for (const cluster of dateClusters) {
    cluster.intents.forEach(i => usedIntentIds.add(i.sourceMessageId));
    clusters.push(cluster);
  }

  // Pass 2: Group location requests
  const locationClusters = groupLocationRequests(
    intents.filter(i => !usedIntentIds.has(i.sourceMessageId))
  );
  for (const cluster of locationClusters) {
    cluster.intents.forEach(i => usedIntentIds.add(i.sourceMessageId));
    clusters.push(cluster);
  }

  // Pass 3: Remaining intents become solo clusters
  const remaining = intents.filter(i => !usedIntentIds.has(i.sourceMessageId));
  for (const intent of remaining) {
    clusters.push(makeSoloCluster(intent));
  }

  return clusters.sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority]);
}

function groupBySharedDate(intents: DetectedIntent[]): LinkedCluster[] {
  const dateMap = new Map<string, DetectedIntent[]>();

  for (const intent of intents) {
    const dates = intent.extractedEntities.dates || [];
    for (const date of dates) {
      const key = date.toLowerCase();
      if (!dateMap.has(key)) dateMap.set(key, []);
      dateMap.get(key)!.push(intent);
    }
  }

  const clusters: LinkedCluster[] = [];
  for (const [date, groupIntents] of dateMap.entries()) {
    const uniqueChats = new Set(groupIntents.map(i => i.sourceChatId));
    if (uniqueChats.size < 2) continue;

    clusters.push({
      id: newClusterId(),
      linkType: 'same_date',
      intents: deduplicateIntents(groupIntents),
      sharedEntities: { dates: [date] },
      conflictDetected: groupIntents.length >= 2,
      priority: groupIntents.length >= 3 ? 'urgent' : 'high',
      createdAt: new Date(),
    });
  }

  return clusters;
}

function groupLocationRequests(intents: DetectedIntent[]): LinkedCluster[] {
  const locationIntents = intents.filter(i => i.type === 'location_request');
  if (locationIntents.length === 0) return [];

  if (locationIntents.length >= 2) {
    return [{
      id: newClusterId(),
      linkType: 'location_context',
      intents: locationIntents,
      sharedEntities: {},
      conflictDetected: false,
      priority: 'high',
      createdAt: new Date(),
    }];
  }

  return locationIntents.map(i => ({
    id: newClusterId(),
    linkType: 'location_context' as LinkType,
    intents: [i],
    sharedEntities: {},
    conflictDetected: false,
    priority: 'medium' as const,
    createdAt: new Date(),
  }));
}

function makeSoloCluster(intent: DetectedIntent): LinkedCluster {
  const priority =
    intent.type === 'urgent_response' ? 'urgent'
    : intent.confidence >= 0.7 ? 'high'
    : 'medium';

  return {
    id: newClusterId(),
    linkType: 'same_topic',
    intents: [intent],
    sharedEntities: intent.extractedEntities,
    conflictDetected: false,
    priority,
    createdAt: new Date(),
  };
}

function deduplicateIntents(intents: DetectedIntent[]): DetectedIntent[] {
  const seen = new Set<string>();
  return intents.filter(i => {
    if (seen.has(i.sourceMessageId)) return false;
    seen.add(i.sourceMessageId);
    return true;
  });
}

const PRIORITY_WEIGHT: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
