export function extractDomain(url: string | undefined | null): string | null {
    if (!url) return null;
    try {
        return new URL(url).hostname || null;
    } catch {
        return null;
    }
}