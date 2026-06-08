import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, User, ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Logo from "./Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";

const FIXED_MENU = [
  { label: "Todos", href: "/catalogo" },
  { 
    label: "Vestidos", 
    href: "/catalogo/vestidos", 
    categorySlug: "vestidos",
    children: [
      { label: "Vestidos Longos", href: "/catalogo/vestidos-longos" },
      { label: "Vestidos Curtos", href: "/catalogo/vestidos-curtos" },
      { label: "Ver todos os vestidos", href: "/catalogo/vestidos" }
    ]
  },
  { label: "Partes de Cima", href: "/catalogo/partes-de-cima", categorySlug: "partes-de-cima" },
  { label: "Partes de Baixo", href: "/catalogo/partes-de-baixo", categorySlug: "partes-de-baixo" },
  { label: "Biquínis", href: "/catalogo/biquinis", categorySlug: "biquinis" },
  { label: "Conjuntos", href: "/catalogo/conjuntos", categorySlug: "conjuntos" },
  { label: "Lançamentos", href: "/catalogo/lancamentos" },
  { label: "Promoção", href: "/catalogo/promocao", highlight: true },
];

interface MenuItem {
  label: string;
  href: string;
  categorySlug?: string;
  highlight?: boolean;
  children?: { label: string; href: string }[];
}

export default function Header() {
  const { count, open } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");
  const [subcategories, setSubcategories] = useState<Record<string, any[]>>({});
  const [menu, setMenu] = useState<MenuItem[]>(FIXED_MENU);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch subcategories on mount
  useEffect(() => {
    const fetchSubcategories = async () => {
      const token = localStorage.getItem("numar.token");
      if (!token) {
        setMenu(FIXED_MENU);
        return;
      }
      try {
        const data = await api.get("/admin/subcategories");
        if (!data) return;
        const subs = data.subcategories || [];
        
        // Group subcategories by category_slug
        const grouped: Record<string, any[]> = {};
        subs.forEach((sub: any) => {
          if (!grouped[sub.category_slug]) {
            grouped[sub.category_slug] = [];
          }
          grouped[sub.category_slug].push(sub);
        });
        
        setSubcategories(grouped);
        
        // Update menu with dynamic subcategories
        const updatedMenu = FIXED_MENU.map((item) => {
          if (!item.categorySlug) return item;
          
          const categorySubs = grouped[item.categorySlug] || [];
          if (categorySubs.length === 0) return item;
          
          // If category already has hardcoded children (Vestidos), merge with dynamic
          if (item.children && item.children.length > 0) {
            // Merge hardcoded children with dynamic subcategories
            const dynamicChildren = categorySubs.map((sub: any) => ({
              label: sub.name,
              href: `/catalogo/${item.categorySlug}?sub=${sub.slug}`
            }));
            
            // Keep hardcoded children, add dynamic ones before "Ver todos"
            const hardcodedChildren = item.children.filter(c => !c.label.includes("Ver todos"));
            const verTodos = item.children.find(c => c.label.includes("Ver todos"));
            
            // Filter dynamicChildren to remove duplicates based on label
            const hardcodedLabels = new Set(hardcodedChildren.map(c => c.label));
            const dynamicChildrenFiltered = dynamicChildren.filter(dc => !hardcodedLabels.has(dc.label));
            
            return {
              ...item,
              children: [
                ...hardcodedChildren,
                ...dynamicChildrenFiltered,
                verTodos || { label: `Ver todos os ${item.label.toLowerCase()}`, href: item.href }
              ]
            };
          }
          
          // If no hardcoded children, add dynamic ones
          return {
            ...item,
            children: [
              ...categorySubs.map((sub: any) => ({
                label: sub.name,
                href: `/catalogo/${item.categorySlug}?sub=${sub.slug}`
              })),
              { label: `Ver todos os ${item.label.toLowerCase()}`, href: item.href }
            ]
          };
        });
        
        setMenu(updatedMenu);
      } catch (err) {
        console.error("Error fetching subcategories, using fallback:", err);
        // Keep using FIXED_MENU as fallback
        setMenu(FIXED_MENU);
      }
    };
    
    fetchSubcategories();
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate(`/busca?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setQ("");
    }
  };

  return (
    <header className={`sticky top-0 z-40 transition-all ${scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : "bg-background"}`}>
      <div className="container-numar flex items-center justify-between h-16 md:h-20 gap-4">

        {/* Mobile menu */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button aria-label="Menu" className="p-2 -ml-2"><Menu className="h-6 w-6" /></button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85%] sm:max-w-sm bg-background overflow-y-auto">
            <Logo className="mb-6" />
            <Accordion type="multiple" className="w-full">
              {menu.map((m) =>
                m.children ? (
                  <AccordionItem value={m.label} key={m.label}>
                    <AccordionTrigger className="text-sm uppercase tracking-wider">{m.label}</AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-1 pl-2">
                        {m.children.map((c) => (
                          <li key={c.label}>
                            <Link to={c.href} onClick={() => setMobileOpen(false)}
                              className="block py-2 text-sm text-foreground/80 hover:text-primary">{c.label}</Link>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                ) : (
                  <Link key={m.label} to={m.href} onClick={() => setMobileOpen(false)}
                    className={`block py-3 text-sm uppercase tracking-wider border-b border-border ${m.highlight ? "text-destructive font-semibold" : ""}`}>
                    {m.label}
                  </Link>
                )
              )}
            </Accordion>
          </SheetContent>
        </Sheet>

        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0 flex-1 justify-center">
          {menu.map((m) => (
            <div key={m.label} className="relative group">
              <Link to={m.href}
                className={`px-2 lg:px-3 py-2 text-[11px] lg:text-xs uppercase tracking-wider font-medium hover:text-primary transition-colors whitespace-nowrap ${m.highlight ? "text-destructive" : ""}`}>
                {m.label}
              </Link>
              {m.children && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[210px] z-50">
                  <div className="bg-card shadow-lg border border-border py-2">
                    {m.children.map((c) => (
                      <Link key={c.label} to={c.href}
                        className="block px-5 py-2.5 text-sm hover:bg-muted hover:text-primary transition-colors">
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Buscar" className="p-2 hover:text-primary transition-colors">
            <Search className="h-5 w-5" />
          </button>
          <Link to="/conta" aria-label="Minha conta" className="p-2 hover:text-primary transition-colors">
            <User className="h-5 w-5" />
          </Link>
          <button onClick={open} aria-label="Sacola" className="relative p-2 hover:text-primary transition-colors">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border bg-background">
          <form onSubmit={submitSearch} className="container-numar py-3 flex gap-2 items-center">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar produtos..." className="border-0 focus-visible:ring-0 shadow-none bg-transparent" />
            <Button type="submit" variant="default" size="sm">Buscar</Button>
            <button type="button" onClick={() => setSearchOpen(false)} aria-label="Fechar" className="p-1 hover:text-primary">
              <X className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
