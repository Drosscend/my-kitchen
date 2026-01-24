import { FormBase, type FormControlFunc } from "@/components/forms/form-base";
import { Switch } from "@/components/ui/switch";

export const FormSwitch: FormControlFunc = (props) => (
  <FormBase {...props} controlFirst horizontal>
    {({ onChange, value, type, ...field }) => (
      <Switch {...field} checked={value} onCheckedChange={onChange} />
    )}
  </FormBase>
);
