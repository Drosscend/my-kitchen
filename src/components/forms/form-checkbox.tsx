import { FormBase, type FormControlFunc } from "@/components/forms/form-base";
import { Checkbox } from "@/components/ui/checkbox";

export const FormCheckbox: FormControlFunc = (props) => (
  <FormBase {...props} controlFirst horizontal>
    {({ onChange, value, type, ...field }) => (
      <Checkbox {...field} checked={value} onCheckedChange={onChange} />
    )}
  </FormBase>
);
