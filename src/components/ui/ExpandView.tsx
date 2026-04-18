import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

export default function ExpandView({ children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative group">
        <div className="cursor-default">
          {children}
        </div>

        <Button
          size="icon"
          variant="secondary"
          className="
            absolute top-2 right-2 opacity-0
            group-hover:opacity-100 transition
          "
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <Maximize2 size={16} />
        </Button>
      </div>

      {/* DIALOG */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="
            !max-w-none
            w-[90vw]
            h-[90vh]
            p-4
          "
        >
          <div className="w-full h-full overflow-auto">
            <div className="w-full h-full [&>*]:w-full [&>*]:h-full">
              {children}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}