## Objetivo

Adicionar os produtos do catálogo Canva (https://canva.com/design/DAHISBSjwjc) ao site, **sem remover** os produtos existentes, perguntando antes de adicionar cada um.

## Decisões já confirmadas

- Fotos do Canva (com marca d'água) podem ser usadas agora; lembrarei você de enviar as originais depois
- Preço cartão = preço pix + 10%
- **Não** mencionar frete grátis em nenhum lugar do site
- Pular fotos de produtos que já existem no site
- Manter os 22 produtos do catálogo, perguntando 1 a 1

## Memórias a salvar (ao iniciar a implementação)

- `mem://index.md` — regras core do projeto (Instagram @use.numar, WhatsApp, taxa cartão 10%, sem frete grátis, só fotos próprias)
- `mem://pendencias.md` — fotos sem marca d'água + banners do HeroCarousel pendentes
- `mem://catalogo-canva.md` — link e estrutura do catálogo

## Fluxo de execução

1. **Salvar memórias** acima
2. **Para cada categoria do catálogo** (Partes de cima → Conjuntos → Vestidos longos → Vestidos curtos → Biquínis), eu te apresento uma pergunta multi-seleção com:
   - Nome do produto detectado
   - Preço pix do catálogo (e cartão calculado +10%)
   - Categoria sugerida no site
   - Você marca quais quer adicionar
3. **Para cada produto aprovado**:
   - Baixar a imagem do Canva → salvar em `src/assets/products/`
   - Adicionar entrada em `src/data/products.ts` (com slug único, cores, tamanho "Único", descrição curta gerada a partir do nome)
   - Marcar `isNew: true` (são lançamentos novos no site)
4. **Adicionar nova categoria "Vestidos"** ao tipo `ProductCategory` (já existe no type, só não tem produto) e ao menu Header + Catalog labels
5. **TopBar promocional**: adicionar "10% OFF na primeira compra" (sem frete grátis) na rotação atual

## Produtos detectados (pré-aprovação)

### Partes de Cima — categoria `partes-de-cima`
1. Blusa sol — R$45 (amarela) — *parecida com Cropped Amarelo já existente; vou perguntar se é a mesma*
2. Blusa meia lua — R$45 (terracota/laranja)
3. Cropped verão — R$45 (vem em preto/branco/off/vermelho)
4. Cropped night — R$45 (preto)
5. Cropped bella vibe — R$50 (preto)

### Conjuntos — categoria `conjuntos`
6. Maison chic — R$45 (cropped + saia branca) *— preço baixo demais para conjunto, vou confirmar*
7. Divine look — R$45 (cropped + saia off-white) *— idem*
8. Conjunto vibe — R$110 (verde/vermelho/branco)
9. Conjunto luau — R$110 (amarelo)
10. Conjunto night (saia longa) — R$100 (vermelho/branco/verde)
11. Conjunto night (saia curta) — R$110 (preto/marrom/branco)
12. Conjunto divine — R$90 (azul claro)
13. Conjunto style — R$90 (preto)

### Vestidos longos — nova categoria `vestidos`
14. Vestido costas nua — R$110 (branco/verde/vermelho)
15. Vestido brisa — R$110 (amarelo)
16. Vestido sereia — R$110 (rosa)

### Vestidos curtos — categoria `vestidos`
17. Vestido alma — R$90 (branco/verde/vermelho)
18. Vestido elegance — R$110 (terracota/branco/preto)
19. Vestido charme — R$90 (verde/vermelho/branco)

### Biquínis — categoria `biquinis`
20. Biquíni azul bebê — R$30
21. Biquíni vermelho — R$30
22. Biquíni azul escuro — R$30
23. Biquíni preto — R$30

### Pulados (já existem no site)
- Biquíni amarelo, Biquíni rosa bebê (já temos amarelo/rosa/azul/ciano)

## Ajustes adicionais

- **`src/components/Header.tsx`**: adicionar link "Vestidos" entre "Conjuntos" e "Promoção"
- **`src/pages/Catalog.tsx`**: adicionar label "Vestidos" no filtro
- **`src/components/CategoryShortcuts.tsx`**: opcionalmente trocar "Lançamentos" por "Vestidos" (te pergunto)
- **`src/components/TopBar.tsx`**: adicionar mensagem "10% OFF na sua primeira compra" rotativa

## Fora deste plano

- Substituir banners do HeroCarousel (Unsplash) — fica para quando você enviar fotos wide
- Substituir fotos do Canva pelas originais sem marca d'água — fica para quando você enviar
