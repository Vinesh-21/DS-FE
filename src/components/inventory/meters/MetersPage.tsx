import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMeter,
  deleteMeter,
  getMetersByGateway,
  updateMeter,
} from "@/services/meters.api";
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

type Meter = {
  id: string;
  meterId: string;
  meterName: string;
  meterType: string;
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

export default function MetersPage() {
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // ✅ NULL instead of ""
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    meterId: "",
    meterName: "",
    meterType: "ENERGY",
    gatewayId: "",
  });

  const queryClient = useQueryClient();

  /* ================= DATA ================= */

  const { data: sites } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: getSites,
  });

  // 🔥 ALWAYS DEFAULT SITE
  const effectiveSite = selectedSite ?? (sites?.length ? sites[0].siteId : "");

  const { data: gateways } = useQuery<Gateway[]>({
    queryKey: ["gateways", effectiveSite],
    queryFn: () => getGatewaysBySite(effectiveSite),
    enabled: !!effectiveSite,
  });

  // 🔥 ALWAYS DEFAULT GATEWAY
  const effectiveGateway =
    selectedGateway ?? (gateways?.length ? gateways[0].gatewayId : "");

  const { data: meters } = useQuery<Meter[]>({
    queryKey: ["meters", effectiveGateway],
    queryFn: () => getMetersByGateway(effectiveGateway),
    enabled: !!effectiveGateway,
  });

  /* ================= MUTATIONS ================= */

  const createMutation = useMutation({
    mutationFn: createMeter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      toast.success("Meter Added");
      setOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateMeter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      toast.success("Meter Updated");
      setOpen(false);
      setIsEdit(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMeter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meters"] });
      toast.success("Meter Deleted");
    },
  });

  /* ================= HANDLERS ================= */

  function handleEdit(meter: Meter) {
    setFormData({
      meterId: meter.meterId,
      meterName: meter.meterName,
      meterType: meter.meterType,
      gatewayId: meter.gatewayId,
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
        meterId: formData.meterId,
        data: {
          meterName: formData.meterName,
          meterType: formData.meterType,
          gatewayId: formData.gatewayId,
        },
      });
    } else {
      createMutation.mutate({
        ...formData,
        gatewayId: effectiveGateway, // ✅ FIX
      });
    }
  }

  /* ================= UI ================= */

  return (
    <div className="w-full h-full">
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

        {/* ADD */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  meterId: "",
                  meterName: "",
                  meterType: "ENERGY",
                  gatewayId: effectiveGateway,
                });
                setIsEdit(false);
                setOpen(true);
              }}
              disabled={!effectiveGateway}
            >
              Add Meter <PlusIcon />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Meter" : "Add Meter"}</DialogTitle>
              </DialogHeader>

              <FieldGroup>
                <Field>
                  <Label>Meter ID</Label>
                  <Input
                    value={formData.meterId}
                    disabled={isEdit}
                    onChange={(e) =>
                      setFormData({ ...formData, meterId: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field>
                  <Label>Meter Name</Label>
                  <Input
                    value={formData.meterName}
                    onChange={(e) =>
                      setFormData({ ...formData, meterName: e.target.value })
                    }
                    required
                  />
                </Field>

                <Field>
                  <Label>Meter Type</Label>
                  <Select
                    value={formData.meterType}
                    onValueChange={(val) =>
                      setFormData({ ...formData, meterType: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="ENERGY">ENERGY</SelectItem>
                      <SelectItem value="GAS">GAS</SelectItem>
                      <SelectItem value="WATER">WATER</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>

                <Button type="submit">{isEdit ? "Update" : "Save"}</Button>
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
      ) : !meters?.length ? (
        <div className="flex justify-center mt-5">
          <p>No meters found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Meter Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {meters.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.meterName}</TableCell>
                <TableCell>{m.meterType}</TableCell>

                <TableCell className="flex gap-2">
                  <Button size="xs" onClick={() => handleEdit(m)}>
                    Edit
                  </Button>

                  <Button
                    size="xs"
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(m.meterId)}
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
