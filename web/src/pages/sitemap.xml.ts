import type { APIRoute } from 'astro';
import { ProductService } from '../services/product.service';

export const GET: APIRoute = async () => {
  const products = await ProductService.getProducts();
  const baseUrl = 'https://cortiglow.com';
  const now = new Date().toISOString();
  
  const productList = products || [];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home Page -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Product Pages -->
  ${productList.map(product => `
  <url>
    <loc>${baseUrl}/producto/${product.id}</loc>
    <lastmod>${product.updated_at ? new Date(product.updated_at).toISOString() : now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
  
  <!-- Category Pages -->
  <url>
    <loc>${baseUrl}/categoria/iluminacion</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/categoria/cortinas</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  
  <!-- Contact Page -->
  <url>
    <loc>${baseUrl}/contacto</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  
  <!-- About Page -->
  <url>
    <loc>${baseUrl}/nosotros</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};