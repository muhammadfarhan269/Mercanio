export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /checkout/
Disallow: /account/

Sitemap: ${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/sitemap.xml`

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
