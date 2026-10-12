import { apiRequest } from './client'

export interface Link {
    code: string
    url: string
    shortUrl: string
    clicks: number
    // JSON has no Date type, so the API sends an ISO string
    createdAt: string
}

export interface LinkList {
    links: Link[]
    page: number
    limit: number
    total: number
}

export interface LinkStats {
    code: string
    url: string
    totalClicks: number
    daily: { date: string; clicks: number }[]
}

export const linkApi = {
    createLink: (url: string) => apiRequest<Link>('/links', { method: 'POST', body: JSON.stringify({ url }) }),

    listLinks: (page = 1, limit = 10) => apiRequest<LinkList>(`/links?page=${page}&limit=${limit}`),

    deleteLink: (code: string) => apiRequest<void>(`/links/${code}`, { method: 'DELETE' }),

    getStats: (code: string) => apiRequest<LinkStats>(`/links/${code}/stats`),
}
