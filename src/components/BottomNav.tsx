import { useLocation, Link } from "react-router-dom";
import { Home, Grid, Search, User, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function BottomNav() {
  const location = useLocation();
  const { count } = useCart();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/catalogo", icon: Grid, label: "Catálogo" },
    { path: "/busca", icon: Search, label: "Busca" },
    { path: "/conta", icon: User, label: "Conta" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 pb-safe block md:hidden">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path === "/" && location.pathname === "/");
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
        
        <Link
          to="#"
          onClick={(e) => {
            e.preventDefault();
            const cartButton = document.querySelector('[aria-label="Sacola"]') as HTMLButtonElement;
            cartButton?.click();
          }}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-muted-foreground transition-colors relative"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px]">Sacola</span>
          {count > 0 && (
            <span className="absolute top-2 right-6 bg-primary text-primary-foreground text-[10px] font-semibold rounded-full h-4 w-4 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
}
