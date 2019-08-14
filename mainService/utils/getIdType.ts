export const TYPE_USERNAME = "username";
export const TYPE_EMAIL = "email";

export default function getIdType(id: string) {
  if (/^[^@]+@[^\.]+\..+$/.test(id)) {
    // ID is email
    return TYPE_EMAIL;
  }
  // ID is username
  return TYPE_USERNAME;
}
