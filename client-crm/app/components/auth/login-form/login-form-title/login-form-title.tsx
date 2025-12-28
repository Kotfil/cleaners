import { TypographyH2, TypographyMuted } from "@/app/components/ui/typography";
import { cn } from "@/helpers/utils";

interface LoginFormTitleProps {
  className?: string;
}

export function LoginFormTitle({ className }: LoginFormTitleProps) {
  return (
    <div className={cn("flex flex-col items-center gap-1 text-center", className)}>
      <TypographyH2 className="text-2xl font-bold">Login to your account</TypographyH2>
      <TypographyMuted className="text-balance">
        Enter your email below to login to your account
      </TypographyMuted>
    </div>
  );
}
