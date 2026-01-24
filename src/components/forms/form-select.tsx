import type { ReactNode } from "react";
import { FormBase, type FormControlFunc } from "@/components/forms/form-base";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const FormSelect: FormControlFunc<{ children: ReactNode }> = ({
  children,
  ...props
}) => (
  <FormBase {...props}>
    {({ onChange, onBlur, ...field }) => (
      <Select {...field} onValueChange={onChange}>
        <SelectTrigger
          aria-invalid={field["aria-invalid"]}
          id={field.id}
          onBlur={onBlur}
        >
          <SelectValue placeholder={field.placeholder} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    )}
  </FormBase>
);
