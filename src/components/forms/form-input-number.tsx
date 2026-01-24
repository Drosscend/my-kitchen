import { Input } from "@/components/ui/input";
import { FormBase, type FormControlFunc } from "./form-base";

type InputNumberExtraProps = {
  min?: number;
  step?: number;
};

export const FormInputNumber: FormControlFunc<InputNumberExtraProps> = ({
  min,
  step,
  ...props
}) => (
  <FormBase {...props} type="number">
    {(field) => (
      <Input
        {...field}
        min={min}
        onChange={(e) => {
          const value = e.target.value === "" ? "" : Number(e.target.value);
          field.onChange(value);
        }}
        step={step}
      />
    )}
  </FormBase>
);
