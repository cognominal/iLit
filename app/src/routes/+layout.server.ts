export async function load({ locals }) {
  return {
    auth: {
      user: locals.user
    }
  }
}
