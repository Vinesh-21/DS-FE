import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSite,
  deleteSites,
  getSites,
  updateSite,
} from "@/services/sites.api";
import { Site } from "@/types/common";
import { type SiteStatus } from "@/types/common";
import {
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Table,
} from "../ui/table";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Field, FieldGroup } from "../ui/field";
import { Badge } from "../ui/badge";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function SitesPage() {
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    siteId: "",
    siteName: "",
    siteLocation: "",
    active: "ONLINE" as SiteStatus,
  });

  const [open, setOpen] = useState(false);

  const {
    isLoading: isSitesLoading,
    data: siteData,
    error,
  } = useQuery<Site[]>({
    queryKey: ["sites"],
    queryFn: getSites,
  });

  const queryClient = useQueryClient();

  //Add
  const createMutation = useMutation({
    mutationFn: createSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site Added",{ position: "top-center" });

      setOpen(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to add site",{ position: "top-center" });
    },
  });

  // Edit
  const updateMutation = useMutation({
    mutationFn: updateSite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site Updated",{ position: "top-center" });

      setOpen(false);
      setIsEdit(false);
    },
    onError: (err:any) => {
      toast.error(err?.response?.data?.message||"Failed to update site",{ position: "top-center" });
    },
  });

  //Delete
  const deleteMutation = useMutation({
    mutationFn: deleteSites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Site Deleted", { position: "top-center" });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Something went wrong", {
        position: "top-center",
      });
    },
  });

  //Handle Delete
  function handelOnClickDeleteBtn(siteId: string) {
    deleteMutation.mutate(siteId);
  }

  // Handle Edit
  function handleEdit(site: Site) {
    setFormData({
      siteId: site.siteId,
      siteName: site.siteName,
      siteLocation: site.siteLocation,
      active: site.active,
    });

    setIsEdit(true);
    setOpen(true);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isEdit) {
      updateMutation.mutate({
        siteId: formData.siteId,
        data: {
          siteName: formData.siteName,
          siteLocation: formData.siteLocation,
          active: formData.active,
        },
      });
    } else {
      createMutation.mutate(formData);
    }
  }

  return (
    <div className="w-full h-full ">
      <div className="w-full flex justify-end ">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setFormData({
                  siteId: "",
                  siteName: "",
                  siteLocation: "",
                  active: "ONLINE",
                });
                setIsEdit(false);
                setOpen(true);
              }}
            >
              Add Site
              <PlusIcon />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-sm">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{isEdit ? "Edit Site" : "Add Site"}</DialogTitle>
              </DialogHeader>

              <FieldGroup>
                <Field>
                  <Label>Site ID</Label>
                  <Input
                    name="siteId"
                    value={formData.siteId}
                    disabled={isEdit}
                    onChange={handleChange}
                    required
                  />
                </Field>

                <Field>
                  <Label>Site Name</Label>
                  <Input
                    name="siteName"
                    value={formData.siteName}
                    onChange={handleChange}
                    required
                  />
                </Field>

                <Field>
                  <Label>Location</Label>
                  <Input
                    name="siteLocation"
                    value={formData.siteLocation}
                    onChange={handleChange}
                    required
                  />
                </Field>

                <Field>
                  <Label>Site Status</Label>

                  <Select
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        active: value as SiteStatus,
                      }))
                    }
                    value={formData.active}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status</SelectLabel>

                        <SelectItem value="ONLINE">ONLINE</SelectItem>
                        <SelectItem value="OFFLINE">OFFLINE</SelectItem>
                        <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
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

      {siteData?.length === 0 ? (
        <div className="w-full h-full flex justify-center mt-5">
          <p className="font-extralight text-gray-600">
            No site data available, Add site to view data.
          </p>
        </div>
      ) : (
        <>
          <div>
            <Table>
              <TableCaption>List of sites</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Site Name</TableHead>
                  <TableHead className="w-[250px]">Location</TableHead>
                  <TableHead className="w-[300px]">Active</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteData?.map((site) => (
                  <TableRow key={site.id}>
                    <TableCell className="font-medium">
                      {site.siteName}
                    </TableCell>
                    <TableCell>{site.siteLocation}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          site.active === "ONLINE" ? " text-green-700" : site.active ==="MAINTENANCE"?"bg-amber-100/50 border-0 text-amber-500":""
                        }
                        variant={
                          site.active === "ONLINE"
                            ? "secondary"
                            : site.active === "OFFLINE"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {site.active}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() => handleEdit(site)}
                      >
                        Edit
                      </Button>
                      <Button
                        size={"xs"}
                        variant={"destructive"}
                        onClick={() => handelOnClickDeleteBtn(site.siteId)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
