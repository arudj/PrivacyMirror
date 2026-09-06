import type { FingerprintSignalType } from "@/types";

/**
 * Tourne en MAIN world (voir manifest.json: "world": "MAIN") = le vrai
 * contexte JS de la page. On patche les fonctions sensibles pour savoir
 * QUAND elles sont appelées, sans changer leur comportement (on rappelle
 * toujours la fonction originale). Pas de preuve qu'un fingerprint est
 * réellement construit : on note juste "signal accédé", comme prévu au MVP.
 *
 * Communication : postMessage vers scanner.ts (ISOLATED world), qui a lui
 * accès à chrome.runtime pour relayer au service worker.
 */

const reported = new Set<FingerprintSignalType>();

function report(signalType: FingerprintSignalType): void {
    if (reported.has(signalType)) return; // un seul signalement par type et par page
    reported.add(signalType);
    window.postMessage({ source: 'privacy-mirror', type: 'FINGERPRINTING_SIGNAL', signalType }, '*');
}

// --- Canvas ---
try {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args: Parameters<typeof originalToDataURL>) {
        report('canvas');
        return originalToDataURL.apply(this, args);
    };

    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (
        ...args: Parameters<typeof originalGetImageData>
    ) {
        report('canvas');
        return originalGetImageData.apply(this, args);
    };
} catch {
    // API absente sur ce navigateur : on ignore silencieusement.
}

// --- WebGL ---
try {
    const patchGetParameter = (proto: WebGLRenderingContext | WebGL2RenderingContext) => {
        const original = proto.getParameter;
        proto.getParameter = function (...args: Parameters<typeof original>) {
            report('webgl');
            return original.apply(this, args);
        };
    };
    if (window.WebGLRenderingContext) patchGetParameter(WebGLRenderingContext.prototype);
    if (window.WebGL2RenderingContext) patchGetParameter(WebGL2RenderingContext.prototype);
} catch {
    // ignore
}

// --- Audio fingerprinting ---
try {
    const patchAudioCtor = (name: 'AudioContext' | 'OfflineAudioContext') => {
        const Original = window[name];
        if (!Original) return;
        // On remplace le constructeur par un wrapper qui délègue à l'original.
        (window as unknown as Record<string, unknown>)[name] = new Proxy(Original, {
            construct(target, args) {
                report('audio');
                return Reflect.construct(target, args);
            },
        });
    };
    patchAudioCtor('AudioContext');
    patchAudioCtor('OfflineAudioContext');
} catch {
    // ignore
}

// --- Screen dimensions ---
// (corrigé : 'heigh' -> 'height', coquille qui désactivait silencieusement ce hook)
try {
    (['width', 'height', 'colorDepth', 'pixelDepth'] as const).forEach((prop) => {
        const descriptor = Object.getOwnPropertyDescriptor(Screen.prototype, prop);
        if (!descriptor?.get) return;
        Object.defineProperty(Screen.prototype, prop, {
            ...descriptor,
            get(this: Screen) {
                report('screen');
                return descriptor.get!.call(this);
            },
        });
    });
} catch {
    // ignore
}

// --- Timezone ---
try {
    const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function (
        ...args: Parameters<typeof originalResolvedOptions>
    ) {
        report('timezone');
        return originalResolvedOptions.apply(this, args);
    };

    const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
    Date.prototype.getTimezoneOffset = function () {
        report('timezone');
        return originalGetTimezoneOffset.call(this);
    };
} catch {
    // ignore
}

// --- Hardware concurrency / device memory ---
// Non-standard (deviceMemory) => on passe par un cast volontairement ici.
try {
  const navigatorProto = Navigator.prototype as unknown as Record<string, unknown>;
  (['hardwareConcurrency', 'deviceMemory'] as const).forEach((prop) => {
    const descriptor = Object.getOwnPropertyDescriptor(navigatorProto, prop);
    if (!descriptor?.get) return;
    Object.defineProperty(navigatorProto, prop, {
      ...descriptor,
      get(this: Navigator) {
        report(prop as FingerprintSignalType);
        return descriptor.get!.call(this);
      },
    });
  });
} catch {
  // ignore
}