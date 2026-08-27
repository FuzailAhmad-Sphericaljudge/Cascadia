import { useQuery } from "@tanstack/react-query";
import { Filter, LockKeyhole, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "../api";
import { ErrorState, Loading, PageHeading, time } from "../components/Ui";

export function EvidencePage() {
  const events = useQuery({ queryKey: ["audit-events"], queryFn: api.auditEvents }); const [search, setSearch] = useState(""); const [type, setType] = useState("all");
  const types = useMemo(() => [...new Set(events.data?.map((event) => event.eventType) ?? [])].sort(), [events.data]);
  const visible = useMemo(() => (events.data ?? []).filter((event) => (type === "all" || event.eventType === type) && `${event.eventType} ${event.resourceType} ${event.resourceId}`.toLowerCase().includes(search.toLowerCase())), [events.data, search, type]);
  if (events.isLoading) return <Loading label="Reading append-only evidence" />; if (events.error) return <ErrorState error={events.error} />;
  return <><PageHeading eyebrow="Phase 15 / evidence explorer" title="Audit evidence" copy="A read-only, tenant-scoped record of durable actions. Viewing evidence never creates new audit activity." />
    <section className="evidence-toolbar data-panel"><div><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search action or resource" /></div><label><Filter size={14} /><select value={type} onChange={(event) => setType(event.target.value)}><option value="all">All actions</option>{types.map((entry) => <option key={entry} value={entry}>{entry}</option>)}</select></label><span><LockKeyhole size={14} /> Append-only / {visible.length} shown</span></section>
    <section className="data-panel evidence-list"><header><div><span className="panel-label">UTC record</span><h2>Operational history</h2></div></header>{visible.map((event) => <article key={event.id}><time>{time(event.occurredAt)}</time><div><b>{event.eventType.replaceAll(".", " / ").replaceAll("_", " ")}</b><p>{event.resourceType} · <span className="mono">{event.resourceId}</span>{event.actorUserId ? ` · actor ${event.actorUserId.slice(0, 8)}` : " · system-originated"}</p></div><span>{Object.keys(event.metadata).length ? `${Object.keys(event.metadata).length} evidence fields` : "No metadata"}</span></article>)}{!visible.length && <p className="empty-copy">No matching audit evidence is stored for this organization.</p>}</section>
  </>;
}
