import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const applicants = [
  {
    id: "APP-001",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    amount: "$125,000",
    score: 742,
    risk: "low",
    status: "approved",
    date: "2024-01-15",
  },
  {
    id: "APP-002",
    name: "Michael Chen",
    email: "m.chen@company.io",
    amount: "$85,000",
    score: 698,
    risk: "medium",
    status: "pending",
    date: "2024-01-14",
  },
  {
    id: "APP-003",
    name: "Emily Rodriguez",
    email: "emily.r@startup.com",
    amount: "$250,000",
    score: 621,
    risk: "medium",
    status: "under_review",
    date: "2024-01-14",
  },
  {
    id: "APP-004",
    name: "David Kim",
    email: "d.kim@business.net",
    amount: "$50,000",
    score: 785,
    risk: "low",
    status: "approved",
    date: "2024-01-13",
  },
  {
    id: "APP-005",
    name: "Jessica Martinez",
    email: "jess.m@corp.org",
    amount: "$175,000",
    score: 542,
    risk: "high",
    status: "declined",
    date: "2024-01-12",
  },
];

const getRiskBadgeVariant = (risk: string) => {
  switch (risk) {
    case "low":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100";
    case "medium":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-100";
    case "high":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-100";
    default:
      return "";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge variant="outline" className="border-emerald-500 text-emerald-600">Approved</Badge>;
    case "pending":
      return <Badge variant="outline" className="border-amber-500 text-amber-600">Pending</Badge>;
    case "under_review":
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Under Review</Badge>;
    case "declined":
      return <Badge variant="outline" className="border-red-500 text-red-600">Declined</Badge>;
    default:
      return null;
  }
};

export function ApplicantsTable() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b p-6">
        <div>
          <h3 className="text-lg font-semibold">Recent Applications</h3>
          <p className="text-sm text-muted-foreground">Review and manage loan applications</p>
        </div>
        <Button variant="outline" size="sm">
          View All
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Credit Score</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants.map((applicant) => (
            <TableRow key={applicant.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{applicant.name}</p>
                  <p className="text-sm text-muted-foreground">{applicant.email}</p>
                </div>
              </TableCell>
              <TableCell className="font-medium">{applicant.amount}</TableCell>
              <TableCell>
                <span className="font-mono font-semibold">{applicant.score}</span>
              </TableCell>
              <TableCell>
                <Badge className={getRiskBadgeVariant(applicant.risk)}>
                  {applicant.risk.charAt(0).toUpperCase() + applicant.risk.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>{getStatusBadge(applicant.status)}</TableCell>
              <TableCell className="text-muted-foreground">{applicant.date}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
