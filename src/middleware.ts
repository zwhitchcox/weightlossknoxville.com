import { type MiddlewareHandler } from 'astro'

/**
 * /book is served by the shared booking engine on hitchcoxaesthetics.com,
 * re-branded for this site via the X-Brand header (see the main repo's
 * app/config/brands.ts). This middleware reverse-proxies the booking route
 * plus the endpoints/assets it needs, so visitors never leave this domain and
 * the booking experience is byte-for-byte the main site's flow, scoped to
 * weight-loss services.
 */
const UPSTREAM =
	process.env.BOOKING_UPSTREAM ?? 'https://hitchcoxaesthetics.com'
const BRAND = 'weight-loss-knox'

const PROXY_PATHS = [
	/^\/book\/?$/, // the booking page (with or without trailing slash)
	/^\/book\.data/, // Remix single-fetch data + action endpoints
	/^\/resources\//, // phone verification, client lookup, etc.
	/^\/assets\//, // fingerprinted Remix JS/CSS chunks
	/^\/img\//, // images referenced by the booking UI (provider photo)
	/^\/fonts\//,
]

const HOP_BY_HOP_RESPONSE_HEADERS = [
	'content-encoding',
	'content-length',
	'transfer-encoding',
	'connection',
]

export const onRequest: MiddlewareHandler = async (context, next) => {
	const url = new URL(context.request.url)
	if (!PROXY_PATHS.some(pattern => pattern.test(url.pathname))) return next()

	// Redirect the trailing-slash form instead of rewriting it: Remix renders
	// for the upstream URL, and if the browser's URL differs (/book/ vs /book)
	// its hydration check force-reloads in an infinite loop.
	if (url.pathname === '/book/') {
		return context.redirect(`/book${url.search}`, 308)
	}

	const upstreamPath = url.pathname
	const headers = new Headers(context.request.headers)
	headers.set('X-Brand', BRAND)
	headers.set('X-Forwarded-Host', url.host)
	headers.delete('host')
	// Let fetch negotiate encoding; it transparently decompresses, and passing
	// the original accept-encoding through would double-encode the response.
	headers.delete('accept-encoding')

	const hasBody = !['GET', 'HEAD'].includes(context.request.method)
	const response = await fetch(`${UPSTREAM}${upstreamPath}${url.search}`, {
		method: context.request.method,
		headers,
		body: hasBody ? context.request.body : undefined,
		redirect: 'manual',
		// Node fetch requires duplex for streamed request bodies.
		...(hasBody ? { duplex: 'half' as const } : {}),
	})

	const responseHeaders = new Headers(response.headers)
	for (const header of HOP_BY_HOP_RESPONSE_HEADERS) {
		responseHeaders.delete(header)
	}
	return new Response(response.body, {
		status: response.status,
		headers: responseHeaders,
	})
}
