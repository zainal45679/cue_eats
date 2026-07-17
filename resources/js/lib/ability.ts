import { Ability, AbilityBuilder } from "@casl/ability";

/**
 * Builds CASL Ability from Laravel permissions like `create.users`
 */
import type { Action, Entity } from "@/lib/permissions";

export const defineAbilitiesFor = (permissions: string[]) => {
  const { can, rules } = new AbilityBuilder(Ability);

  for (const permission of permissions) {
    const [action, subject] = permission.split(".");

    if (!(action && subject)) {
      continue;
    }

    can(action as Action, subject as Entity);
  }

  return new Ability(rules);
};
