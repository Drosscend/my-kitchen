import { FormBase, type FormControlFunc } from "@/components/forms/form-base";
import { Textarea } from "@/components/ui/textarea";

type TextareaExtraProps = {
  className?: string;
  maxLength?: number;
  rows?: number;
};

export const FormTextarea: FormControlFunc<TextareaExtraProps> = ({
  className,
  maxLength,
  rows,
  ...props
}) => (
  <FormBase {...props}>
    {(field) => (
      <Textarea
        {...field}
        className={className}
        maxLength={maxLength}
        rows={rows}
        autoFocus
      />
    )}
  </FormBase>
);
