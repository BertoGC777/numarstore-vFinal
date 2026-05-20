import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import p1 from "@/assets/products/biquini-rosa.jpeg";
import p2 from "@/assets/products/conjunto-cropped-saia-2.jpeg";
import p3 from "@/assets/products/saia-longa-preta-1.jpeg";
import p4 from "@/assets/products/cropped2-amarelo.jpeg";
import p5 from "@/assets/products/blusinha1-vermelha.jpeg";
import p6 from "@/assets/products/short-saia-marrom.jpeg";
import Image from "@/components/Image";

const photos = [p1, p2, p3, p4, p5, p6];

export default function InstagramSection() {
  return (
    <section className="bg-foreground py-12 md:py-16">
      <div className="container-numar">
        <div className="text-center mb-8">
          <h2 className="font-serif text-3xl md:text-4xl mb-2 text-background">@use.numar no Instagram</h2>
          <a href="https://instagram.com/use.numar" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <Instagram className="h-4 w-4" /> use.numar
          </a>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 md:gap-2 mb-8">
          {photos.map((src, i) => (
            <a key={i} href="https://instagram.com/use.numar" target="_blank" rel="noreferrer" className="group relative block aspect-square overflow-hidden bg-muted">
              <Image
                src={src}
                alt="Numar Store"
                width={400}
                height={400}
                aspectRatio="square"
                objectFit="contain"
                loading="lazy"
                className="w-full h-full group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
                <Instagram className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
            </a>
          ))}
        </div>
        <div className="text-center">
          <Button asChild variant="outline" className="bg-background text-foreground hover:bg-background/90">
            <a href="https://instagram.com/use.numar" target="_blank" rel="noreferrer">
              Seguir no Instagram
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
