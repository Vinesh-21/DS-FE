import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLoad,
  deleteLoad,
  getLoadsByGateway,
  updateLoad,
} from "@/services/loads.api";
import { getGatewaysBySite } from "@/services/gateway.api";
import { getSites } from "@/services/sites.api";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* ================= TYPES ================= */

type Load = {
  id: string;
  loadId: string;
  loadName: string;
  loadType: string;
  gatewayId: string;
};

type Gateway = {
  gatewayId: string;
  gatewayName: string;
};

type Site = {
  siteId: string;
  siteName: string;
};

/* ================= COMPONENT ================= */

export default function Loads() {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    loadId: "",
    loadName: "",
    loadType: "HVAC",
    gatewayId: "",
  });

  const queryClient = useQueryClient();

  /* ================= DATA ================= */

  const { data: sites } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: getSites,
  });

  // ✅ Always default first site
  const effectiveSite =
    selectedSite ?? (sites?.length ? sites[0].siteId : "");

  const { data: gateways } = useQuery<Gateway[]>({
    queryKey: ["gateways", effectiveSite],
    queryFn: () => getGatewaysBySite(effectiveSite),
    enabled: !!effectiveSite,
  });

  // ✅ Always default first gateway
  const effectiveGateway =
    selectedGateway ?? (gateways?.length ? gateways[0].gatewayId : "");

  const { data: loads } = useQuery<Load[]>({
    queryKey: ["loads", effectiveGateway],
    queryFn: () => getLoadsByGateway(effectiveGateway),
    enabled: !!effectiveGateway,
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: createLoad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loads"] });
      toast.success("Load Added");
      setOpen(false);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || "Failed to add load"),
  });

  const updateMutation = useMutation({
    mutationFn: updateLoad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loads"] });
      toast.success("Load Updated");
      setOpen(false);
      setIsEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteLoad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loads"] });
      toast.success("Load Deleted");
    },
  });

  /* ================= HANDLERS ================= */

  function handleEdit(load: Load) {
    setFormData({
      loadId: load.loadId,
      loadName: load.loadName,
      loadType: load.loadType,
      gatewayId: load.gatewayId,
    });

    setIsEdit(true);
    setOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!effectiveGateway) {
      toast.error("Select Site & Gateway first");
      return;
    }

    if (isEdit) {
      updateMutation.mutate({
        loadId: formData.loadId,
        data: {
          loadName: formData.loadName,
          loadType: formData.loadType,
          gatewayId: formData.gatewayId,
        },
      });
    } else {
      createMutation.mutate({
        ...formData,
        gatewayId: effectiveGateway,
      });
    }
  }

  /* ================= UI ================= */

  return (
    <div className="w-full h-full">

      {/* 🔥 TOP BAR */}
      <div className="flex gap-4 mb-4 justify-center">

        {/* SITE */}
        <Select
          value={effectiveSite}
          onValueChange={(val) => {
            setSelectedSite(val);
            setSelectedGateway(null);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Site" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Sites</SelectLabel>
              {sites?.map((s) => (
                <SelectItem key={s.siteId} value={s.siteId}>
                  {s.siteName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* GATEWAY */}
        <Select
          value={effectiveGateway}
          onValueChange={(val) => setSelectedGateway(val)}
          disabled={!effectiveSite}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Gateway" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectLabel>Gateways</SelectLabel>
              {gateways?.map((g) => (
                <SelectItem key={g.gatewayId} value={g.gatewayId}>
                  {g.gatewayName}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* ADD BUTTON */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  loadId: "",
                  loadName: "",
                  loadType: "HVAC",
                  gatewayId: effectiveGateway,
                });
                setIsEdit(false);
                setOpen(true);
              }}
              disabled={!effectiveGateway}
            >
              Add Load <PlusIcon />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {isEdit ? "Edit Load" : "Add Load"}
                </DialogTitle>
              </DialogHeader>

              <FieldGroup>
                <Field>
                  <Label>Load ID</Label>
                  <Input
                    value={formData.loadId}
                    disabled={isEdit}
                    onChange={(e) =>
                      setFormData({ ...formData, loadId: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field>
                  <Label>Load Name</Label>
                  <Input
                    value={formData.loadName}
                    onChange={(e) =>
                      setFormData({ ...formData, loadName: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field>
                  <Label>Load Type</Label>
                  <Select
                    value={formData.loadType}
                    onValueChange={(val) =>
                      setFormData({ ...formData, loadType: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="MACHINE">MACHINE</SelectItem>
                      <SelectItem value="HVAC">HVAC</SelectItem>
                      <SelectItem value="MOTOR">MOTOR</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button type="submit">
                  {isEdit ? "Update" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* TABLE */}
      {!effectiveGateway ? (
        <div className="flex justify-center mt-5">
          <p>No Gateway available</p>
        </div>
      ) : !loads || loads.length === 0 ? (
        <div className="flex justify-center mt-5">
          <p>No loads found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Load Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loads.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.loadName}</TableCell>
                <TableCell>{l.loadType}</TableCell>

                <TableCell className="flex gap-2">
                  <Button
                    size="xs"
                    variant="secondary"
                    onClick={() => handleEdit(l)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(l.loadId)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}