'use client';

import React, { memo, forwardRef, useImperativeHandle } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

export interface LoginFormCaptchaRef {
  getValue: () => string | null;
  reset: () => void;
}

interface LoginFormCaptchaProps {
  siteKey: string;
}

export const LoginFormCaptcha = memo(
  forwardRef<LoginFormCaptchaRef, LoginFormCaptchaProps>(({ siteKey }, ref) => {
    const recaptchaRef = React.useRef<ReCAPTCHA>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => recaptchaRef.current?.getValue() || null,
      reset: () => recaptchaRef.current?.reset(),
    }));

    return (
      <div className="flex justify-center">
        <ReCAPTCHA ref={recaptchaRef} sitekey={siteKey} />
      </div>
    );
  }),
);

LoginFormCaptcha.displayName = 'LoginFormCaptcha';

