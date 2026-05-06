import si from 'systeminformation';

export interface RealNetwork {
  ssid: string;
  signalLevel: number; // dBm
  quality: number; // 0-100
  security: string;
  channel: number;
  frequency: number; // MHz
}

export async function scanRealNetworks(): Promise<RealNetwork[]> {
  try {
    const interfaces = await si.wifiInterfaces();
    if (!interfaces || interfaces.length === 0) return [];
    // Guard against missing iface property
    const iface = (interfaces[0] as any)?.iface;
    if (!iface) return [];
    const networks = await si.wifiNetworks(iface);
    if (!networks || networks.length === 0) return [];
    return networks.map((n: any) => {
      const security = Array.isArray(n.security) ? (n.security as string[]).join(', ') : (typeof n.security === 'string' ? n.security : 'OPEN');
      return {
        ssid: n.ssid ?? '',
        signalLevel: typeof n.signalLevel === 'number' ? n.signalLevel : -100,
        quality: typeof n.quality === 'number' ? n.quality : Math.min(100, Math.max(0, ((n.signalLevel ?? -100) + 100) * 2)),
        security,
        channel: typeof n.channel === 'number' ? n.channel : 0,
        frequency: typeof n.frequency === 'number' ? n.frequency : 0
      } as RealNetwork;
    });
  } catch (error) {
    console.error('WiFi scan failed:', error);
    return [];
  }
}
