"use client"

import { useState, useEffect } from "react"
import { PhoneInput } from "@/app/components/ui/phone-input"
import { Textarea } from "@/app/components/ui/textarea"
import { Field, FieldLabel, FieldGroup } from "@/app/components/ui/field"
import { Button } from "@/app/components/ui/button"
import { Spinner } from "@/app/components/ui/spinner"
import { useRingCentral } from "@/lib/store/hooks/ring-central.hooks"
import { cleanPhoneNumber } from "./phone-formatter"
import { toast } from "sonner"

const MAX_SMS_LENGTH = 159

/**
 * Chat page component with RingCentral SMS integration
 */
export function ChatPage() {
  const [phoneNumber, setPhoneNumber] = useState<string>("")
  const [message, setMessage] = useState<string>("Text")
  const { loading, error, lastMessageId, sendSms, clearError } = useRingCentral()

  useEffect(() => {
    if (lastMessageId) {
      toast.success(`SMS sent successfully! Message ID: ${lastMessageId}`)
      setPhoneNumber("")
      setMessage("Text")
    }
  }, [lastMessageId])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value
    if (value.length <= MAX_SMS_LENGTH) {
      setMessage(value)
    }
  }

  const handleSendSms = async (): Promise<void> => {
    // phoneNumber already contains linear format without brackets/dashes
    // cleanPhoneNumber validates and ensures E.164 format
    const cleanedPhone = cleanPhoneNumber(phoneNumber)
    if (!cleanedPhone) {
      toast.error("Please enter a valid phone number (E.164 format: +XXXXXXXXXXX)")
      return
    }
    // Validate E.164 format: + followed by 4-15 digits
    // cleanedPhone should be in format: +XXXXXXXXXXX (linear, no brackets/dashes)
    if (!cleanedPhone.match(/^\+\d{4,15}$/)) {
      toast.error("Phone number must be in E.164 format (+ followed by 4-15 digits)")
      return
    }
    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }
    // Send linear format to backend
    await sendSms(cleanedPhone, message.trim())
  }

  const remainingChars = MAX_SMS_LENGTH - message.length

  return (
    <FieldGroup className="px-4 lg:px-6">
      <Field>
        <FieldLabel htmlFor="number-input">Number</FieldLabel>
        <div className="relative">
          <PhoneInput
            id="number-input"
            value={phoneNumber}
            onChange={setPhoneNumber}
            placeholder="+1(XXX)-XXX-XXXX"
            disabled={loading}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>
      </Field>
      <Field>
        <FieldLabel htmlFor="text-input">SMS ({remainingChars} characters remaining)</FieldLabel>
        <div className="relative">
          <Textarea
            id="text-input"
            value={message}
            onChange={handleMessageChange}
            placeholder="Enter message (max 159 characters)"
            disabled={loading}
            maxLength={MAX_SMS_LENGTH}
          />
          {loading && (
            <div className="absolute right-3 top-3">
              <Spinner size="sm" />
            </div>
          )}
        </div>
      </Field>
      <Field>
        <Button
          onClick={handleSendSms}
          disabled={loading || !phoneNumber.trim() || !message.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Sending...
            </>
          ) : (
            "Send"
          )}
        </Button>
      </Field>
    </FieldGroup>
  )
}

