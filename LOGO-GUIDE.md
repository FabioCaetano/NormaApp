# 🎨 Guia de Atualização da Logo

Este documento explica como atualizar a logo da Norma Brasil em todo o projeto.

## 📍 Localização da Logo

A logo principal está localizada em:
```
frontend/public/logo-norma.png
```

## 🔄 Como Substituir a Logo

### Opção 1: Substituir a Imagem
1. Salve sua nova logo como `logo-norma.png` na pasta `frontend/public/`
2. Substitua o arquivo existente
3. O projeto automaticamente usará a nova imagem

### Opção 2: Usar Nome Diferente
Se quiser usar um nome diferente:

1. Salve a nova logo com o nome desejado em `frontend/public/`
2. Atualize os seguintes arquivos:

#### Arquivos que Referenciam a Logo:

**1. `frontend/index.html`** (Favicon)
```html
<link rel="icon" type="image/png" href="/logo-norma.png" />
```

**2. `frontend/src/components/Header.jsx`**
```jsx
<img src="/logo-norma.png" alt="Norma Brasil Barbearia" />
```

**3. `frontend/src/components/Footer.jsx`**
```jsx
<img src="/logo-norma.png" alt="Norma Brasil" />
```

**4. `frontend/src/components/Loading.jsx`**
```jsx
<img src="/logo-norma.png" alt="Norma Brasil" />
```

**5. `frontend/src/pages/auth/Login.jsx`**
```jsx
<img src="/logo-norma.png" alt="Norma Brasil Barbearia" />
```

**6. `frontend/src/pages/auth/Register.jsx`**
```jsx
<img src="/logo-norma.png" alt="Norma Brasil Barbearia" />
```

**7. `frontend/src/pages/Home.jsx`** (Hero Section)
```jsx
<img src="/logo-norma.png" alt="Norma Brasil Barbearia" />
```

**8. `frontend/src/pages/Dashboard.jsx`** (Avatar do Cliente)
```jsx
<img src="/logo-norma.png" alt="Norma Brasil" />
```

**9. `frontend/src/pages/admin/Admin.jsx`** (Avatares de Clientes e Leads)
```jsx
<img src="/logo-norma.png" alt="Norma Brasil" />
```

## 🎨 Favicon SVG Alternativo

Também existe um favicon SVG em:
```
frontend/public/logo-icon.svg
```

Este é um favicon alternativo baseado nos elementos da logo (verde + dourado + tesouras).

## 📐 Tamanhos Recomendados

Para melhor qualidade visual:
- **Logo PNG**: Mínimo 512x512px
- **Formato**: PNG com fundo transparente
- **Proporção**: Quadrada (1:1)

## 🎯 Elementos Visuais da Logo Atual

A logo atual apresenta:
- ✅ Dois barbeiros (masculino e feminino)
- ✅ Barber pole clássico (vermelho, branco e azul)
- ✅ Selo verde premium com 5 estrelas
- ✅ Tesouras cruzadas
- ✅ Faixa dourada com "NORMA"
- ✅ Texto "BRASIL BARBERSHOP • HAIRSTYLES"

## 🚀 Após Atualizar

Após substituir a logo:
1. Reinicie o servidor de desenvolvimento
2. Limpe o cache do navegador (Ctrl+Shift+R)
3. Verifique se a logo aparece corretamente em todas as páginas

## 📝 Checklist de Verificação

Após atualizar, verifique se a logo aparece em:
- [ ] Header (topo do site)
- [ ] Footer (rodapé)
- [ ] Tela de Login
- [ ] Tela de Registro
- [ ] Hero Section (Home)
- [ ] Dashboard do Cliente
- [ ] Painel Administrativo
- [ ] Favicon (aba do navegador)
- [ ] Loading Screen

## 💡 Dica

Para garantir consistência visual:
- Use sempre uma logo com fundo transparente
- Mantenha proporção quadrada
- Prefira formato PNG para melhor qualidade
- Teste em diferentes tamanhos de tela
