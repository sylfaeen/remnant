import { trpc } from '@remnant/frontend/lib/trpc';

export function useTotpStatus() {
  return trpc.totp.status.useQuery();
}

export function useTotpSetup() {
  return trpc.totp.setup.useMutation();
}

export function useTotpVerify() {
  return trpc.totp.verify.useMutation();
}

export function useTotpDisable() {
  return trpc.totp.disable.useMutation();
}

export function useVerifyTotpLogin() {
  return trpc.auth.verifyTotp.useMutation();
}
