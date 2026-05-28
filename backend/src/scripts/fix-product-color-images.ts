import { getDatabase, dbRun, dbAll } from "../db";

async function fixProductColorImages() {
  await getDatabase();

  console.log("🔍 Corrigindo imagens por cor...");

  // Mapeamento correto de produto + cor -> imagem
  const colorMapping: Record<string, Record<string, string>> = {
    "biquini-amarelo": {
      "Amarelo": "biquini-amarelo.jpeg",
      "Azul": "biquini-azul.jpeg",
      "Ciano": "biquini-ciano.jpeg",
      "Rosa Bebê": "biquini-rosa.jpeg"
    },
    "blusa-bella-vibe": {
      "Branco": "bella-vibe-branco.jpg",
      "Preto": "bella-vibe-preto.jpg",
      "Vermelho": "bella-vibe-vermelho.jpg"
    },
    "blusa-night": {
      "Marrom": "blusa-night-marrom.jpg",
      "Preto": "blusa-night-preta.jpg"
    },
    "conjunto-cropped-saia": {
      "Amarelo": "conjunto-cropped-saia-1.jpeg"
    },
    "cropped-verao": {
      "Branco": "cropped-verao-branco.jpg",
      "Preto": "cropped-verao-preto.jpg",
      "Amarelo": "cropped-verao-amarelo.jpg"
    },
    "cropped-divine": {
      "Amarelo": "cropped-divine-amarelo.jpg",
      "Azul": "cropped-divine-azul.jpg",
      "Preto": "cropped-divine-preto.jpg"
    },
    "saia-longa": {
      "Preto": "saia-longa-preta-1.jpeg",
      "Branco": "saia-longa-branca-1.jpeg"
    },
    "short-saia": {
      "Branco": "short-saia-branco.jpeg",
      "Marrom": "short-saia-marrom.jpeg",
      "Preto": "short-saia-preto.jpeg"
    },
    "saia-charme": {
      "Branco": "saia-charme-branco.jpg",
      "Vermelho": "saia-charme-vermelho.jpg"
    },
    "conjunto-vibe": {
      "Verde": "conjunto-vibe-verde.jpg",
      "Vermelho": "conjunto-vibe-vermelho.jpg",
      "Branco": "conjunto-vibe-branco.jpg"
    },
    "conjunto-luau": {
      "Amarelo": "conjunto-luau-1.jpg"
    },
    "conjunto-night": {
      "Vermelho": "conjunto-night-vermelho.jpg",
      "Branco": "conjunto-night-branco.jpg"
    },
    "conjunto-night-curto": {
      "Preto": "conjunto-night-curto-preto.jpg"
    },
    "conjunto-style": {
      "Amarelo": "conjunto-style-amarelo.jpg",
      "Preto": "conjunto-style-preto.jpg",
      "Rosa": "conjunto-style-rosa.jpg"
    },
    "conjunto-divine": {
      "Amarelo": "conjunto-divine.jpg"
    },
    "vestido-sereia": {
      "Rosa": "vestido-sereia-rosa-1.jpg",
      "Amarelo": "vestido-sereia-amarelo-1.jpg",
      "Azul": "vestido-sereia-azul-1.jpg"
    },
    "vestido-brisa": {
      "Amarelo": "vestido-brisa-amarelo-1.jpg",
      "Rosa": "vestido-brisa-rosa-1.jpg",
      "Azul": "vestido-brisa-azul-1.jpg"
    },
    "vestido-alma": {
      "Branco": "vestido-alma-branco.jpg",
      "Preto": "vestido-alma-preto.jpg",
      "Vermelho": "vestido-alma-vermelho.jpg"
    },
    "vestido-elegance": {
      "Preto": "vestido-elegance-preto.jpg",
      "Branco": "vestido-elegance-branco.jpg"
    },
    "vestido-costas-nua": {
      "Verde": "vestido-costas-nua-verde.jpg",
      "Marrom": "vestido-costas-nua-marrom.jpg"
    }
  };

  const products = await dbAll(`SELECT id, slug FROM products`);
  let updatedCount = 0;

  for (const product of products) {
    const mapping = colorMapping[product.slug];
    if (!mapping) {
      console.log(`⚠️  Sem mapeamento para ${product.slug}`);
      continue;
    }

    const images = await dbAll(`SELECT id, color FROM product_images WHERE product_id = ?`, [product.id]);

    for (const img of images) {
      const expectedImage = mapping[img.color];
      if (!expectedImage) {
        console.log(`⚠️  Sem imagem para ${product.slug} - ${img.color}`);
        continue;
      }

      const newUrl = `http://localhost:3001/images/${expectedImage}`;
      await dbRun(`UPDATE product_images SET url = ? WHERE id = ?`, [newUrl, img.id]);
      console.log(`✅ ${product.slug} - ${img.color}: ${expectedImage}`);
      updatedCount++;
    }
  }

  console.log(`\n✅ ${updatedCount} imagens atualizadas`);
}

fixProductColorImages().catch(err => {
  console.error("❌ Erro ao corrigir imagens:", err);
  process.exit(1);
});
