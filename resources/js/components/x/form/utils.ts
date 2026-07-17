/** biome-ignore-all lint/suspicious/noExplicitAny: Will be addressed */

function getErrorByPath(obj: any, path: string): any {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current && typeof current === "object") {
      current = current[key];
    } else {
      return;
    }
  }
  return current;
}

export function getFormError(errors: any, path: any): string | undefined {
  const pathStr = path.toString();
  const error = getErrorByPath(errors, pathStr);
  return Array.isArray(error)
    ? error
        .map((e) => e?.message)
        .filter(Boolean)
        .join(", ")
    : error?.message?.toString();
}

export function getFormRequired(schema: any, name: any): boolean {
  const nameStr = name.toString();
  return !schema?.shape[nameStr]?.isOptional?.();
}

export function getFormMaximum(schema: any, name: any): number | undefined {
  const nameStr = name.toString();
  return schema?.shape[nameStr]?._def?.checks.find(
    (item: any) => item._zod?.def?.check === "max_length"
  )?._zod?.def?.maximum;
}

export function getFormMinimum(schema: any, name: any): number | undefined {
  const nameStr = name.toString();
  return schema?.shape[nameStr]?._def?.checks.find(
    (item: any) => item._zod?.def?.check === "min_length"
  )?._zod?.def?.minimum;
}

export function getFormRealName(n: any): string {
  const str = n.toString();
  if (str.includes(".")) {
    return str.split(".").at(-1);
  }
  return str;
}
