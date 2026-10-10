import { useEffect, useMemo, useState } from 'react';
import { Check, GitBranch, Plus, RotateCcw, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/useToast';
import {
  DEFAULT_ROUTE_NETWORK,
  checkCampusRouteNetwork,
  getCampusRouteNetwork,
  saveCampusRouteNetwork,
  type CampusRouteNetwork,
} from '@/data/amritaCampus/routeNetwork';

interface PublishedRouteVersion {
  id: string;
  version: number;
  created_at: string;
  network: CampusRouteNetwork;
}

/** Admin-only route graph editor. Cache a published graph only after Supabase
 * confirms the version was saved. */
export function AdminRouteEditor() {
  const toast = useToast();
  const [network, setNetwork] = useState<CampusRouteNetwork>(() => getCampusRouteNetwork());
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastCheck, setLastCheck] = useState<{ checks: number; failures: string[] } | null>(null);
  const [history, setHistory] = useState<PublishedRouteVersion[]>([]);

  useEffect(() => {
    if (!supabase) return;
    void (async () => {
      const { data } = await supabase
        .from('campus_route_versions')
        .select('id, version, created_at, network')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(8);
      setHistory((data as PublishedRouteVersion[]) ?? []);
    })();
  }, []);

  const nodeOptions = useMemo(
    () => network.nodes.map((point, index) => ({ index, label: `${index} · ${point[0].toFixed(1)}, ${point[1].toFixed(1)}` })),
    [network.nodes],
  );

  const addEdge = () => {
    const a = Number(from);
    const b = Number(to);
    if (from === '' || to === '' || !Number.isInteger(a) || !Number.isInteger(b) || a === b || a < 0 || b < 0 || a >= network.nodes.length || b >= network.nodes.length) {
      toast.error('Invalid route connection', 'Choose two different campus nodes.');
      return;
    }
    const exists = network.edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
    if (exists) {
      toast.info('Connection already exists');
      return;
    }
    setNetwork((current) => ({ ...current, edges: [...current.edges, [a, b]], version: current.version + 1 }));
    setLastCheck(null);
    setFrom('');
    setTo('');
  };

  const removeEdge = (index: number) => {
    setNetwork((current) => ({ ...current, edges: current.edges.filter((_, edgeIndex) => edgeIndex !== index), version: current.version + 1 }));
    setLastCheck(null);
  };

  const reset = () => {
    setNetwork({ ...DEFAULT_ROUTE_NETWORK, version: network.version + 1 });
    setLastCheck(null);
    toast.info('Route draft reset', 'The campus baseline is ready to test and publish.');
  };

  const publish = async () => {
    const check = checkCampusRouteNetwork(network);
    setLastCheck(check);
    if (check.failures.length) {
      toast.error('Route checks failed', check.failures.slice(0, 2).join(' '));
      return;
    }
    setSaving(true);
    try {
      if (!supabase) throw new Error('Supabase must be configured to publish routes.');
      const { data, error } = await supabase.from('campus_route_versions')
        .insert({ version: network.version, network, published: true })
        .select('id, version, created_at, network').single();
      if (error) throw error;
      setHistory((current) => [data as PublishedRouteVersion, ...current].slice(0, 8));
      saveCampusRouteNetwork(network);
      toast.success('Routes published', 'Reload the Campus Map to use the new permanent connections.');
    } catch (error) {
      toast.error('Could not publish routes', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setSaving(false);
    }
  };

  const loadVersionAsDraft = (version: PublishedRouteVersion) => {
    setNetwork({
      nodes: version.network.nodes,
      edges: version.network.edges,
      pois: version.network.pois,
      version: Math.max(network.version + 1, version.network.version + 1),
    });
    setLastCheck(null);
    toast.info('Previous route loaded', `Version ${version.version} is now a draft. Publish it to roll back.`);
  };

  return (
    <section className="mt-10 card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200/70 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
            <GitBranch className="h-5 w-5 text-[#A51636]" /> Campus route editor
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Add or remove permanent walking connections. Test the route in Campus Map after publishing.
          </p>
        </div>
        <span className="chip"><Check className="h-3.5 w-3.5 text-emerald-600" /> Draft v{network.version}</span>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Add connection</p>
          <select value={from} onChange={(event) => setFrom(event.target.value)} className="input-base">
            <option value="">From node…</option>
            {nodeOptions.map((node) => <option key={node.index} value={node.index}>{node.label}</option>)}
          </select>
          <select value={to} onChange={(event) => setTo(event.target.value)} className="input-base">
            <option value="">To node…</option>
            {nodeOptions.map((node) => <option key={node.index} value={node.index}>{node.label}</option>)}
          </select>
          <button onClick={addEdge} className="btn-primary w-full"><Plus className="h-4 w-4" /> Add connection</button>
          <div className="flex gap-2">
            <button onClick={reset} className="btn-secondary flex-1"><RotateCcw className="h-4 w-4" /> Reset</button>
            <button onClick={() => void publish()} disabled={saving} className="btn-primary flex-1"><Save className="h-4 w-4" /> {saving ? 'Publishing…' : 'Publish'}</button>
          </div>
          <button
            onClick={() => setLastCheck(checkCampusRouteNetwork(network))}
            className="btn-secondary w-full"
          >
            <Check className="h-4 w-4" /> Test all saved routes
          </button>
          {lastCheck ? (
            <p className={`text-xs leading-relaxed ${lastCheck.failures.length ? 'text-rose-600' : 'text-emerald-600'}`}>
              {lastCheck.failures.length
                ? `${lastCheck.failures.length} route check(s) failed.`
                : `All ${lastCheck.checks} point-to-point route checks passed.`}
            </p>
          ) : null}
        </div>

        <div className="max-h-72 overflow-auto rounded-xl border border-slate-200 dark:border-white/10">
          <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 text-xs font-bold dark:border-white/10 dark:bg-slate-900">
            <span>{network.edges.length} connections</span>
            <span className="text-slate-400">Undirected walking graph</span>
          </div>
          {network.edges.map(([a, b], index) => (
            <div key={`${a}-${b}-${index}`} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-xs last:border-0 dark:border-white/5">
              <span><strong>{a}</strong> ↔ <strong>{b}</strong></span>
              <button onClick={() => removeEdge(index)} aria-label={`Remove connection ${a} to ${b}`} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      </div>
      {history.length ? (
        <div className="border-t border-slate-200/70 p-5 dark:border-white/10">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Published versions · rollback</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {history.map((version) => (
              <button
                key={version.id}
                type="button"
                onClick={() => loadVersionAsDraft(version)}
                className="rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-[#A51636]/40 hover:bg-[#A51636]/5 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <span className="block text-xs font-bold text-slate-800 dark:text-white">Version {version.version}</span>
                <span className="mt-1 block text-[10px] text-slate-400">{new Date(version.created_at).toLocaleString('en-IN')}</span>
                <span className="mt-2 block text-[10px] font-bold text-[#A51636]">Use as rollback draft →</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
