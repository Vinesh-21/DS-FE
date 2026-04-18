import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGateway,
  deleteGateway,
  getGateways,
  updateGateway,
} from "@/services/gateway.api";
import { getSites } from "@/services/sites.api";
import { GatewayStatus, Site } from "@/types/common";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Gateway = {
  id: string;
  gatewayId: string;
  gatewayName: string;
  siteId: string;
  status: GatewayStatus;
};

export default function GatewaysPage() {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    gatewayId: "",
    gatewayName: "",
    siteId: "",
    status: "ONLINE" as GatewayStatus,
  });

  const queryClient = useQueryClient();

  // Fetch gateways
  const { data: gateways } = useQuery({
    queryKey: ["gateways"],
    queryFn: getGateways,
  });

  // Fetch sites (for dropdown)
  const { data: sites } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: getSites,
  });

  // Create
  const createMutation = useMutation({
    mutationFn: createGateway,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways"] });
      toast.success("Gateway Added", { position: "top-center" });
      setOpen(false);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to add gateway", {
        position: "top-center",
      }),
  });

  // Update
  const updateMutation = useMutation({
    mutationFn: updateGateway,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways"] });
      toast.success("Gateway Updated");
      setOpen(false);
      setIsEdit(false);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to update gateway", {
        position: "top-center",
      }),
  });

  // Delete
  const deleteMutation = useMutation({
    mutationFn: deleteGateway,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gateways"] });
      toast.success("Gateway Deleted", { position: "top-center" });
    },
  });

  // Edit handler
  function handleEdit(gateway: Gateway) {
    setFormData({
      gatewayId: gateway.gatewayId,
      gatewayName: gateway.gatewayName,
      siteId: gateway.siteId,
      status: gateway.status,
    });

    setIsEdit(true);
    setOpen(true);
  }

  // Submit
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEdit) {
      updateMutation.mutate({
        gatewayId: formData.gatewayId,
        data: {
          gatewayName: formData.gatewayName,
          siteId: formData.siteId,
          status: formData.status,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  }

  return (
    <div className="w-full h-full">
      {/* ADD BUTTON */}
      <div className="flex justify-end mb-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  gatewayId: "",
                  gatewayName: "",
                  siteId: "",
                  status: "ONLINE",
                });
                setIsEdit(false);
                setOpen(true);
              }}
            >
              Add Gateway <PlusIcon />
            </Button>
          </DialogTrigger>

          {/* FORM */}
          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {isEdit ? "Edit Gateway" : "Add Gateway"}
                </DialogTitle>
              </DialogHeader>

              <FieldGroup>
                {/* Gateway ID */}
                <Field>
                  <Label>Gateway ID</Label>
                  <Input
                    value={formData.gatewayId}
                    disabled={isEdit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gatewayId: e.target.value,
                      })
                    }
                    required
                  />
                </Field>

                {/* Name */}
                <Field>
                  <Label>Gateway Name</Label>
                  <Input
                    value={formData.gatewayName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        gatewayName: e.target.value,
                      })
                    }
                    required
                  />
                </Field>

                {/* Site Dropdown */}
                <Field>
                  <Label>Site</Label>
                  <Select
                    value={formData.siteId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, siteId: value })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Site" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Sites</SelectLabel>
                        {sites?.map((site) => (
                          <SelectItem key={site.siteId} value={site.siteId}>
                            {site.siteName}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Status */}
                <Field>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        status: value as GatewayStatus,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="ONLINE">ONLINE</SelectItem>
                      <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                      <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {isEdit
                    ? updateMutation.isPending
                      ? "Updating..."
                      : "Update"
                    : createMutation.isPending
                    ? "Saving..."
                    : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!gateways || gateways.length === 0 ? (
        <div className="w-full h-full flex justify-center mt-5">
          <p className="font-extralight text-gray-600">
            No gateway data available, Add gateway to view data.
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {gateways?.map((g: Gateway) => {
              const siteName =
                sites?.find((s) => s.siteId === g.siteId)?.siteName || g.siteId;

              return (
                <TableRow key={g.id}>
                  <TableCell>{g.gatewayName}</TableCell>
                  <TableCell>{siteName}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        g.status === "ONLINE" ? "secondary" : "destructive"
                      }
                    >
                      {g.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="flex gap-2">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => handleEdit(g)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="xs"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate(g.gatewayId)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
