"use client";
import { EditCustomerSheet } from "./edit-customer-sheet";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  capitalize,
  formatTaka,
  normalizeDivision,
  sourceBadgeClass,
  whatsappLink,
} from "@/lib/customers";
import { CHANNELS, DIVISIONS } from "@/lib/validations/customer";
import type { CustomerRow } from "@/types/customer";
import { AddCustomerSheet } from "./add-customer-sheet";
import { CustomerDetailsSheet } from "./customer-details-sheet";
import { WhatsAppIcon } from "./whatsapp-icon";

const selectClass =
  "h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function CustomersView({ rows }: { rows: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [channel, setChannel] = useState("");
  const [division, setDivision] = useState("");
  const [dueFilter, setDueFilter] = useState<"" | "due" | "clear">("");

  // Details panel
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const selected = rows.find((r) => r.id === selectedId) ?? null;
  const [editId, setEditId] = useState<number | null>(null);
const [editOpen, setEditOpen] = useState(false);
const editing = rows.find((r) => r.id === editId) ?? null;

function startEdit() {
  setDetailsOpen(false);   
  setEditId(selectedId);
  setEditOpen(true);
}

  function openDetails(id: number) {
    setSelectedId(id);
    setDetailsOpen(true);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (q && !r.name.toLowerCase().includes(q) && !r.phone.includes(q)) {
        return false;
      }
      if (channel && r.source?.toLowerCase() !== channel) return false;
      if (
        division &&
        normalizeDivision(r.division) !== normalizeDivision(division)
      ) {
        return false;
      }
      if (dueFilter === "due" && r.due <= 0) return false;
      if (dueFilter === "clear" && r.due > 0) return false;
      return true;
    });
  }, [rows, search, channel, division, dueFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            {rows.length} people who have bought from you online
          </p>
        </div>
        <AddCustomerSheet />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <Input
          placeholder="Search by name or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 flex-1"
        />

        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className={selectClass}
        >
          <option value="">All channels</option>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {capitalize(c)}
            </option>
          ))}
        </select>

        <select
          value={division}
          onChange={(e) => setDivision(e.target.value)}
          className={selectClass}
        >
          <option value="">All divisions</option>
          {DIVISIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <select
          value={dueFilter}
          onChange={(e) => setDueFilter(e.target.value as "" | "due" | "clear")}
          className={selectClass}
        >
          <option value="">All customers</option>
          <option value="due">With due</option>
          <option value="clear">No due</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {[
                "Name",
                "Phone",
                "Division",
                "Channel",
                "Orders",
                "Total spent",
                "Due",
                "",
              ].map((h, i) => (
                <TableHead
                  key={i}
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r) => (
                <TableRow
                  key={r.id}
                  className="h-14 cursor-pointer"
                  tabIndex={0}
                  onClick={() => openDetails(r.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") openDetails(r.id);
                  }}
                >
                  <TableCell className="font-semibold">{r.name}</TableCell>

                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {r.phone}
                  </TableCell>

                  <TableCell>{r.division ?? "-"}</TableCell>

                  <TableCell>
                    {r.source ? (
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sourceBadgeClass(
                          r.source
                        )}`}
                      >
                        {capitalize(r.source)}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>

                  <TableCell>{r.ordersCount}</TableCell>

                  <TableCell className="font-mono font-medium">
                    {formatTaka(r.totalSpent)}
                  </TableCell>

                  <TableCell className="font-mono font-medium">
                    {r.due > 0 ? (
                      <span className="text-[#E0663E]">{formatTaka(r.due)}</span>
                    ) : (
                      <span className="text-muted-foreground">–</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <a
                      href={whatsappLink(r.phone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${r.name}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex size-9 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] transition hover:bg-[#25D366] hover:text-white"
                    >
                      <WhatsAppIcon className="size-[18px]" />
                    </a>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CustomerDetailsSheet
  customer={selected}
  open={detailsOpen}
  onOpenChange={setDetailsOpen}
  onEdit={startEdit}
  onDeleted={() => setDetailsOpen(false)}
/>

<EditCustomerSheet
  customer={editing}
  open={editOpen}
  onOpenChange={setEditOpen}
/>
    </div>
  );
}