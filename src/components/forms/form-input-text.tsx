import { FormBase, type FormControlFunc } from "@/components/forms/form-base";
import { Input } from "@/components/ui/input";

export const FormInputText: FormControlFunc = (props) => (
  <FormBase {...props} type="text">
    {(field) => <Input {...field} />}
  </FormBase>
);
