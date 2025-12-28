import { useAppDispatch, useAppSelector } from './redux.hooks';
import { sendSms, clearError, clearLastMessageId } from '../slices/ring-central-slice/ring-central-slice';

export const useRingCentral = () => {
  const dispatch = useAppDispatch();
  const ringCentral = useAppSelector((state) => state.ringCentral);

  const handleSendSms = (to: string, text: string) => {
    return dispatch(sendSms({ to, text }));
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const handleClearLastMessageId = () => {
    dispatch(clearLastMessageId());
  };

  return {
    ...ringCentral,
    sendSms: handleSendSms,
    clearError: handleClearError,
    clearLastMessageId: handleClearLastMessageId,
  };
};

