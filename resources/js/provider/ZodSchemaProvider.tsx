import { createContext, useContext } from "react";
import type { z } from "zod";

//
// biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
type ZodSchemaContext = z.ZodType<any, any, any> | null;

const SchemaContext = createContext<ZodSchemaContext>(null);

export const useZodSchema = () => {
  // biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
  const context = useContext(SchemaContext) as z.ZodObject<any> | null;
  if (!context) {
    return null;
  }
  return context;
};

export const ZodSchemaProvider = SchemaContext.Provider;
