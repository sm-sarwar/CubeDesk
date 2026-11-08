import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/types/customer";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{c.email ?? "-"}</TableCell>
              <TableCell>{c.phone ?? "-"}</TableCell>
              <TableCell>
                {c.source ? <Badge variant="secondary">{c.source}</Badge> : "-"}
              </TableCell>
              <TableCell>
                {new Date(c.createdAt).toLocaleDateString("en-GB")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}