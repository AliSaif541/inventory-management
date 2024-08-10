import crypto from 'crypto';

export const encodeUserIdentifier = (email, role) => {
  const hash = crypto.createHash('sha256');
  hash.update(`${email}-${role}`);
  return hash.digest('hex');
};
