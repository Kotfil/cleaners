import { Field } from "@/app/components/ui/field";
import { Button } from "@/app/components/ui/button";
import { Spinner } from "@/app/components/ui/spinner";
import { LoginFormButtonProps } from "./login-form-button.types";
import Link from 'next/link';

export function LoginFormButton({ isLoading }: LoginFormButtonProps) {
  return (
    <Field>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2"/>
            Вход...
          </>
        ) : (
          'Войти'
        )}
      </Button>
      <Link
        href="/forgot"
        className="text-sm text-center underline-offset-4 hover:underline"
      >
        Забыли пароль?
      </Link>
    </Field>
  );
}
