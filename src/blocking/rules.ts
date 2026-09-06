import { KNOWN_TRACKERS } from "@/data/trackers";

const RULE_ID_BASE = 1000;

const RT = chrome.declarativeNetRequest.ResourceType;
const BLOCKED_RESOURCE_TYPES: chrome.declarativeNetRequest.ResourceType[] = [
  RT.SCRIPT,
  RT.XMLHTTPREQUEST,
  RT.IMAGE,
  RT.SUB_FRAME,
  RT.PING,
  RT.MEDIA,
  RT.FONT,
  RT.OTHER,
];

function buildRulesForDomain(domainScope: string): chrome.declarativeNetRequest.Rule[] {
    return Object.keys(KNOWN_TRACKERS).map((trackerDomain, index) => ({
        id: RULE_ID_BASE + index,
        priority: 1,
        action: { type: 'block' as chrome.declarativeNetRequest.RuleActionType },
        condition: {
            urlFilter: `||${trackerDomain}^`,
            initiatorDomains: [domainScope],
            resourceTypes: BLOCKED_RESOURCE_TYPES,
        },
    }));
}

export async function enableProtection(domain: string): Promise<void> {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map((rule) => rule.id),
        addRules: buildRulesForDomain(domain),
    });
}

export async function disableProtection(): Promise<void> {
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existing.map((rule) => rule.id),
    });
}