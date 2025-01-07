'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthCallback = () => {
  const router = useRouter()

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code')
    if (code) {
      fetch(`https://backend-minimal.vercel.app/auth/google/callback?code=${code}`)
        .then(res => res.json())
        .then(data => {
          localStorage.setItem('token', data.token)
          router.push('/home')
        })
        .catch(err => {
          console.error('Auth error:', err)
          router.push('/auth')
        })
    }
  }, [router])

  return <div>Processing Auth....</div>
}
