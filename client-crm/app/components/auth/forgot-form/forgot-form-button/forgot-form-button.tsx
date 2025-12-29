import { Field } from "@/app/components/ui/field";
import { Button } from "@/app/components/ui/button";
import { Spinner } from "@/app/components/ui/spinner";
import { ForgotFormButtonProps } from "./forgot-form-button.types";

export function ForgotFormButton({ isLoading }: ForgotFormButtonProps) {
  return (
    <Field>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2"/>
            Отправка...
          </>
        ) : (
          'Отправить ссылку для сброса'
        )}
      </Button>
    </Field>
  );
}

