import { Field } from "@/app/components/ui/field";
import { Button } from "@/app/components/ui/button";
import { Spinner } from "@/app/components/ui/spinner";
import { ResetPasswordFormButtonProps } from "./reset-password-form-button.types";

export function ResetPasswordFormButton({ isLoading }: ResetPasswordFormButtonProps) {
  return (
    <Field>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2"/>
            Resetting...
          </>
        ) : (
          'Reset Password'
        )}
      </Button>
    </Field>
  );
}

