// Soft gate, not security. Hashes ship in the client; treat as a velvet rope,
// not access control. Real privacy boundaries live on a different host.

const GROUP_HASHES = {
  '14d188c451b9714544a8c615319e0e548d64bd442ac4fa2072a615f434b3d25d': 1,
  'df87c627aea5096bd768bd61c81ffdbce1c2b65d10e8f853c4aed30fbecb3267': 2,
  'd4b22e86447b08533ff2da71864be51a7b318e2ea8cbe7aa32f6d595c0f7c4b0': 3
};

async function sha256Hex(text) {
  const buf = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function getMemberGroup() {
  const raw = localStorage.getItem('memberGroup');
  const n = parseInt(raw, 10);
  return (n === 1 || n === 2 || n === 3) ? n : null;
}

function setMemberGroup(n) {
  localStorage.setItem('memberGroup', String(n));
}

function clearMemberGroup() {
  localStorage.removeItem('memberGroup');
}

// Auth guard. Call with minGroup=1 (any member), 2 (tribe+), 3 (kollektiv only).
// Redirects to /login.html if not authorized.
function requireGroup(minGroup) {
  const g = getMemberGroup();
  if (g === null || g < minGroup) {
    window.location.replace('/login.html');
    return false;
  }
  return true;
}
