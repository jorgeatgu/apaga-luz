# Acción 4 — Redirects

- `https://www.apaga-luz.com/Blog` → 404. Ahrefs le atribuye 22 visitas/mes y posiciona para "precio luz hoy energia xxi" (1,9K vol, pos 13). Redirigir 301 a `/noticias/`.
- `https://www.apaga-luz.com/precio-luz-manana` (sin barra) → 200, 55 dominios de referencia. Canonical correcta, pero forzar 301 a `/precio-luz-manana/`.
- Revisar en Ahrefs > Backlinks rotos si hay más URLs antiguas con enlaces (histórico 1.200 dominios ref, ahora 574).

**PROMPT**
```
Añade a vercel.json (convención existente: routes con status 301 y header Location) redirects de /Blog y /blog a /noticias/ y de /precio-luz-manana (sin barra) a /precio-luz-manana/. Comprueba que no rompen la ruta con barra y haz commit.
```
