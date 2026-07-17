import { usePage } from "@inertiajs/react";
import { defineAbilitiesFor } from "@/lib/ability";
import { Action, type Entity } from "@/lib/permissions";
import type { SharedData } from "@/types";

export function useAbility(entity?: Entity) {
  const { auth } = usePage<SharedData>().props;

  const ability = defineAbilitiesFor(auth.permissions);
  const checkCan = (action: Action) => {
    if (entity == undefined) {
      return true;
    }
    return ability.can(action, entity);
  };

  return {
    ability,
    canCreate: checkCan(Action.Create),
    canUpdate: checkCan(Action.Update),
    canDelete: checkCan(Action.Delete),
    can: (action: Action, canEntity: Entity) => ability.can(action, canEntity),
  };
}
