import { TypographyH2, TypographyMuted } from "@/app/components/ui/typography";
import { ForgotFormTitleProps } from "./forgot-form-title.types";
import { cn } from "@/helpers/utils";

export function ForgotFormTitle({ className }: ForgotFormTitleProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <TypographyH2 className="text-2xl font-bold">Забыли пароль?</TypographyH2>
      <TypographyMuted className="text-balance">
        Введите ваш email ниже для сброса пароля
      </TypographyMuted>
    </div>
  );
}

