
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const handler = NextAuth({
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: {  label: "Password", type: "password" },
        asEmployee: { label: "As Employee", type: "checkbox" }
      },
      async authorize(credentials, req) {

        let session=null
        if (credentials.asEmployee){
          const res = await fetch('http://localhost:8080/auth/login-employee', {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (res.ok) {
            const data = await res.json()
            session = {
              id: data.employeeId,
              role: data.role,
              name: data.user.name,
              email: data.user.email,
              apiToken: data.token
            }
          }
        } else {
          const res = await fetch('http://localhost:8080/auth/login', {
            method: 'POST',
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          })

          if (res.ok) {
            const data = await res.json()
            session = {
              id: data.user._id,
              name: data.user.name,
              email: data.user.email,
              apiToken: data.token
            }
          }
        }

        return session
      },
    })
  ],
  callbacks: {
    jwt: async ({
      token,
      user,
      account,
      profile,
    }) => {
      if (user) {
        return {
          ...token,
          apiToken: user.apiToken,
        }
      }

      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.apiToken = token.apiToken
      }

      return session
    }
  }
})



export { handler as GET, handler as POST }
