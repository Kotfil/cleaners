import { TypographyH2, TypographyMuted } from "@/app/components/ui/typography";
import { cn } from "@/helpers/utils";

interface LoginFormTitleProps {
  className?: string;
}

export function LoginFormTitle({ className }: LoginFormTitleProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <TypographyH2 className="text-2xl font-bold">Войдите в свой аккаунт</TypographyH2>
      <TypographyMuted className="text-balance">
        Введите ваш email ниже для входа в аккаунт
      </TypographyMuted>
    </div>
  );
}
