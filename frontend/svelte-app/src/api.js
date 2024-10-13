
import { writable } from 'svelte/store';

export const arrangements = writable([]);

export async function fetchArrangements() {
  const res = await fetch('/api/arrangements');
  const data = await res.json();
  arrangements.set(data.arrangements);
}

export async function fetchWithdrawalRequests(arrangementId) {
  const res = await fetch(`/api/get_withdrawal_requests/${arrangementId}`);
  return await res.json();
}

export async function requestWithdrawal(arrangementId) {
  const res = await fetch(`/api/request_withdrawal/${arrangementId}`, {
    method: 'POST',
  });
  return await res.json();
}

export async function handleWithdrawal(arrangementId, requestId, decision) {
  const res = await fetch(`/api/handle_withdrawal/${arrangementId}/${requestId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ decision }),
  });
  return await res.json();
}
