import { clsx, type ClassValue } from 'clsx';
import { toast } from 'svelte-sonner';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

const DEFAULT_TOAST_PARAMS = {
  position: 'top-center',
  closeButton: true
} as const;

export const toastSuccess = (message: string) => {
  toast.success(message, DEFAULT_TOAST_PARAMS);
};

export const toastError = (message: string) => {
  toast.error(message, DEFAULT_TOAST_PARAMS);
};

export const toastWarning = (message: string) => {
  toast.warning(message, DEFAULT_TOAST_PARAMS);
};

export const toastMessage = (message: string) => {
  toast(message, DEFAULT_TOAST_PARAMS);
};
