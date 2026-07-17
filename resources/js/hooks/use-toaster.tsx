import { usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { SharedData } from "@/types";

export function useFlashToaster() {
  const { flash } = usePage<SharedData>().props;

  useEffect(() => {
    toast.dismiss();

    if (flash?.success) {
      toast.success(flash.success, {
        duration: 5000,
        id: "success-toast",
      });
    }

    if (flash?.error) {
      toast.error(flash.error, {
        duration: 5000,
        id: "error-toast",
      });
    }

    if (flash?.message) {
      toast.info(flash.message, {
        duration: 5000,
        id: "info-toast",
      });
    }
  }, [flash?.success, flash?.error, flash?.message]);
}
