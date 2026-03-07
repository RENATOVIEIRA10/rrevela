

## Plano: Corrigir Painel Admin

### Problemas Identificados

1. **Erro de build** em `import-bible/index.ts:210` — `error` é `unknown`, precisa de cast.
2. **Sem role admin no banco** — a tabela `user_roles` está vazia. O `useAuth` reconhece `renatovieiraaurelio@gmail.com` como admin via `FORCED_ADMIN_EMAIL`, mas a edge function `admin-metrics` também precisa encontrar o role no banco (ou usar o fallback de email forçado, que já existe no código).
3. **Edge function não retorna vários campos** que o UI espera: `growthData`, `users`, `recentShares`, `revelationMode`, `revelaVerse`, `totalNotes`, `noteUserPct`. Esses campos ficam zerados/vazios.
4. **`config.toml` não tem `verify_jwt = false`** para a edge function `admin-metrics`, o que pode causar falha de autenticação.

### Correções

#### 1. Fix build error (`import-bible/index.ts:210`)
Mudar `error.message` para `(error as Error).message`.

#### 2. Inserir role admin no banco
Inserir registro na tabela `user_roles` com `user_id = '5f810f1b-d3c9-4c49-ad6f-c98d2206a804'` e `role = 'admin'`.

#### 3. Adicionar `verify_jwt = false` no `config.toml`
Adicionar configuração para `admin-metrics` (e outras edge functions que precisam).

#### 4. Completar a edge function `admin-metrics`
Adicionar as métricas que faltam:
- **`growthData`**: Query `profiles` agrupando por `created_at::date` nos últimos 30 dias.
- **`users`**: Query `profiles` + dados de `auth.users` (via service role admin API) para listar nome, email, criação, último acesso.
- **`recentShares`**: Query `shared_verses` com limit 20, ordenado por `created_at desc`.
- **`revelationMode`**: Contar eventos com `event_type` in `('revelation_mode', 'verse_reveal')`.
- **`revelaVerse`**: Contar eventos `verse_reveal`.
- **`totalNotes`**: Já existe como `notes_created`, reutilizar.
- **`noteUserPct`**: Contar usuários distintos com notas / total de usuários × 100.

#### 5. Atualizar `Admin.tsx`
Mapear os novos campos da resposta da edge function para o state `metrics`.

### Arquivos a editar
- `supabase/functions/import-bible/index.ts` (fix build error)
- `supabase/functions/admin-metrics/index.ts` (adicionar métricas faltantes)
- `src/pages/Admin.tsx` (mapear novos campos)
- Inserir admin role via insert tool
- `supabase/config.toml` não pode ser editado manualmente (auto-gerado)

